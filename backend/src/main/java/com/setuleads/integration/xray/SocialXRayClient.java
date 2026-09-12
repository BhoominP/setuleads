package com.setuleads.integration.xray;

import com.setuleads.dto.CandidateDTO;
import com.setuleads.dto.SourceEvidence;
import com.setuleads.integration.search.RawSearchResult;
import com.setuleads.integration.search.SearchProviderAdapter;
import com.setuleads.integration.search.SearchResultPage;
import com.setuleads.service.location.LocationDetector;
import com.setuleads.service.extraction.DiscoveredBusiness;
import com.setuleads.service.extraction.EntityExtractor;
import com.setuleads.service.intent.SearchIntent;
import com.setuleads.service.intent.SmartQueryGenerator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocialXRayClient {

    private static final Logger logger = LoggerFactory.getLogger(SocialXRayClient.class);

    @Autowired
    private SmartQueryGenerator queryGenerator;

    @Autowired
    private SearchProviderAdapter searchProviderAdapter;

    @Autowired
    private EntityExtractor entityExtractor;

    @Autowired
    private LocationDetector locationDetector;

    public static class SocialXRaySearchResult {
        public List<CandidateDTO> candidates;
        public int count;
        public String status; // "SUCCESS_WITH_RESULTS", "SUCCESS_ZERO_RESULTS", "PARTIAL_FAILURE", "PROVIDER_FAILURE"
        public Map<String, Object> metrics;
        public Map<String, Object> debugInfo;

        public SocialXRaySearchResult(List<CandidateDTO> candidates, int count, String status, Map<String, Object> metrics, Map<String, Object> debugInfo) {
            this.candidates = candidates;
            this.count = count;
            this.status = status;
            this.metrics = metrics;
            this.debugInfo = debugInfo;
        }
    }

    public SocialXRaySearchResult searchSocialXRay(String query, String location) {
        return searchSocialXRay(query, location, false);
    }

    public SocialXRaySearchResult searchSocialXRay(String query, String location, boolean debug) {
        logger.info("=== STARTING SOCIAL X-RAY DISCOVERY ENGINE ===");
        logger.info("Target Query: '{}' | Location: '{}'", query, location);

        Map<String, Object> metrics = new LinkedHashMap<>();
        Map<String, Object> debugInfo = new LinkedHashMap<>();

        if (query == null || query.trim().isEmpty()) {
            metrics.put("status", "INVALID_QUERY");
            return new SocialXRaySearchResult(Collections.emptyList(), 0, "INVALID_QUERY", metrics, debugInfo);
        }

        // 1. Generate Intent & Dynamic Queries
        SearchIntent intent = queryGenerator.createSearchIntent(query, location);
        List<String> generatedQueries = queryGenerator.generateQueries(intent, 15);
        logger.info("Generated {} dynamic search queries for query='{}'", generatedQueries.size(), query);

        // 2. Execute Multi-Query Search via Provider Adapter
        List<SearchResultPage> pages = searchProviderAdapter.executeMultiQuerySearch(generatedQueries, 1);

        // Track structured debug logging
        int queriesExecuted = generatedQueries.size();
        int pagesFetched = pages.size();
        int rawResultsCount = 0;
        int parsedResultsCount = 0;
        int normalizedResultsCount = 0;
        int rejectedResultsCount = 0;
        int duplicateResultsCount = 0;
        Map<String, Integer> rejectionReasons = new HashMap<>();

        Map<String, String> providerStatus = new HashMap<>();
        List<RawSearchResult> rawResults = new ArrayList<>();

        for (SearchResultPage page : pages) {
            providerStatus.put(page.getProviderName() + ":" + page.getQuery(), page.getStatusCode() != 200 ? "FAILED_" + page.getStatusCode() : "SUCCESS");
            if (page.isSuccess() && page.getResults() != null) {
                rawResults.addAll(page.getResults());
                rawResultsCount += page.getResults().size();
            }
        }
        parsedResultsCount = rawResultsCount;

        logger.info("SERP Execution Complete: Executed {} queries | Raw Results: {}", queriesExecuted, rawResultsCount);

        // 3. Process Raw Search Results -> DiscoveredBusiness -> CandidateDTO
        Set<String> seenUrls = Collections.synchronizedSet(new HashSet<>());
        Set<String> seenHandles = Collections.synchronizedSet(new HashSet<>());
        List<CandidateDTO> candidates = new ArrayList<>();
        List<Map<String, Object>> rejectedList = new ArrayList<>();

        for (RawSearchResult raw : rawResults) {
            String url = raw.getUrl();
            if (url == null || seenUrls.contains(url)) {
                duplicateResultsCount++;
                continue;
            }

            // Extract DiscoveredBusiness model
            DiscoveredBusiness business = entityExtractor.extract(raw);
            if (business == null) {
                rejectedResultsCount++;
                rejectionReasons.put("ENTITY_EXTRACTION_FAILED", rejectionReasons.getOrDefault("ENTITY_EXTRACTION_FAILED", 0) + 1);
                continue;
            }

            // Check location match
            LocationDetector.LocationMatchResult locMatch = locationDetector.detectLocation(location, business.getExtractedText());
            business.setLocationConfidence(locMatch.getConfidence());
            business.setLocation(locMatch.getMatchedLocation() != null ? locMatch.getMatchedLocation() : location);

            // Deduplication on handle / URL
            if (business.getSocialHandle() != null && seenHandles.contains(business.getSocialHandle().toLowerCase())) {
                duplicateResultsCount++;
                continue;
            }

            normalizedResultsCount++;

            // Create CandidateDTO
            CandidateDTO dto = new CandidateDTO();
            dto.setId("xray_" + UUID.randomUUID().toString().substring(0, 8));
            dto.setBusinessName(business.getBusinessName());
            dto.setSocialHandle(business.getSocialHandle());
            dto.setEmail(business.getEmail());
            dto.setPhone(business.getPhone());
            dto.setWhatsapp(business.getWhatsapp());
            dto.setWebsiteUrl(business.getWebsite() != null ? business.getWebsite() : business.getSourceUrl());
            dto.setCategories(Collections.singletonList("Social & Web Prospect"));
            dto.setProvider("SOCIAL_XRAY");
            dto.setSourceQuery(raw.getQuery());
            dto.setAddress(business.getLocation());
            dto.setEntityType(business.getEntityType());
            dto.setWebsiteStatus(business.getWebsiteStatus());

            SourceEvidence evidence = new SourceEvidence(
                    "SOCIAL_XRAY",
                    business.getSourcePlatform() != null ? business.getSourcePlatform() : "WEB",
                    raw.getUrl(),
                    raw.getQuery(),
                    raw.getTitle(),
                    raw.getSnippet(),
                    Instant.now().toString(),
                    "SEARCH_RESULT"
            );
            dto.setSourceEvidence(evidence);

            seenUrls.add(url);
            if (business.getSocialHandle() != null) {
                seenHandles.add(business.getSocialHandle().toLowerCase());
            }

            candidates.add(dto);
        }

        // Metrics Reconciliation
        metrics.put("queriesGenerated", generatedQueries.size());
        metrics.put("queriesExecuted", queriesExecuted);
        metrics.put("pagesFetched", pagesFetched);
        metrics.put("rawResults", rawResultsCount);
        metrics.put("parsedResults", parsedResultsCount);
        metrics.put("normalizedResults", normalizedResultsCount);
        metrics.put("rejectedResults", rejectedResultsCount);
        metrics.put("duplicatesRemoved", duplicateResultsCount);
        metrics.put("finalCandidates", candidates.size());

        if (debug) {
            debugInfo.put("queriesGenerated", generatedQueries);
            debugInfo.put("providerStatus", providerStatus);
            debugInfo.put("rejectionReasons", rejectionReasons);
        }

        String overallStatus;
        if (candidates.size() > 0) {
            overallStatus = "SUCCESS_WITH_RESULTS";
        } else if (rawResultsCount == 0 && pagesFetched == 0) {
            overallStatus = "PROVIDER_FAILURE";
        } else {
            overallStatus = "SUCCESS_ZERO_RESULTS";
        }

        logger.info("=== SOCIAL X-RAY DISCOVERY COMPLETED ===");
        logger.info("Final Candidates Count: {} | Overall Status: {}", candidates.size(), overallStatus);

        return new SocialXRaySearchResult(candidates, candidates.size(), overallStatus, metrics, debugInfo);
    }
}
