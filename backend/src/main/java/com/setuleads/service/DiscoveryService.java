package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import com.setuleads.dto.DiscoveryRequest;
import com.setuleads.dto.DiscoveryResponse;
import com.setuleads.dto.MetricsDTO;
import com.setuleads.integration.geoapify.GeoapifyClient;
import com.setuleads.integration.osm.OsmClient;
import com.setuleads.integration.xray.SocialXRayClient;
import com.setuleads.service.intent.SearchIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class DiscoveryService {

    private static final Logger logger = LoggerFactory.getLogger(DiscoveryService.class);

    private final GeoapifyClient geoapifyClient;
    private final OsmClient osmClient;
    private final SocialXRayClient socialXRayClient;
    private final RelevanceQualifier relevanceQualifier;
    private final IdentityValidator identityValidator;
    private final ContactabilityEngine contactabilityEngine;
    private final WebsiteCheckService websiteCheckService;
    private final com.setuleads.service.gemini.GeminiSemanticService geminiSemanticService;

    public DiscoveryService(GeoapifyClient geoapifyClient, OsmClient osmClient,
                            SocialXRayClient socialXRayClient,
                            RelevanceQualifier relevanceQualifier,
                            IdentityValidator identityValidator,
                            ContactabilityEngine contactabilityEngine,
                            WebsiteCheckService websiteCheckService,
                            com.setuleads.service.gemini.GeminiSemanticService geminiSemanticService) {
        this.geoapifyClient = geoapifyClient;
        this.osmClient = osmClient;
        this.socialXRayClient = socialXRayClient;
        this.relevanceQualifier = relevanceQualifier;
        this.identityValidator = identityValidator;
        this.contactabilityEngine = contactabilityEngine;
        this.websiteCheckService = websiteCheckService;
        this.geminiSemanticService = geminiSemanticService;
    }

    public DiscoveryResponse discoverBusinesses(DiscoveryRequest request) {
        String baseQuery = request.getQuery().trim();
        String location = request.getLocation().trim();
        boolean isDebug = request.isDebug();

        List<String> sources = request.getSources() != null && !request.getSources().isEmpty()
                ? request.getSources()
                : Arrays.asList("GEOAPIFY", "OPENSTREETMAP", "OSM", "SOCIAL_XRAY");

        logger.info("DISCOVERY SERVICE: starting search for query='{}', location='{}', sources={}, debug={}", baseQuery, location, sources, isDebug);

        List<String> expandedTerms = expandQuery(baseQuery);

        List<CandidateDTO> rawCandidates = new ArrayList<>();
        int geoapifyCount = 0;
        int osmCount = 0;
        int socialXrayCount = 0;
        int geoapifyRequestsTotal = 0;
        int osmPassesTotal = 0;
        int queriesExecuted = 1;

        String geoapifyStatus = "NOT_ATTEMPTED";
        String osmStatus = "NOT_ATTEMPTED";
        String socialXrayStatus = "NOT_ATTEMPTED";
        String overtureStatus = "NOT_ENABLED";

        Map<String, Object> debugInfoMap = new LinkedHashMap<>();

        boolean runGeoapify = sources.contains("GEOAPIFY") || sources.contains("GOOGLE_PLACES");
        boolean runOsm = sources.contains("OPENSTREETMAP") || sources.contains("OSM");
        boolean runSocialXray = sources.contains("SOCIAL_XRAY") || sources.contains("WEB_DORK");

        CompletableFuture<List<CandidateDTO>> geoapifyFuture = CompletableFuture.supplyAsync(() -> {
            List<CandidateDTO> list = new ArrayList<>();
            if (!runGeoapify) return list;
            int count = 0;
            for (String q : expandedTerms) {
                GeoapifyClient.GeoapifySearchResult geoRes = geoapifyClient.searchPlacesGrid(q, location, location);
                if (!geoRes.candidates.isEmpty()) {
                    list.addAll(geoRes.candidates);
                    count += geoRes.candidates.size();
                }
                if (count >= 100) break;
            }
            return list;
        });

        CompletableFuture<OsmClient.OsmSearchResult> osmFuture = CompletableFuture.supplyAsync(() -> {
            if (!runOsm) return new OsmClient.OsmSearchResult(Collections.emptyList(), 0, "NOT_ATTEMPTED");
            return osmClient.searchOsm(baseQuery, location, location);
        });

        CompletableFuture<SocialXRayClient.SocialXRaySearchResult> socialXrayFuture = CompletableFuture.supplyAsync(() -> {
            if (!runSocialXray) return new SocialXRayClient.SocialXRaySearchResult(Collections.emptyList(), 0, "NOT_ATTEMPTED", Collections.emptyMap(), Collections.emptyMap());
            return socialXRayClient.searchSocialXRay(baseQuery, location, isDebug);
        });

        try {
            CompletableFuture.allOf(geoapifyFuture, osmFuture, socialXrayFuture)
                    .get(22, java.util.concurrent.TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException te) {
            logger.warn("Parallel discovery search timed out after 22 seconds; compiling available provider results");
        } catch (Exception e) {
            logger.warn("Parallel discovery search error: {}", e.getMessage());
        }

        List<CandidateDTO> geoCandidates = geoapifyFuture.getNow(Collections.emptyList());
        if (!geoCandidates.isEmpty()) {
            rawCandidates.addAll(geoCandidates);
            geoapifyCount = geoCandidates.size();
            geoapifyStatus = "SUCCESS_WITH_RESULTS";
            geoapifyRequestsTotal = 1;
        } else if (runGeoapify) {
            geoapifyStatus = geoapifyFuture.isDone() && !geoapifyFuture.isCompletedExceptionally()
                    ? "SUCCESS_ZERO_RESULTS" : "API Request timed out after 22 seconds";
        }

        OsmClient.OsmSearchResult osmRes = osmFuture.getNow(
                new OsmClient.OsmSearchResult(Collections.emptyList(), 0, "API Request timed out after 22 seconds"));
        osmPassesTotal = osmRes.passesExecuted;
        if (!osmRes.candidates.isEmpty()) {
            rawCandidates.addAll(osmRes.candidates);
            osmCount = osmRes.candidates.size();
            osmStatus = "SUCCESS_WITH_RESULTS";
        } else {
            osmStatus = osmRes.status.startsWith("SUCCESS") ? "SUCCESS_ZERO_RESULTS" : osmRes.status;
        }

        SocialXRayClient.SocialXRaySearchResult xrayRes = socialXrayFuture.getNow(
                new SocialXRayClient.SocialXRaySearchResult(Collections.emptyList(), 0, "API Request timed out after 22 seconds", Collections.emptyMap(), Collections.emptyMap()));
        if (!xrayRes.candidates.isEmpty()) {
            rawCandidates.addAll(xrayRes.candidates);
            socialXrayCount = xrayRes.candidates.size();
            socialXrayStatus = "SUCCESS_WITH_RESULTS";
        } else if (runSocialXray) {
            socialXrayStatus = xrayRes.status;
        }

        if (xrayRes.debugInfo != null && !xrayRes.debugInfo.isEmpty()) {
            debugInfoMap.put("socialXRay", xrayRes.debugInfo);
        }

        // Provider-aware Deduplication & Normalization
        DeduplicationResult dedupResult = deduplicateCandidates(rawCandidates);

        // Identity Validation, Contactability Engine & Intent Qualification Pipeline
        int relevantCount = 0;
        int rejectedCount = 0;
        int peopleCount = 0;
        int orgCount = 0;
        int unknownCount = 0;

        int instagramCount = 0;
        int linkedinCount = 0;
        int linktreeCount = 0;
        int facebookCount = 0;

        List<CandidateDTO> qualifiedCandidates = new ArrayList<>();

        for (CandidateDTO candidate : dedupResult.uniqueCandidates) {
            // Track Social Platform Breakdown
            if (candidate.getSourceEvidence() != null && candidate.getSourceEvidence().getPlatform() != null) {
                String plat = candidate.getSourceEvidence().getPlatform().toUpperCase();
                if ("INSTAGRAM".equals(plat)) instagramCount++;
                else if ("LINKEDIN".equals(plat)) linkedinCount++;
                else if ("LINKTREE".equals(plat)) linktreeCount++;
                else if ("FACEBOOK".equals(plat)) facebookCount++;
            }

            // Step 1: Business Identity Validation
            IdentityValidator.IdentityValidationResult idQual = identityValidator.validate(candidate, baseQuery);
            candidate.setEntityType(idQual.entityType);
            candidate.setIdentityConfidence(idQual.identityConfidence);
            candidate.setEvidenceConfidence(idQual.evidenceConfidence);

            if (idQual.entityType == com.setuleads.entity.EntityType.PERSON) peopleCount++;
            else if (idQual.entityType == com.setuleads.entity.EntityType.ORGANIZATION || idQual.entityType == com.setuleads.entity.EntityType.INSTITUTION) orgCount++;
            else if (idQual.entityType == com.setuleads.entity.EntityType.UNKNOWN) unknownCount++;

            // Step 2: Contactability Evaluation & Decision Maker Extraction
            String candidateText = candidate.getBusinessName() + " " +
                (candidate.getSourceEvidence() != null ? candidate.getSourceEvidence().getSnippet() : "") + " " +
                (candidate.getSourceEvidence() != null ? candidate.getSourceEvidence().getResultTitle() : "");
            contactabilityEngine.applyTo(candidate, candidateText);

            // Step 3: Fast Non-Blocking Website Domain Evaluation
            String webUrl = candidate.getWebsiteUrl();
            if (webUrl != null && !webUrl.isBlank() && websiteCheckService.isCustomCompanyWebsite(webUrl)) {
                candidate.setWebsiteStatus("FOUND");
                candidate.setWebsiteOpportunityScore(70);
                candidate.setWebsiteIssues(List.of("Custom website discovered — ready for instant deep audit"));
                candidate.setWebsiteOpportunityReason("Custom business domain available (" + webUrl + ")");
            } else if (webUrl != null && !webUrl.isBlank()) {
                candidate.setWebsiteStatus("NOT_FOUND");
                candidate.setWebsiteOpportunityScore(0);
                candidate.setWebsiteIssues(List.of("Directory or social profile URL provided instead of custom website"));
                candidate.setWebsiteOpportunityReason("Social profile URL, not a custom company domain");
            } else {
                candidate.setWebsiteStatus("NOT_FOUND");
                candidate.setWebsiteOpportunityScore(40);
                candidate.setWebsiteIssues(List.of("No custom website discovered"));
                candidate.setWebsiteOpportunityReason("No custom website discovered; candidate for new website build");
            }

            // Step 4: Deterministic Java Safety Qualification & Final Composite Scoring
            RelevanceQualifier.QualificationResult qual = relevanceQualifier.qualify(candidate, baseQuery);
            candidate.setRelevanceScore(qual.score);
            candidate.setRelevanceStatus(qual.status);
            candidate.setConfidenceLevel(qual.confidenceLevel);

            List<String> combinedMatched = new ArrayList<>(idQual.identitySignals);
            combinedMatched.addAll(qual.matchedSignals);
            candidate.setMatchedSignals(combinedMatched);

            List<String> combinedNeg = new ArrayList<>(idQual.riskSignals);
            combinedNeg.addAll(qual.negativeSignals);
            candidate.setNegativeSignals(combinedNeg);

            candidate.setRelevanceReasons(qual.relevanceReasons);
            candidate.setRejectionReasons(qual.rejectionReasons);

            if ("RELEVANT".equals(qual.status) && candidate.getEntityType() == com.setuleads.entity.EntityType.BUSINESS) {
                relevantCount++;
                qualifiedCandidates.add(candidate);
            } else {
                rejectedCount++;
            }
        }

        // Sort qualified candidates by composite score descending
        qualifiedCandidates.sort((a, b) -> Integer.compare(
                b.getLeadOpportunityScore() != null ? b.getLeadOpportunityScore() : 0,
                a.getLeadOpportunityScore() != null ? a.getLeadOpportunityScore() : 0
        ));

        boolean enableGemini = request.getUseGemini() != null ? request.getUseGemini() : true;

        // Step 5: Parallel Gemini Semantic Qualification & Website Audit for Top Shortlisted Candidates (max 3s)
        List<CompletableFuture<Void>> shortlistFutures = new ArrayList<>();

        if (enableGemini) {
            // A. Gemini Semantic Qualification for Top 10 Shortlisted Candidates
            int aiQualCount = 0;
            for (CandidateDTO candidate : qualifiedCandidates) {
                if (aiQualCount >= 10) break;
                aiQualCount++;
                final CandidateDTO c = candidate;
                shortlistFutures.add(CompletableFuture.runAsync(() -> {
                    SearchIntent searchIntentObj = new SearchIntent(baseQuery, c.getAreaName() != null ? c.getAreaName() : request.getLocation(), null);
                    com.setuleads.dto.gemini.GeminiQualificationDTO aiQual = geminiSemanticService.qualifyCandidate(c, searchIntentObj);
                    if (aiQual != null && !"GEMINI_UNAVAILABLE".equals(aiQual.getDecision())) {
                        if ("REJECT".equalsIgnoreCase(aiQual.getDecision()) || (aiQual.getIntentRelevance() != null && aiQual.getIntentRelevance() < 40)) {
                            c.setRelevanceStatus("REJECTED");
                            c.setQualificationLevel("REJECTED");
                            c.setRelevanceScore(0.0);
                            c.setAiReasoning("Gemini AI semantic qualification rejected candidate: " + aiQual.getReason());
                        } else {
                            c.setIsAiVerified(true);
                            c.setAiReasoning(aiQual.getReason());
                            if (aiQual.getEntityType() != null) {
                                try {
                                    com.setuleads.entity.EntityType geminiEntity = com.setuleads.entity.EntityType.valueOf(aiQual.getEntityType().toUpperCase());
                                    if (geminiEntity != com.setuleads.entity.EntityType.UNKNOWN) {
                                        c.setEntityType(geminiEntity);
                                        if (geminiEntity != com.setuleads.entity.EntityType.BUSINESS) {
                                            c.setRelevanceStatus("REJECTED");
                                            c.setQualificationLevel("REJECTED");
                                        }
                                    }
                                } catch (Exception ignored) {}
                            }
                            if (aiQual.getPositiveEvidence() != null && !aiQual.getPositiveEvidence().isEmpty()) {
                                c.setPositiveEvidence(aiQual.getPositiveEvidence());
                            }
                            if (aiQual.getNegativeEvidence() != null && !aiQual.getNegativeEvidence().isEmpty()) {
                                c.setNegativeEvidence(aiQual.getNegativeEvidence());
                            }
                        }
                    }
                }));
            }
        }

        // B. Shortlist Top 5 Website Candidates for Parallel Live Factual Audit & Gemini Interpretation
        int auditedCount = 0;
        for (CandidateDTO c : qualifiedCandidates) {
            if ("FOUND".equals(c.getWebsiteStatus()) && c.getWebsiteUrl() != null && auditedCount < 5) {
                auditedCount++;
                shortlistFutures.add(CompletableFuture.runAsync(() -> {
                    com.setuleads.dto.WebsiteCheckResponse auditRes = websiteCheckService.inspectWebsite(c.getWebsiteUrl());
                    c.setWebsiteStatus(auditRes.getWebsiteStatus());
                    c.setWebsiteOpportunityScore(auditRes.getRedesignOpportunityScore());
                    c.setWebsiteIssues(auditRes.getIssues());
                    c.setWebsiteOpportunityReason(auditRes.getWebsiteOpportunityReason());

                    // Gemini Deep Website Opportunity Interpretation
                    com.setuleads.dto.gemini.GeminiWebsiteOpportunityDTO aiWebOpp = geminiSemanticService.analyzeWebsiteOpportunity(c, auditRes);
                    if (aiWebOpp != null && aiWebOpp.getPitchAngles() != null && !aiWebOpp.getPitchAngles().isEmpty()) {
                        c.setAiPitchAngles(aiWebOpp.getPitchAngles());
                        c.setAiWebsiteStrengths(aiWebOpp.getStrengths());
                        if (aiWebOpp.getReason() != null && !aiWebOpp.getReason().isBlank()) {
                            c.setWebsiteOpportunityReason(auditRes.getWebsiteOpportunityReason() + " | AI Insight: " + aiWebOpp.getReason());
                        }
                    }

                    relevanceQualifier.qualify(c, baseQuery); // Re-calculate composite score with audited website score
                }));
            }
        }

        if (!shortlistFutures.isEmpty()) {
            try {
                CompletableFuture.allOf(shortlistFutures.toArray(new CompletableFuture[0]))
                        .get(3, java.util.concurrent.TimeUnit.SECONDS);
            } catch (Exception e) {
                logger.debug("Shortlisted candidate AI qualification and website audits completed or timed out fast: {}", e.getMessage());
            }
        }

        // Post-AI & audit filtering: Remove any candidate rejected by Gemini or website audit re-qualification
        qualifiedCandidates.removeIf(c -> "REJECTED".equals(c.getRelevanceStatus()) || "REJECTED".equals(c.getQualificationLevel()) || c.getEntityType() != com.setuleads.entity.EntityType.BUSINESS);

        MetricsDTO metrics = new MetricsDTO();
        metrics.setGeoapifyCandidates(geoapifyCount);
        metrics.setOsmCandidates(osmCount);
        metrics.setSocialXrayCandidates(socialXrayCount);
        metrics.setOvertureCandidates(0);
        metrics.setRawCandidates(rawCandidates.size());
        metrics.setUniqueBusinesses(dedupResult.uniqueCandidates.size());
        metrics.setRelevantCandidates(relevantCount);
        metrics.setRejectedCandidates(rejectedCount);
        metrics.setPeopleDetected(peopleCount);
        metrics.setOrganizationsDetected(orgCount);
        metrics.setUnknownDetected(unknownCount);
        metrics.setDuplicatesRemoved(rawCandidates.size() - dedupResult.uniqueCandidates.size());
        metrics.setCrossSourceMatches(dedupResult.crossSourceMatches);
        metrics.setInstagramCount(instagramCount);
        metrics.setLinkedinCount(linkedinCount);
        metrics.setLinktreeCount(linktreeCount);
        metrics.setFacebookCount(facebookCount);
        metrics.setExpandedTerms(expandedTerms);
        metrics.setQueriesExecuted(queriesExecuted);
        metrics.setSubAreas(1);
        metrics.setGeoapifyRequests(geoapifyRequestsTotal);
        metrics.setOsmPasses(osmPassesTotal);
        metrics.setOvertureQueries(0);
        metrics.setGeoapifyStatus(geoapifyStatus);
        metrics.setOsmStatus(osmStatus);
        metrics.setSocialXrayStatus(socialXrayStatus);
        metrics.setOvertureStatus(overtureStatus);

        DiscoveryResponse response = new DiscoveryResponse();
        response.setQuery(baseQuery);
        response.setLocation(location);
        response.setCandidates(qualifiedCandidates);
        response.setMetrics(metrics);
        if (isDebug) {
            response.setDebugInfo(debugInfoMap);
        }

        logger.info("DISCOVERY COMPLETE: raw={}, unique={}, relevant={}, rejected={}, people={}, orgs={}",
                rawCandidates.size(), dedupResult.uniqueCandidates.size(), relevantCount, rejectedCount, peopleCount, orgCount);

        return response;
    }

    private List<String> expandQuery(String query) {
        String lower = query.toLowerCase();
        List<String> terms = new ArrayList<>();
        terms.add(query);

        if (lower.equals("software") || lower.contains("software company")) {
            if (!terms.contains("IT company")) terms.add("IT company");
        } else if (lower.contains("clothing")) {
            if (!terms.contains("boutique")) terms.add("boutique");
        } else if (lower.contains("bakery")) {
            if (!terms.contains("cafe")) terms.add("cafe");
        }

        return terms;
    }

    private static class DeduplicationResult {
        List<CandidateDTO> uniqueCandidates = new ArrayList<>();
        int crossSourceMatches = 0;
    }

    private DeduplicationResult deduplicateCandidates(List<CandidateDTO> rawList) {
        DeduplicationResult res = new DeduplicationResult();
        Map<String, CandidateDTO> mapByGeoapifyId = new HashMap<>();
        Map<String, CandidateDTO> mapByOsmId = new HashMap<>();
        Map<String, CandidateDTO> mapByDomain = new HashMap<>();
        Map<String, CandidateDTO> mapByPhone = new HashMap<>();

        List<CandidateDTO> uniqueList = new ArrayList<>();
        int crossMatches = 0;

        for (CandidateDTO c : rawList) {
            CandidateDTO existing = null;

            // Check Strong IDs
            if (c.getGeoapifyPlaceId() != null && !c.getGeoapifyPlaceId().isEmpty()) {
                existing = mapByGeoapifyId.get(c.getGeoapifyPlaceId());
            }
            if (existing == null && c.getOsmType() != null && c.getOsmId() != null) {
                existing = mapByOsmId.get(c.getOsmType() + "_" + c.getOsmId());
            }

            // Check domain
            String domain = extractDomain(c.getWebsiteUrl());
            if (existing == null && domain != null) {
                existing = mapByDomain.get(domain);
            }

            // Check phone
            String phoneNorm = normalizePhone(c.getPhone());
            if (existing == null && phoneNorm != null) {
                existing = mapByPhone.get(phoneNorm);
            }

            if (existing != null) {
                if (!existing.getProvider().equals(c.getProvider())) {
                    crossMatches++;
                }
                mergeCandidates(existing, c);
            } else {
                uniqueList.add(c);
                if (c.getGeoapifyPlaceId() != null && !c.getGeoapifyPlaceId().isEmpty()) {
                    mapByGeoapifyId.put(c.getGeoapifyPlaceId(), c);
                }
                if (c.getOsmType() != null && c.getOsmId() != null) {
                    mapByOsmId.put(c.getOsmType() + "_" + c.getOsmId(), c);
                }
                if (domain != null) {
                    mapByDomain.put(domain, c);
                }
                if (phoneNorm != null) {
                    mapByPhone.put(phoneNorm, c);
                }
            }
        }

        res.uniqueCandidates = uniqueList;
        res.crossSourceMatches = crossMatches;
        return res;
    }

    private void mergeCandidates(CandidateDTO target, CandidateDTO source) {
        if ((target.getWebsiteUrl() == null || target.getWebsiteUrl().isEmpty()) && source.getWebsiteUrl() != null) {
            target.setWebsiteUrl(source.getWebsiteUrl());
        }
        if ((target.getPhone() == null || target.getPhone().isEmpty()) && source.getPhone() != null) {
            target.setPhone(source.getPhone());
        }
        if ((target.getEmail() == null || target.getEmail().isEmpty()) && source.getEmail() != null) {
            target.setEmail(source.getEmail());
        }
        if (target.getGeoapifyPlaceId() == null && source.getGeoapifyPlaceId() != null) {
            target.setGeoapifyPlaceId(source.getGeoapifyPlaceId());
        }
        if (target.getOsmId() == null && source.getOsmId() != null) {
            target.setOsmType(source.getOsmType());
            target.setOsmId(source.getOsmId());
        }
        if (source.getCategories() != null) {
            Set<String> mergedCats = new LinkedHashSet<>(target.getCategories() != null ? target.getCategories() : Collections.emptyList());
            mergedCats.addAll(source.getCategories());
            target.setCategories(new ArrayList<>(mergedCats));
        }
    }

    private String extractDomain(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            String u = url.trim();
            if (!u.startsWith("http://") && !u.startsWith("https://")) {
                u = "http://" + u;
            }
            URI uri = new URI(u);
            String host = uri.getHost();
            if (host == null) return null;
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }
            String lowerHost = host.toLowerCase();

            // For social platforms, include path so distinct profiles are not collapsed into a single candidate
            if (lowerHost.contains("instagram.com") || lowerHost.contains("linkedin.com") ||
                lowerHost.contains("facebook.com") || lowerHost.contains("linktr.ee")) {
                String path = uri.getPath();
                if (path != null && !path.equals("/") && !path.isEmpty()) {
                    if (path.endsWith("/")) path = path.substring(0, path.length() - 1);
                    return lowerHost + path.toLowerCase();
                }
            }

            return lowerHost;
        } catch (Exception e) {
            return null;
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) return null;
        String digits = phone.replaceAll("[^0-9]", "");
        return digits.length() >= 7 ? digits : null;
    }
}
