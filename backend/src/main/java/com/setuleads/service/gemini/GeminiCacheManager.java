package com.setuleads.service.gemini;

import com.setuleads.dto.gemini.GeminiQualificationDTO;
import com.setuleads.dto.gemini.GeminiWebsiteOpportunityDTO;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeminiCacheManager {

    private final Map<String, GeminiQualificationDTO> qualificationCache = new ConcurrentHashMap<>();
    private final Map<String, GeminiWebsiteOpportunityDTO> websiteOpportunityCache = new ConcurrentHashMap<>();

    public String computeEvidenceHash(String textContent) {
        if (textContent == null || textContent.isBlank()) return "empty_hash";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(textContent.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 16);
        } catch (Exception e) {
            return String.valueOf(textContent.hashCode());
        }
    }

    public GeminiQualificationDTO getQualification(String candidateId, String evidenceHash) {
        if (candidateId == null || evidenceHash == null) return null;
        return qualificationCache.get(candidateId + "_" + evidenceHash);
    }

    public void putQualification(String candidateId, String evidenceHash, GeminiQualificationDTO dto) {
        if (candidateId != null && evidenceHash != null && dto != null) {
            qualificationCache.put(candidateId + "_" + evidenceHash, dto);
        }
    }

    public GeminiWebsiteOpportunityDTO getWebsiteOpportunity(String candidateId, String evidenceHash) {
        if (candidateId == null || evidenceHash == null) return null;
        return websiteOpportunityCache.get(candidateId + "_" + evidenceHash);
    }

    public void putWebsiteOpportunity(String candidateId, String evidenceHash, GeminiWebsiteOpportunityDTO dto) {
        if (candidateId != null && evidenceHash != null && dto != null) {
            websiteOpportunityCache.put(candidateId + "_" + evidenceHash, dto);
        }
    }

    public void clear() {
        qualificationCache.clear();
        websiteOpportunityCache.clear();
    }
}
