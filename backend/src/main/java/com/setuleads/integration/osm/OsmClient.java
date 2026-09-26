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
        "https://overpass.private.coffee/api/interpreter"
    };

    private final RestTemplate restTemplate;
    private final RestTemplate fastOsmRestTemplate;
    private final ObjectMapper objectMapper;

    public OsmClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(1500); // 1.5s connect timeout
        factory.setReadTimeout(2500);    // 2.5s read timeout per mirror (max 7.5s across all mirrors)
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
        return searchOsm(query, location, areaName, null);
    }

    public OsmSearchResult searchOsm(String query, String location, String areaName, double[] preResolvedBbox) {
        List<CandidateDTO> candidates = new ArrayList<>();
        int passes = 1;
        String status = "SUCCESS_ZERO_RESULTS";

        double[] bbox = preResolvedBbox;
        if (bbox == null) {
            logger.info("OSM SEARCH: No pre-resolved bbox provided for '{}', attempting Nominatim geocode fallback", location);
            bbox = geocodeBbox(location);
        }

        if (bbox == null) {
            logger.warn("OSM SEARCH: Geocoding failed for location='{}' (both Geoapify and Nominatim unavailable or returned 0 results)", location);
            return new OsmSearchResult(Collections.emptyList(), 1, "LOCATION_GEOCODE_FAILED");
        }

        try {
            // Spatial Overpass QL Query using resolved bounding box
            double south = bbox[0];
            double west = bbox[1];
            double north = bbox[2];
            double east = bbox[3];

            String bboxStr = String.format(Locale.US, "%f,%f,%f,%f", south, west, north, east);
            String overpassQl = String.format(Locale.US,
                    "[out:json][timeout:2];" +
                    "(" +
                    "  node[\"office\"][\"name\"](%s);" +
                    "  way[\"office\"][\"name\"](%s);" +
                    "  node[\"shop\"][\"name\"](%s);" +
                    "  way[\"shop\"][\"name\"](%s);" +
                    "  node[\"amenity\"][\"name\"](%s);" +
                    "  way[\"amenity\"][\"name\"](%s);" +
                    ");" +
                    "out center qt 200;",
                    bboxStr, bboxStr, bboxStr, bboxStr, bboxStr, bboxStr);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("User-Agent", "SetuLeads/1.0 (contact@setuleads.internal)");
            HttpEntity<String> entity = new HttpEntity<>("data=" + overpassQl, headers);

            for (String endpoint : OVERPASS_URLS) {
                try {
                    ResponseEntity<String> response = fastOsmRestTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode root = objectMapper.readTree(response.getBody());
                        JsonNode elements = root.path("elements");
                        if (elements.isArray()) {
                            for (JsonNode element : elements) {
                                CandidateDTO candidate = mapElementToCandidate(element, query, areaName);
                                if (candidate != null) {
                                    candidates.add(candidate);
                                }
                            }
                        }
                        break;
                    }
                } catch (Exception ex) {
                    logger.debug("OSM Overpass mirror {} skipped: {}", endpoint, ex.getMessage());
                }
            }

            if (candidates.isEmpty()) {
                List<CandidateDTO> nomCandidates = searchNominatimDirect(query, location, areaName);
                if (!nomCandidates.isEmpty()) {
                    candidates.addAll(nomCandidates);
                }
            }

            if (!candidates.isEmpty()) {
                status = "SUCCESS_WITH_RESULTS";
            }

        } catch (Exception e) {
            logger.warn("OSM SEARCH EXCEPTION for query='{}', location='{}': {}", query, location, e.getMessage());
            if (candidates.isEmpty()) {
                status = "SUCCESS_ZERO_RESULTS";
            }
        }

        return new OsmSearchResult(candidates, passes, status);
    }

    private List<CandidateDTO> searchNominatimDirect(String query, String location, String areaName) {
        String searchTerms = (query + " " + location).trim();
        return searchNominatimUrl(searchTerms, query, areaName);
    }

    private List<CandidateDTO> searchNominatimUrl(String searchTerms, String sourceQuery, String areaName) {
        List<CandidateDTO> candidates = new ArrayList<>();
        try {
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                    .queryParam("q", searchTerms)
                    .queryParam("format", "json")
                    .queryParam("limit", 50)
                    .queryParam("addressdetails", "1")
                    .build().toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "SetuLeads/1.0 (contact@setuleads.internal)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray()) {
                    for (JsonNode item : root) {
                        String name = item.path("display_name").asText("");
                        if (name.isEmpty()) continue;

                        double lat = item.path("lat").asDouble(0.0);
                        double lon = item.path("lon").asDouble(0.0);
                        if (lat == 0.0 || lon == 0.0) continue;

                        long osmId = item.path("osm_id").asLong(0);
                        String osmType = item.path("osm_type").asText("node");

                        CandidateDTO dto = new CandidateDTO();
                        dto.setId("osm_nom_" + (osmId != 0 ? osmId : UUID.randomUUID().toString()));
                        dto.setOsmType(osmType);
                        dto.setOsmId(String.valueOf(osmId));

                        String shortName = item.path("name").asText("");
                        if (shortName.isEmpty() && name.contains(",")) {
                            shortName = name.split(",")[0].trim();
                        }
                        dto.setBusinessName(!shortName.isEmpty() ? shortName : name);
                        dto.setAddress(name);
                        dto.setLatitude(lat);
                        dto.setLongitude(lon);
                        dto.setCategories(List.of("commercial.business", "office", "shop"));
                        dto.setBusinessStatus("OPERATIONAL");
                        dto.setSourceQuery(sourceQuery);
                        dto.setProvider("OPENSTREETMAP");
                        dto.setAreaName(areaName);

                        candidates.add(dto);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Nominatim direct search fallback exception for '{}': {}", searchTerms, e.getMessage());
        }
        return candidates;
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

    public double[] geocodeBbox(String location) {
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
            logger.info("NOMINATIM GEOCODE: location='{}', httpStatus={}", location, response.getStatusCode());

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
                        double lat = first.path("lat").asDouble((south + north) / 2.0);
                        double lon = first.path("lon").asDouble((west + east) / 2.0);
                        return new double[]{south, west, north, east, lat, lon};
                    }
                } else {
                    logger.warn("NOMINATIM GEOCODE: zero results for location='{}' (empty array response)", location);
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("NOMINATIM GEOCODE HTTP ERROR [{}] for '{}': {}", e.getStatusCode(), location, e.getResponseBodyAsString());
        } catch (org.springframework.web.client.ResourceAccessException e) {
            logger.error("NOMINATIM GEOCODE NETWORK/TIMEOUT for '{}': {}", location, e.getMessage());
        } catch (Exception e) {
            logger.error("NOMINATIM GEOCODE UNEXPECTED ERROR for '{}': {}", location, e.getMessage(), e);
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
