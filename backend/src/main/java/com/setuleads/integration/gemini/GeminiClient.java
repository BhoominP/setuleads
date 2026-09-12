package com.setuleads.integration.gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.setuleads.dto.gemini.GeminiQualificationDTO;
import com.setuleads.dto.gemini.GeminiSearchIntentDTO;
import com.setuleads.dto.gemini.GeminiWebsiteOpportunityDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Component
public class GeminiClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    @Value("${gemini.enabled:true}")
    private boolean enabled;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.temperature:0.2}")
    private double temperature;

    @Value("${gemini.max-output-tokens:2048}")
    private int maxOutputTokens;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.trim().isEmpty();
    }

    public GeminiSearchIntentDTO interpretSearchIntent(String rawQuery) {
        if (!isConfigured()) {
            logger.info("GEMINI INTENT: Skipping Gemini call (not configured or disabled)");
            return null;
        }

        String prompt = "You are a semantic query parser for a B2B lead generation & website redesign engine.\n" +
                "Convert this search query into structured intent JSON:\n" +
                "Query: \"" + rawQuery + "\"\n\n" +
                "Return structured JSON matching this schema exactly:\n" +
                "{\n" +
                "  \"targetEntityType\": \"BUSINESS\",\n" +
                "  \"categories\": [\"SAAS\", \"SOFTWARE\", \"STARTUP\"],\n" +
                "  \"location\": \"Los Angeles\",\n" +
                "  \"websiteRequired\": true,\n" +
                "  \"websiteOpportunityRequired\": true,\n" +
                "  \"contactabilityPreferred\": true\n" +
                "}";

        String jsonResponse = callGeminiApi(prompt);
        if (jsonResponse == null) return null;

        try {
            return objectMapper.readValue(jsonResponse, GeminiSearchIntentDTO.class);
        } catch (Exception e) {
            logger.warn("GEMINI INTENT: Failed to parse JSON response: {}", e.getMessage());
            return null;
        }
    }

    public GeminiQualificationDTO qualifyCandidate(String prompt) {
        if (!isConfigured()) {
            logger.info("GEMINI QUALIFICATION: Skipping Gemini call (not configured or disabled)");
            return null;
        }

        String jsonResponse = callGeminiApi(prompt);
        if (jsonResponse == null) return null;

        try {
            return objectMapper.readValue(jsonResponse, GeminiQualificationDTO.class);
        } catch (Exception e) {
            logger.warn("GEMINI QUALIFICATION: Failed to parse JSON response: {}", e.getMessage());
            return null;
        }
    }

    public GeminiWebsiteOpportunityDTO analyzeWebsiteOpportunity(String prompt) {
        if (!isConfigured()) {
            logger.info("GEMINI WEBSITE AUDIT: Skipping Gemini call (not configured or disabled)");
            return null;
        }

        String jsonResponse = callGeminiApi(prompt);
        if (jsonResponse == null) return null;

        try {
            return objectMapper.readValue(jsonResponse, GeminiWebsiteOpportunityDTO.class);
        } catch (Exception e) {
            logger.warn("GEMINI WEBSITE AUDIT: Failed to parse JSON response: {}", e.getMessage());
            return null;
        }
    }

    public String generateOutreach(String prompt) {
        if (!isConfigured()) {
            logger.info("GEMINI OUTREACH: Skipping Gemini call (not configured or disabled)");
            return null;
        }

        String jsonResponse = callGeminiApi(prompt);
        if (jsonResponse == null) return null;

        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            if (root.has("outreachEmail")) {
                return root.get("outreachEmail").asText();
            }
            return jsonResponse;
        } catch (Exception e) {
            return jsonResponse;
        }
    }

    private String activeWorkingModel = null;

    private String callGeminiApi(String promptText) {
        long startTime = System.currentTimeMillis();
        List<String> modelsToTry = new ArrayList<>();
        if (activeWorkingModel != null) {
            modelsToTry.add(activeWorkingModel);
        }
        if (model != null && !modelsToTry.contains(model)) {
            modelsToTry.add(model);
        }
        for (String m : List.of("gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash")) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        for (String targetModel : modelsToTry) {
            try {
                String url = UriComponentsBuilder.fromHttpUrl(GEMINI_BASE_URL + "/" + targetModel + ":generateContent")
                        .queryParam("key", apiKey)
                        .toUriString();

                Map<String, Object> partMap = new HashMap<>();
                partMap.put("text", promptText);

                Map<String, Object> contentMap = new HashMap<>();
                contentMap.put("parts", Collections.singletonList(partMap));

                Map<String, Object> genConfig = new HashMap<>();
                genConfig.put("temperature", temperature);
                genConfig.put("maxOutputTokens", maxOutputTokens);
                genConfig.put("responseMimeType", "application/json");

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", Collections.singletonList(contentMap));
                requestBody.put("generationConfig", genConfig);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
                long elapsed = System.currentTimeMillis() - startTime;

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidatesNode = root.path("candidates");
                    if (candidatesNode.isArray() && candidatesNode.size() > 0) {
                        JsonNode partsNode = candidatesNode.get(0).path("content").path("parts");
                        if (partsNode.isArray() && partsNode.size() > 0) {
                            String text = partsNode.get(0).path("text").asText();
                            activeWorkingModel = targetModel;
                            logger.info("GEMINI API SUCCESS: model={}, latency={}ms, responseLength={}", targetModel, elapsed, text.length());
                            return text;
                        }
                    }
                }
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("404")) {
                    logger.warn("GEMINI MODEL 404 for '{}', trying next fallback model...", targetModel);
                    continue;
                }
                long elapsed = System.currentTimeMillis() - startTime;
                logger.warn("GEMINI API ERROR for '{}' (latency={}ms): {}", targetModel, elapsed, e.getMessage());
                return null;
            }
        }
        return null;
    }
}
