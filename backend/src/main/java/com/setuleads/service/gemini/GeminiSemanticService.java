package com.setuleads.service.gemini;

import com.setuleads.dto.CandidateDTO;
import com.setuleads.dto.WebsiteCheckResponse;
import com.setuleads.dto.gemini.GeminiQualificationDTO;
import com.setuleads.dto.gemini.GeminiSearchIntentDTO;
import com.setuleads.dto.gemini.GeminiWebsiteOpportunityDTO;
import com.setuleads.integration.gemini.GeminiClient;
import com.setuleads.service.intent.SearchIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GeminiSemanticService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiSemanticService.class);

    private final GeminiClient geminiClient;
    private final GeminiCacheManager cacheManager;

    public GeminiSemanticService(GeminiClient geminiClient, GeminiCacheManager cacheManager) {
        this.geminiClient = geminiClient;
        this.cacheManager = cacheManager;
    }

    public boolean isAvailable() {
        return geminiClient.isConfigured();
    }

    public GeminiSearchIntentDTO interpretSearchIntent(String rawQuery) {
        if (!isAvailable() || rawQuery == null || rawQuery.isBlank()) {
            return null;
        }
        return geminiClient.interpretSearchIntent(rawQuery);
    }

    public GeminiQualificationDTO qualifyCandidate(CandidateDTO candidate, SearchIntent intent) {
        if (candidate == null) return getFallbackQualification("Candidate is null");

        String evidenceText = buildEvidenceText(candidate, intent);
        String evidenceHash = cacheManager.computeEvidenceHash(evidenceText);
        String candidateId = candidate.getId() != null ? candidate.getId() : candidate.getBusinessName();

        GeminiQualificationDTO cached = cacheManager.getQualification(candidateId, evidenceHash);
        if (cached != null) {
            logger.info("GEMINI QUALIFICATION: Cache hit for candidate '{}'", candidate.getBusinessName());
            return cached;
        }

        if (!isAvailable()) {
            return getFallbackQualification("Gemini AI integration is disabled or not configured");
        }

        String prompt = "You are an expert semantic lead qualification engine for SetuLeads.\n" +
                "Evaluate this prospect based strictly on the provided evidence.\n" +
                "STRICT INSTRUCTION: You must reason ONLY from the supplied evidence. Do NOT invent missing facts. If evidence is insufficient to determine intent or commercial nature, return UNCERTAIN.\n\n" +
                "Target Search Query: \"" + (intent != null ? intent.getOriginalQuery() : "") + "\"\n" +
                "Target Location: \"" + (intent != null ? intent.getOriginalLocation() : "") + "\"\n\n" +
                "EVIDENCE SUPPLIED:\n" + evidenceText + "\n\n" +
                "Return a strict JSON object matching this schema:\n" +
                "{\n" +
                "  \"entityType\": \"BUSINESS\", // One of: BUSINESS, PERSON, EVENT, PROGRAM, INSTITUTION, ORGANIZATION, PLACE, MEDIA, ARTICLE, UNKNOWN\n" +
                "  \"entityConfidence\": 90,\n" +
                "  \"intentRelevance\": 85,\n" +
                "  \"locationConfidence\": 85,\n" +
                "  \"evidenceConfidence\": 90,\n" +
                "  \"decision\": \"QUALIFY\", // One of: QUALIFY, REJECT, UNCERTAIN\n" +
                "  \"positiveEvidence\": [\"Verified business handle\", \"Matches target city\"],\n" +
                "  \"negativeEvidence\": [],\n" +
                "  \"reason\": \"Evidence demonstrates a real commercial business operating in the target area matching search intent.\",\n" +
                "  \"confidenceNotes\": [\"Social handle present\", \"Public contact info verified\"]\n" +
                "}";

        GeminiQualificationDTO result = geminiClient.qualifyCandidate(prompt);
        if (result == null) {
            return getFallbackQualification("Gemini API call returned null or failed");
        }

        cacheManager.putQualification(candidateId, evidenceHash, result);
        return result;
    }

    public GeminiWebsiteOpportunityDTO analyzeWebsiteOpportunity(CandidateDTO candidate, WebsiteCheckResponse auditFacts) {
        if (candidate == null || auditFacts == null) return getFallbackWebsiteOpportunity("No website audit facts available");

        String auditEvidence = buildAuditEvidenceText(candidate, auditFacts);
        String evidenceHash = cacheManager.computeEvidenceHash(auditEvidence);
        String candidateId = candidate.getId() != null ? candidate.getId() : candidate.getBusinessName();

        GeminiWebsiteOpportunityDTO cached = cacheManager.getWebsiteOpportunity(candidateId, evidenceHash);
        if (cached != null) {
            logger.info("GEMINI WEBSITE AUDIT: Cache hit for candidate '{}'", candidate.getBusinessName());
            return cached;
        }

        if (!isAvailable()) {
            return getFallbackWebsiteOpportunity("Gemini AI integration is disabled or not configured");
        }

        String prompt = "You are a professional web redesign opportunity analyst.\n" +
                "Analyze these verified factual website measurements for business \"" + candidate.getBusinessName() + "\".\n" +
                "STRICT INSTRUCTION: Every issue must reference supplied evidence. Do NOT invent or fabricate problems. If evidence is insufficient, return UNVERIFIED.\n\n" +
                "VERIFIED FACTUAL WEBSITE EVIDENCE:\n" + auditEvidence + "\n\n" +
                "Return a strict JSON object matching this schema:\n" +
                "{\n" +
                "  \"redesignOpportunityScore\": 75, // 0 to 100 where higher score means greater redesign opportunity due to flaws\n" +
                "  \"issues\": [\n" +
                "    {\n" +
                "      \"category\": \"MOBILE\", // e.g. MOBILE, TECHNICAL, PERFORMANCE, SEO, CONVERSION, DESIGN\n" +
                "      \"severity\": \"HIGH\", // HIGH, MEDIUM, LOW\n" +
                "      \"description\": \"Missing mobile viewport tag causes page to break on mobile devices.\",\n" +
                "      \"evidence\": \"hasMobileViewport = false\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"strengths\": [\"Valid HTTPS SSL certificate\"],\n" +
                "  \"pitchAngles\": [\"Pitch mobile-first responsive redesign to fix layout breaking on phones\"],\n" +
                "  \"reason\": \"Website exhibits high redesign opportunity due to missing mobile viewport tag and slow load delay.\"\n" +
                "}";

        GeminiWebsiteOpportunityDTO result = geminiClient.analyzeWebsiteOpportunity(prompt);
        if (result == null) {
            return getFallbackWebsiteOpportunity("Gemini API call returned null or failed");
        }

        cacheManager.putWebsiteOpportunity(candidateId, evidenceHash, result);
        return result;
    }

    public String generatePersonalizedOutreach(CandidateDTO candidate) {
        if (candidate == null) return "No candidate available for outreach pitch generation.";

        String verifiedFacts = "Business Name: " + candidate.getBusinessName() + "\n" +
                "Location: " + (candidate.getAreaName() != null ? candidate.getAreaName() : "Local area") + "\n" +
                "Website: " + (candidate.getWebsiteUrl() != null ? candidate.getWebsiteUrl() : "No custom website") + "\n" +
                "Decision Maker: " + (candidate.getDecisionMakerName() != null ? candidate.getDecisionMakerName() + " (" + candidate.getDecisionMakerTitle() + ")" : "Business Owner") + "\n" +
                "Website Issues: " + (candidate.getWebsiteIssues() != null && !candidate.getWebsiteIssues().isEmpty() ? String.join("; ", candidate.getWebsiteIssues()) : "No custom website") + "\n" +
                "Match Reason: " + (candidate.getMatchReason() != null ? candidate.getMatchReason() : "Verified business prospect");

        if (!isAvailable()) {
            return "Subject: Website Modernization Proposal for " + candidate.getBusinessName() + "\n\n" +
                    "Hi " + (candidate.getDecisionMakerName() != null ? candidate.getDecisionMakerName() : "Team") + ",\n\n" +
                    "I came across " + candidate.getBusinessName() + " in " + (candidate.getAreaName() != null ? candidate.getAreaName() : "your area") + ". " +
                    (candidate.getWebsiteIssues() != null && !candidate.getWebsiteIssues().isEmpty() ? "I noticed your site could benefit from a few mobile & speed enhancements: " + String.join(", ", candidate.getWebsiteIssues()) + "." : "We help local businesses build high-converting websites.") + "\n\n" +
                    "Would you be open to a 5-minute chat this week?\n\nBest regards,\nSetuLeads Team";
        }

        String prompt = "You are a professional B2B website redesign outreach consultant.\n" +
                "Write a polite, 3-sentence personalized cold outreach email to this prospect using ONLY the verified facts supplied below.\n" +
                "STRICT INSTRUCTION: Never fabricate claims or claim customers are being lost unless verified in evidence. Use constructive language such as 'I noticed your website could make the mobile contact experience simpler...'\n\n" +
                "VERIFIED FACTS:\n" + verifiedFacts + "\n\n" +
                "Return a strict JSON object:\n" +
                "{\n" +
                "  \"outreachEmail\": \"Subject: ...\\n\\nHi ...\\n\\n...\"\n" +
                "}";

        String email = geminiClient.generateOutreach(prompt);
        if (email == null || email.isBlank()) {
            return "Subject: Website Modernization for " + candidate.getBusinessName() + "\n\n" +
                    "Hi " + (candidate.getDecisionMakerName() != null ? candidate.getDecisionMakerName() : "Team") + ",\n\n" +
                    "I noticed " + candidate.getBusinessName() + "'s online presence in " + (candidate.getAreaName() != null ? candidate.getAreaName() : "your area") + ". We specialize in building modern, fast, mobile-friendly websites.\n\n" +
                    "Would you be open to reviewing a quick mockup for your site?\n\nBest regards,\nSetuLeads Team";
        }

        return email;
    }

    private String buildEvidenceText(CandidateDTO c, SearchIntent intent) {
        StringBuilder sb = new StringBuilder();
        sb.append("Business Name: ").append(c.getBusinessName() != null ? c.getBusinessName() : "Unknown").append("\n");
        sb.append("Source Provider: ").append(c.getProvider() != null ? c.getProvider() : "Unknown").append("\n");
        sb.append("Address: ").append(c.getAddress() != null ? c.getAddress() : "Not listed").append("\n");
        sb.append("Phone: ").append(c.getPhone() != null ? c.getPhone() : "Not listed").append("\n");
        sb.append("Email: ").append(c.getEmail() != null ? c.getEmail() : "Not listed").append("\n");
        sb.append("Social Handle: ").append(c.getSocialHandle() != null ? c.getSocialHandle() : "Not listed").append("\n");
        sb.append("Website URL: ").append(c.getWebsiteUrl() != null ? c.getWebsiteUrl() : "Not listed").append("\n");
        sb.append("Categories: ").append(c.getCategories() != null ? String.join(", ", c.getCategories()) : "None").append("\n");
        if (c.getSourceEvidence() != null) {
            sb.append("Platform: ").append(c.getSourceEvidence().getPlatform() != null ? c.getSourceEvidence().getPlatform() : "").append("\n");
            sb.append("Result Title: ").append(c.getSourceEvidence().getResultTitle() != null ? c.getSourceEvidence().getResultTitle() : "").append("\n");
            sb.append("Snippet Text: ").append(c.getSourceEvidence().getSnippet() != null ? c.getSourceEvidence().getSnippet() : "").append("\n");
        }
        return sb.toString();
    }

    private String buildAuditEvidenceText(CandidateDTO c, WebsiteCheckResponse res) {
        StringBuilder sb = new StringBuilder();
        sb.append("URL: ").append(res.getUrl() != null ? res.getUrl() : c.getWebsiteUrl()).append("\n");
        sb.append("HTTP Status: ").append(res.getHttpStatus()).append("\n");
        sb.append("HTTPS Protocol: ").append(res.isHttps()).append("\n");
        sb.append("Page Load Time: ").append(res.getResponseTimeMs()).append(" ms\n");
        sb.append("Has Mobile Viewport Tag: ").append(res.isHasMobileViewport()).append("\n");
        sb.append("Has SEO Meta Description: ").append(res.isHasMetaDescription()).append("\n");
        sb.append("HTML Title: ").append(res.getTitle() != null ? res.getTitle() : "Missing").append("\n");
        sb.append("Detected Platform: ").append(res.getPlatform() != null ? res.getPlatform() : "Custom Web").append("\n");
        sb.append("Observable Technical Flaws: ").append(res.getIssues() != null && !res.getIssues().isEmpty() ? String.join("; ", res.getIssues()) : "None").append("\n");
        return sb.toString();
    }

    public GeminiQualificationDTO getFallbackQualification(String reason) {
        GeminiQualificationDTO dto = new GeminiQualificationDTO();
        dto.setEntityType("UNKNOWN");
        dto.setEntityConfidence(50);
        dto.setIntentRelevance(50);
        dto.setLocationConfidence(50);
        dto.setEvidenceConfidence(50);
        dto.setDecision("GEMINI_UNAVAILABLE");
        dto.setPositiveEvidence(Collections.emptyList());
        dto.setNegativeEvidence(Collections.emptyList());
        dto.setReason("Gemini semantic analysis fallback (" + reason + "). Deterministic Java qualification applied.");
        dto.setConfidenceNotes(Collections.singletonList("Fallback to Java deterministic safety rules"));
        return dto;
    }

    public GeminiWebsiteOpportunityDTO getFallbackWebsiteOpportunity(String reason) {
        GeminiWebsiteOpportunityDTO dto = new GeminiWebsiteOpportunityDTO();
        dto.setRedesignOpportunityScore(50);
        dto.setReason("Gemini website analysis fallback (" + reason + "). Factual measurements applied.");
        dto.setStrengths(Collections.emptyList());
        dto.setPitchAngles(Collections.emptyList());
        dto.setIssues(Collections.emptyList());
        return dto;
    }
}
