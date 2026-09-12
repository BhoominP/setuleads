package com.setuleads.integration.osm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.setuleads.dto.CandidateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Component
public class OsmClient {

    private static final Logger logger = LoggerFactory.getLogger(OsmClient.class);
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final String[] OVERPASS_URLS = {
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    };

    private final RestTemplate restTemplate;
    private final RestTemplate fastOsmRestTemplate;
    private final ObjectMapper objectMapper;

    public OsmClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3500); // 3.5s connect timeout
        factory.setReadTimeout(5000);    // 5s read timeout per mirror
        this.fastOsmRestTemplate = new RestTemplate(factory);
    }

    public static class OsmSearchResult {
        public List<CandidateDTO> candidates = new ArrayList<>();
        public int passesExecuted = 0;
        public String status = "NOT_ATTEMPTED";

        public OsmSearchResult(List<CandidateDTO> candidates, int passesExecuted, String status) {
            this.candidates = candidates;
            this.passesExecuted = passesExecuted;
            this.status = status;
        }
    }

    public OsmSearchResult searchOsm(String query, String location, String areaName) {
        List<CandidateDTO> candidates = new ArrayList<>();
        int passes = 0;
        String status = "SUCCESS";

        try {
            // Step 1: Geocode location to bounding box via Nominatim
            double[] bbox = geocodeBbox(location);
            if (bbox == null) {
                logger.warn("OSM SEARCH: Nominatim could not geocode location '{}'", location);
                return new OsmSearchResult(Collections.emptyList(), 0, "LOCATION_GEOCODE_FAILED");
            }

            passes++;

            // Expand small bounding box if needed (minimum 0.08 deg radius ~ 8-10 km radius for city coverage)
            double minLat = bbox[0];
            double minLon = bbox[1];
            double maxLat = bbox[2];
            double maxLon = bbox[3];

            if ((maxLat - minLat) < 0.08) {
                double midLat = (minLat + maxLat) / 2.0;
                minLat = midLat - 0.06;
                maxLat = midLat + 0.06;
            }
            if ((maxLon - minLon) < 0.08) {
                double midLon = (minLon + maxLon) / 2.0;
                minLon = midLon - 0.06;
                maxLon = midLon + 0.06;
            }

            // Bounding box format for Overpass: south, west, north, east
            String bboxStr = String.format(Locale.US, "%f,%f,%f,%f", minLat, minLon, maxLat, maxLon);

            // Construct ultra-fast Overpass QL query with QuadTile (qt) spatial indexing
            String overpassQl = String.format(Locale.US,
                    "[out:json][timeout:10];" +
                    "(" +
                    "  node[\"office\"][\"name\"](%s);" +
                    "  way[\"office\"][\"name\"](%s);" +
                    "  node[\"shop\"][\"name\"](%s);" +
                    "  way[\"shop\"][\"name\"](%s);" +
                    "  node[\"craft\"][\"name\"](%s);" +
                    "  way[\"craft\"][\"name\"](%s);" +
                    "  node[\"amenity\"][\"name\"](%s);" +
                    "  way[\"amenity\"][\"name\"](%s);" +
                    ");" +
                    "out center qt 150;",
                    bboxStr, bboxStr, bboxStr, bboxStr, bboxStr, bboxStr, bboxStr, bboxStr);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("User-Agent", "SetuLeads/1.0 (contact@setuleads.internal)");

            HttpEntity<String> entity = new HttpEntity<>("data=" + overpassQl, headers);

            logger.info("OSM OVERPASS SEARCH: query='{}', location='{}', bbox={}", query, location, bboxStr);

            boolean success = false;
            String lastError = null;

            for (String endpoint : OVERPASS_URLS) {
                try {
                    ResponseEntity<String> response = fastOsmRestTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode root = objectMapper.readTree(response.getBody());
                        JsonNode elements = root.path("elements");

                        int count = 0;
                        if (elements.isArray()) {
                            for (JsonNode element : elements) {
                                CandidateDTO candidate = mapElementToCandidate(element, query, areaName);
                                if (candidate != null) {
                                    candidates.add(candidate);
                                    count++;
                                }
                            }
                        }
                        logger.info("OSM OVERPASS SEARCH: returned {} elements, mapped {} candidates from {}", elements.size(), count, endpoint);
                        status = "SUCCESS";
                        success = true;
                        break;
                    }
                } catch (Exception ex) {
                    lastError = cleanErrorMessage(ex.getMessage());
                    logger.warn("OSM OVERPASS mirror endpoint failed ({}): {}", endpoint, lastError);
                }
            }

            if (!success) {
                status = "OVERPASS_TIMEOUT_FALLBACK: " + (lastError != null ? lastError : "Overpass Server Busy");
            }

        } catch (Exception e) {
            status = "ERROR: " + cleanErrorMessage(e.getMessage());
            logger.error("OSM SEARCH EXCEPTION: {}", e.getMessage(), e);
        }

        return new OsmSearchResult(candidates, passes, status);
    }

    private String cleanErrorMessage(String msg) {
        if (msg == null) return "Overpass Server Busy";
        if (msg.contains("504 Gateway Time-out") || msg.contains("504") || msg.contains("Gateway")) {
            return "Public Overpass Server Gateway Timeout (504)";
        }
        if (msg.contains("502 Bad Gateway") || msg.contains("502")) {
            return "Public Overpass Server Bad Gateway (502)";
        }
        if (msg.contains("Read timed out") || msg.contains("connect timed out") || msg.contains("Timeout")) {
            return "Public Overpass Server Timeout";
        }
        if (msg.contains("<html") || msg.contains("<HTML")) {
            return "Public Overpass Server HTML Error";
        }
        return msg.replaceAll("<[^>]*>", "").trim();
    }

    private double[] geocodeBbox(String location) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                    .queryParam("q", location)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .build().toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SetuLeads/1.0 (contact@setuleads.internal)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray() && root.size() > 0) {
                    JsonNode first = root.get(0);
                    JsonNode boundingbox = first.path("boundingbox");
                    if (boundingbox.isArray() && boundingbox.size() == 4) {
                        double south = boundingbox.get(0).asDouble();
                        double north = boundingbox.get(1).asDouble();
                        double west = boundingbox.get(2).asDouble();
                        double east = boundingbox.get(3).asDouble();
                        return new double[]{south, west, north, east};
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Nominatim geocoding exception: {}", e.getMessage());
        }
        return null;
    }

    private CandidateDTO mapElementToCandidate(JsonNode element, String sourceQuery, String areaName) {
        String type = element.path("type").asText("");
        long id = element.path("id").asLong(0);
        if (id == 0 || type.isEmpty()) return null;

        JsonNode tags = element.path("tags");
        if (!tags.isObject()) return null;

        String name = tags.path("name").asText("");
        if (name.isEmpty()) {
            name = tags.path("brand").asText("");
        }
        if (name.isEmpty()) return null;

        String website = tags.path("website").asText("");
        if (website.isEmpty()) website = tags.path("contact:website").asText("");
        if (website.isEmpty()) website = tags.path("url").asText("");

        String phone = tags.path("phone").asText("");
        if (phone.isEmpty()) phone = tags.path("contact:phone").asText("");

        String address = tags.path("addr:full").asText("");
        if (address.isEmpty()) {
            String street = tags.path("addr:street").asText("");
            String city = tags.path("addr:city").asText("");
            if (!street.isEmpty() || !city.isEmpty()) {
                address = (street + " " + city).trim();
            }
        }

        Double lat = null;
        Double lng = null;
        if (element.has("lat")) {
            lat = element.path("lat").asDouble();
            lng = element.path("lon").asDouble();
        } else if (element.has("center")) {
            lat = element.path("center").path("lat").asDouble();
            lng = element.path("center").path("lon").asDouble();
        }

        List<String> categories = new ArrayList<>();
        if (tags.has("office")) {
            String off = tags.get("office").asText();
            categories.add("office:" + off);
            categories.add("office." + off);
            categories.add("office");
            categories.add(off);
            if (off.equals("it") || off.equals("company") || off.equals("technology")) {
                categories.add("office.it");
                categories.add("office.company");
                categories.add("office.technology");
                categories.add("software");
            }
        }
        if (tags.has("shop")) {
            String shp = tags.get("shop").asText();
            categories.add("shop:" + shp);
            categories.add("shop." + shp);
            categories.add("shop");
            categories.add(shp);
            if (shp.equals("clothes") || shp.equals("boutique") || shp.equals("fashion") || shp.equals("garments")) {
                categories.add("commercial.clothing");
                categories.add("clothing");
            }
            if (shp.equals("bakery") || shp.equals("pastry") || shp.equals("confectionery") || shp.equals("deli") || shp.equals("sweets")) {
                categories.add("commercial.food_and_drink.bakery");
                categories.add("commercial.food_and_drink.confectionery");
                categories.add("bakery");
                categories.add("confectionery");
            }
            if (shp.equals("hairdresser") || shp.equals("beauty") || shp.equals("barber") || shp.equals("cosmetics")) {
                categories.add("service.beauty");
                categories.add("hairdresser");
                categories.add("salon");
            }
            if (shp.equals("photo") || shp.equals("photographer")) {
                categories.add("commercial.photo");
                categories.add("photo");
            }
        }
        if (tags.has("craft")) {
            String crf = tags.get("craft").asText();
            categories.add("craft:" + crf);
            categories.add("craft." + crf);
            categories.add("craft");
            categories.add(crf);
        }
        if (tags.has("amenity")) {
            String am = tags.get("amenity").asText();
            categories.add("amenity:" + am);
            categories.add("amenity." + am);
            categories.add("amenity");
            categories.add(am);
            if (am.equals("restaurant") || am.equals("cafe") || am.equals("fast_food")) {
                categories.add("commercial.food_and_drink");
                categories.add("food_and_drink");
            }
        }

        if (categories.isEmpty()) {
            categories.add("commercial.business");
        }

        CandidateDTO dto = new CandidateDTO();
        dto.setId("osm_" + type + "_" + id);
        dto.setOsmType(type);
        dto.setOsmId(String.valueOf(id));
        dto.setBusinessName(name);
        dto.setAddress(address);
        dto.setPhone(phone);
        dto.setWebsiteUrl(website.isEmpty() ? null : website);
        dto.setLatitude(lat);
        dto.setLongitude(lng);
        dto.setCategories(categories);
        dto.setBusinessStatus("OPERATIONAL");
        dto.setSourceQuery(sourceQuery);
        dto.setProvider("OPENSTREETMAP");
        dto.setAreaName(areaName);

        return dto;
    }
}
