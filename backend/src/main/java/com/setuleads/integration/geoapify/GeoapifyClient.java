package com.setuleads.integration.geoapify;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.setuleads.dto.CandidateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Component
public class GeoapifyClient {

    private static final Logger logger = LoggerFactory.getLogger(GeoapifyClient.class);
    private static final String PLACES_URL = "https://api.geoapify.com/v2/places";
    private static final String GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${geoapify.api-key:}")
    private String apiKey;

    public GeoapifyClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public static class GeoapifySearchResult {
        public List<CandidateDTO> candidates = new ArrayList<>();
        public int requestsCount = 0;
        public String status = "NOT_ATTEMPTED";

        public GeoapifySearchResult(List<CandidateDTO> candidates, int requestsCount, String status) {
            this.candidates = candidates;
            this.requestsCount = requestsCount;
            this.status = status;
        }
    }

    public GeoapifySearchResult searchPlacesGrid(String query, String location, String areaName) {
        return searchPlacesGrid(query, location, areaName, null);
    }

    public GeoapifySearchResult searchPlacesGrid(String query, String location, String areaName, double[] preResolvedBbox) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("GEOAPIFY SEARCH: API key is not configured");
            return new GeoapifySearchResult(Collections.emptyList(), 0, "MISSING_API_KEY");
        }

        double[] centerAndBbox = preResolvedBbox != null ? preResolvedBbox : geocodeLocation(location);
        if (centerAndBbox == null) {
            return searchPlaces(query, location, areaName);
        }

        double centerLat = centerAndBbox.length >= 6 ? centerAndBbox[4] : (centerAndBbox[0] + centerAndBbox[2]) / 2.0;
        double centerLon = centerAndBbox.length >= 6 ? centerAndBbox[5] : (centerAndBbox[1] + centerAndBbox[3]) / 2.0;

        // 4 Spatial Quadrants (North-East, North-West, South-East, South-West offset by ~0.045 degrees ~ 5km)
        double[][] gridPoints = {
            {centerLat, centerLon}, // Center
            {centerLat + 0.045, centerLon + 0.045}, // NE Quadrant
            {centerLat + 0.045, centerLon - 0.045}, // NW Quadrant
            {centerLat - 0.045, centerLon + 0.045}, // SE Quadrant
            {centerLat - 0.045, centerLon - 0.045}  // SW Quadrant
        };

        List<CandidateDTO> allCandidates = Collections.synchronizedList(new ArrayList<>());
        java.util.concurrent.atomic.AtomicInteger totalRequests = new java.util.concurrent.atomic.AtomicInteger(1); // 1 for geocoding
        java.util.concurrent.atomic.AtomicReference<String> cellError = new java.util.concurrent.atomic.AtomicReference<>(null);

        List<java.util.concurrent.CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < gridPoints.length; i++) {
            final double gridLat = gridPoints[i][0];
            final double gridLon = gridPoints[i][1];
            final int cellIndex = i;

            futures.add(java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    String categories = mapQueryToCategories(query);
                    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(PLACES_URL)
                            .queryParam("apiKey", apiKey)
                            .queryParam("limit", 200);

                    if (categories != null && !categories.isEmpty()) {
                        builder.queryParam("categories", categories);
                    } else {
                        builder.queryParam("categories", "commercial,service,office");
                        builder.queryParam("text", query);
                    }

                    builder.queryParam("filter", String.format(Locale.US, "circle:%f,%f,8000", gridLon, gridLat));
                    builder.queryParam("bias", String.format(Locale.US, "proximity:%f,%f", gridLon, gridLat));

                    String url = builder.build().toUriString();
                    totalRequests.incrementAndGet();

                    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity.EMPTY, String.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode root = objectMapper.readTree(response.getBody());
                        JsonNode features = root.path("features");
                        if (features.isArray()) {
                            for (JsonNode feature : features) {
                                CandidateDTO candidate = mapFeatureToCandidate(feature, query, areaName);
                                if (candidate != null) {
                                    allCandidates.add(candidate);
                                }
                            }
                        }
                    } else {
                        cellError.set("HTTP_" + response.getStatusCode().value());
                    }
                } catch (HttpStatusCodeException ex) {
                    cellError.set("HTTP_ERROR_" + ex.getStatusCode().value() + ": " + ex.getResponseBodyAsString());
                    logger.warn("Geoapify Grid Cell {} HTTP error: {}", cellIndex, ex.getMessage());
                } catch (Exception ex) {
                    cellError.set("ERROR: " + ex.getMessage());
                    logger.warn("Geoapify Grid Cell {} error: {}", cellIndex, ex.getMessage());
                }
            }));
        }

        try {
            java.util.concurrent.CompletableFuture.allOf(futures.toArray(new java.util.concurrent.CompletableFuture[0])).join();
        } catch (Exception e) {
            logger.warn("Geoapify Grid search join error: {}", e.getMessage());
        }

        logger.info("GEOAPIFY GRID SEARCH: harvested {} raw candidates across {} cells", allCandidates.size(), gridPoints.length);

        String status;
        if (!allCandidates.isEmpty()) {
            status = "SUCCESS_WITH_RESULTS";
        } else if (cellError.get() != null) {
            status = cellError.get();
        } else {
            status = "SUCCESS_ZERO_RESULTS";
        }

        return new GeoapifySearchResult(new ArrayList<>(allCandidates), totalRequests.get(), status);
    }

    public GeoapifySearchResult searchPlaces(String query, String location, String areaName) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("GEOAPIFY SEARCH: API key is not configured");
            return new GeoapifySearchResult(Collections.emptyList(), 0, "MISSING_API_KEY");
        }

        List<CandidateDTO> candidates = new ArrayList<>();
        int requestsCount = 0;
        String status = "SUCCESS";

        try {
            // Step 1: Geocode location to lat/lon & bounding box
            double[] centerAndBbox = geocodeLocation(location);
            requestsCount++;

            double lat = centerAndBbox != null ? centerAndBbox[0] : 0.0;
            double lon = centerAndBbox != null ? centerAndBbox[1] : 0.0;

            // Map semantic query to Geoapify categories
            String categories = mapQueryToCategories(query);

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(PLACES_URL)
                    .queryParam("apiKey", apiKey)
                    .queryParam("limit", 200);

            if (categories != null && !categories.isEmpty()) {
                builder.queryParam("categories", categories);
            } else {
                builder.queryParam("categories", "commercial,service,office,catering");
                builder.queryParam("text", query);
            }

            if (centerAndBbox != null) {
                // filter by circle of 15km around location center
                builder.queryParam("filter", String.format(Locale.US, "circle:%f,%f,15000", lon, lat));
                builder.queryParam("bias", String.format(Locale.US, "proximity:%f,%f", lon, lat));
            } else {
                builder.queryParam("text", query + " " + location);
            }

            String url = builder.build().toUriString();
            logger.info("GEOAPIFY SEARCH [Req {}]: query='{}', location='{}', categories='{}'", requestsCount, query, location, categories);

            requestsCount++;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity.EMPTY, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode features = root.path("features");

                int count = 0;
                if (features.isArray()) {
                    for (JsonNode feature : features) {
                        CandidateDTO candidate = mapFeatureToCandidate(feature, query, areaName);
                        if (candidate != null) {
                            candidates.add(candidate);
                            count++;
                        }
                    }
                }
                logger.info("GEOAPIFY SEARCH: returned {} features, mapped {} candidates", features.size(), count);
                status = !candidates.isEmpty() ? "SUCCESS_WITH_RESULTS" : (centerAndBbox == null ? "LOCATION_GEOCODE_FAILED" : "SUCCESS_ZERO_RESULTS");
            } else {
                status = "HTTP_" + response.getStatusCode().value();
            }

        } catch (HttpStatusCodeException e) {
            status = "HTTP_ERROR_" + e.getStatusCode().value() + ": " + e.getResponseBodyAsString();
            logger.error("GEOAPIFY SEARCH API ERROR [{}]: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            status = "ERROR: " + e.getMessage();
            logger.error("GEOAPIFY SEARCH EXCEPTION: {}", e.getMessage(), e);
        }

        return new GeoapifySearchResult(candidates, requestsCount, status);
    }

    public double[] geocodeLocation(String location) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("GEOAPIFY GEOCODE: API key is not configured");
            return null;
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl(GEOCODE_URL)
                    .queryParam("text", location)
                    .queryParam("apiKey", apiKey)
                    .queryParam("limit", 1)
                    .build().toUriString();

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity.EMPTY, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode features = root.path("features");
                if (features.isArray() && features.size() > 0) {
                    JsonNode properties = features.get(0).path("properties");
                    double lat = properties.path("lat").asDouble(0.0);
                    double lon = properties.path("lon").asDouble(0.0);
                    if (lat != 0.0 && lon != 0.0) {
                        double south = lat - 0.06;
                        double west = lon - 0.06;
                        double north = lat + 0.06;
                        double east = lon + 0.06;

                        JsonNode bboxNode = properties.path("bbox");
                        if (bboxNode.isArray() && bboxNode.size() == 4) {
                            west = bboxNode.get(0).asDouble();
                            south = bboxNode.get(1).asDouble();
                            east = bboxNode.get(2).asDouble();
                            north = bboxNode.get(3).asDouble();
                        }
                        logger.info("GEOAPIFY GEOCODE: resolved location='{}' to lat={}, lon={}, bbox=[{}, {}, {}, {}]",
                                location, lat, lon, south, west, north, east);
                        return new double[]{south, west, north, east, lat, lon};
                    }
                } else {
                    logger.warn("GEOAPIFY GEOCODE: zero results for location='{}'", location);
                }
            }
        } catch (Exception e) {
            logger.warn("Geoapify geocoding failed for '{}': {}", location, e.getMessage());
        }
        return null;
    }

    private String mapQueryToCategories(String query) {
        String q = query.toLowerCase();
        if (q.contains("bakery") || q.contains("cake") || q.contains("pastry") || q.contains("confectionery") || q.contains("sweet")) {
            return "commercial.food_and_drink.confectionery,commercial.food_and_drink.bakery,catering.cafe";
        }
        if (q.contains("clothing") || q.contains("boutique") || q.contains("fashion") || q.contains("apparel")) {
            return "commercial.clothing,commercial.clothing.clothes";
        }
        if (q.contains("salon") || q.contains("hair") || q.contains("barber") || q.contains("beauty")) {
            return "service.beauty,service.beauty.hairdresser";
        }
        if (q.contains("photo") || q.contains("photographer") || q.contains("photography")) {
            return "commercial.photo";
        }
        if (q.contains("restaurant") || q.contains("food") || q.contains("cafe")) {
            return "catering,catering.restaurant,catering.cafe";
        }
        if (q.contains("software") || q.contains("tech") || q.contains("startup") || q.contains("it")) {
            return "service,office,commercial";
        }
        if (q.contains("hotel") || q.contains("stay")) {
            return "accommodation,accommodation.hotel";
        }
        if (q.contains("shop") || q.contains("store") || q.contains("retail")) {
            return "commercial";
        }
        return "commercial,service,office";
    }

    private CandidateDTO mapFeatureToCandidate(JsonNode feature, String sourceQuery, String areaName) {
        JsonNode properties = feature.path("properties");
        if (!properties.isObject()) return null;

        String placeId = properties.path("place_id").asText("");
        String name = properties.path("name").asText("");
        if (name.isEmpty()) {
            name = properties.path("address_line1").asText("");
        }
        if (name.isEmpty()) return null;

        String address = properties.path("formatted").asText("");
        if (address.isEmpty()) {
            address = properties.path("address_line2").asText("");
        }

        // Contact info in Geoapify
        String phone = properties.path("contact").path("phone").asText("");
        if (phone.isEmpty()) {
            phone = properties.path("datasource").path("raw").path("phone").asText("");
        }

        String email = properties.path("contact").path("email").asText("");
        if (email.isEmpty()) {
            email = properties.path("datasource").path("raw").path("email").asText("");
        }

        String website = properties.path("website").asText("");
        if (website.isEmpty()) {
            website = properties.path("datasource").path("raw").path("website").asText("");
        }

        Double lat = properties.path("lat").isNumber() ? properties.path("lat").asDouble() : null;
        Double lon = properties.path("lon").isNumber() ? properties.path("lon").asDouble() : null;

        List<String> categories = new ArrayList<>();
        JsonNode cats = properties.path("categories");
        if (cats.isArray()) {
            for (JsonNode c : cats) {
                categories.add(c.asText());
            }
        }

        CandidateDTO dto = new CandidateDTO();
        dto.setId("geoapify_" + (placeId.isEmpty() ? UUID.randomUUID().toString() : placeId));
        dto.setGeoapifyPlaceId(placeId);
        dto.setBusinessName(name);
        dto.setAddress(address);
        dto.setPhone(phone);
        dto.setEmail(email.isEmpty() ? null : email);
        dto.setWebsiteUrl(website.isEmpty() ? null : website);
        dto.setLatitude(lat);
        dto.setLongitude(lon);
        dto.setCategories(categories);
        dto.setBusinessStatus("OPERATIONAL");
        dto.setSourceQuery(sourceQuery);
        dto.setProvider("GEOAPIFY");
        dto.setAreaName(areaName);

        return dto;
    }
}
