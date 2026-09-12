package com.setuleads.service.extraction;

import com.setuleads.entity.EntityType;

import java.time.Instant;

public class DiscoveredBusiness {

    private EntityType entityType;
    private String businessName;
    private String socialHandle;
    private String website;
    private String email;
    private String phone;
    private String whatsapp;
    private String location;
    private String category;
    private String description;

    private String source; // e.g. "SOCIAL_XRAY"
    private String sourceUrl;
    private String sourcePlatform; // e.g. "INSTAGRAM", "LINKEDIN"
    private String sourceQuery;
    private String resultTitle;
    private String snippet;
    private String extractedText;

    private int identityConfidence;
    private int locationConfidence;
    private int relevanceConfidence;
    private int evidenceConfidence;
    private int overallScore;

    private boolean hasWebsite;
    private String websiteStatus; // WEBSITE_PRESENT, WEBSITE_NOT_FOUND, WEBSITE_UNVERIFIED
    private String leadOpportunity; // HIGH, MEDIUM, LOW

    private Instant discoveredAt;
    private String rejectionReason;

    private int contactabilityScore;
    private String decisionMakerName;
    private String decisionMakerTitle;

    public int getContactabilityScore() { return contactabilityScore; }
    public void setContactabilityScore(int contactabilityScore) { this.contactabilityScore = contactabilityScore; }

    public String getDecisionMakerName() { return decisionMakerName; }
    public void setDecisionMakerName(String decisionMakerName) { this.decisionMakerName = decisionMakerName; }

    public String getDecisionMakerTitle() { return decisionMakerTitle; }
    public void setDecisionMakerTitle(String decisionMakerTitle) { this.decisionMakerTitle = decisionMakerTitle; }

    public DiscoveredBusiness() {
        this.discoveredAt = Instant.now();
        this.entityType = EntityType.UNKNOWN;
        this.websiteStatus = "WEBSITE_NOT_FOUND";
        this.leadOpportunity = "HIGH";
    }

    // Getters and Setters
    public EntityType getEntityType() { return entityType; }
    public void setEntityType(EntityType entityType) { this.entityType = entityType; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getSocialHandle() { return socialHandle; }
    public void setSocialHandle(String socialHandle) { this.socialHandle = socialHandle; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) {
        this.website = website;
        this.hasWebsite = (website != null && !website.isBlank());
        this.websiteStatus = this.hasWebsite ? "WEBSITE_PRESENT" : "WEBSITE_NOT_FOUND";
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourcePlatform() { return sourcePlatform; }
    public void setSourcePlatform(String sourcePlatform) { this.sourcePlatform = sourcePlatform; }

    public String getSourceQuery() { return sourceQuery; }
    public void setSourceQuery(String sourceQuery) { this.sourceQuery = sourceQuery; }

    public String getResultTitle() { return resultTitle; }
    public void setResultTitle(String resultTitle) { this.resultTitle = resultTitle; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public int getIdentityConfidence() { return identityConfidence; }
    public void setIdentityConfidence(int identityConfidence) { this.identityConfidence = identityConfidence; }

    public int getLocationConfidence() { return locationConfidence; }
    public void setLocationConfidence(int locationConfidence) { this.locationConfidence = locationConfidence; }

    public int getRelevanceConfidence() { return relevanceConfidence; }
    public void setRelevanceConfidence(int relevanceConfidence) { this.relevanceConfidence = relevanceConfidence; }

    public int getEvidenceConfidence() { return evidenceConfidence; }
    public void setEvidenceConfidence(int evidenceConfidence) { this.evidenceConfidence = evidenceConfidence; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public boolean isHasWebsite() { return hasWebsite; }
    public void setHasWebsite(boolean hasWebsite) { this.hasWebsite = hasWebsite; }

    public String getWebsiteStatus() { return websiteStatus; }
    public void setWebsiteStatus(String websiteStatus) { this.websiteStatus = websiteStatus; }

    public String getLeadOpportunity() { return leadOpportunity; }
    public void setLeadOpportunity(String leadOpportunity) { this.leadOpportunity = leadOpportunity; }

    public Instant getDiscoveredAt() { return discoveredAt; }
    public void setDiscoveredAt(Instant discoveredAt) { this.discoveredAt = discoveredAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
