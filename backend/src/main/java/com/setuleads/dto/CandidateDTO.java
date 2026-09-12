package com.setuleads.dto;

import java.util.List;

public class CandidateDTO {

    private String id;
    private String businessName;
    private String socialHandle;
    private String whatsapp;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String email;
    private String websiteUrl;
    private List<String> categories;
    private String businessStatus;
    private String sourceQuery;
    private String provider; // "GEOAPIFY", "OPENSTREETMAP", "OVERTURE", "SOCIAL_XRAY"
    private String geoapifyPlaceId;
    private String googlePlaceId;
    private String osmType;
    private String osmId;
    private String overtureId;
    private String areaName;
    private com.setuleads.entity.EntityType entityType = com.setuleads.entity.EntityType.BUSINESS;
    private Double identityConfidence = 0.85;
    private Double evidenceConfidence = 0.85;
    private SourceEvidence sourceEvidence;
    private String websiteStatus; // "OFFICIAL_WEBSITE", "NO_WEBSITE_DISCOVERED", "INSPECTION_FAILED"
    private String opportunityType; // "WEBSITE_CREATION", "WEBSITE_AUDIT"
    private Double relevanceScore;
    private String relevanceStatus; // "RELEVANT" or "REJECTED"
    private String confidenceLevel; // "HIGH_CONFIDENCE", "MEDIUM_CONFIDENCE", "LOW_CONFIDENCE", "REJECTED"
    private List<String> matchedSignals;
    private List<String> negativeSignals;
    private List<String> relevanceReasons;
    private List<String> rejectionReasons;

    private Integer businessFitScore = 85;
    private Integer contactabilityScore = 50;
    private Integer websiteOpportunityScore = 70;
    private Integer leadOpportunityScore = 80;
    private Double locationConfidence = 0.85;
    private String qualificationLevel = "HIGH";
    private String matchReason;
    private String websiteOpportunityReason;
    private String decisionMakerName;
    private String decisionMakerTitle;
    private List<String> websiteIssues;
    private List<String> positiveEvidence;
    private List<String> negativeEvidence;

    private String aiReasoning;
    private List<String> aiPitchAngles;
    private List<String> aiWebsiteStrengths;
    private List<String> aiWebsiteIssues;
    private Boolean isAiVerified = false;

    // Getters and Setters

    public String getAiReasoning() { return aiReasoning; }
    public void setAiReasoning(String aiReasoning) { this.aiReasoning = aiReasoning; }

    public List<String> getAiPitchAngles() { return aiPitchAngles; }
    public void setAiPitchAngles(List<String> aiPitchAngles) { this.aiPitchAngles = aiPitchAngles; }

    public List<String> getAiWebsiteStrengths() { return aiWebsiteStrengths; }
    public void setAiWebsiteStrengths(List<String> aiWebsiteStrengths) { this.aiWebsiteStrengths = aiWebsiteStrengths; }

    public List<String> getAiWebsiteIssues() { return aiWebsiteIssues; }
    public void setAiWebsiteIssues(List<String> aiWebsiteIssues) { this.aiWebsiteIssues = aiWebsiteIssues; }

    public Boolean getIsAiVerified() { return isAiVerified; }
    public void setIsAiVerified(Boolean isAiVerified) { this.isAiVerified = isAiVerified; }

    public Integer getBusinessFitScore() { return businessFitScore; }
    public void setBusinessFitScore(Integer businessFitScore) { this.businessFitScore = businessFitScore; }

    public Integer getContactabilityScore() { return contactabilityScore; }
    public void setContactabilityScore(Integer contactabilityScore) { this.contactabilityScore = contactabilityScore; }

    public Integer getWebsiteOpportunityScore() { return websiteOpportunityScore; }
    public void setWebsiteOpportunityScore(Integer websiteOpportunityScore) { this.websiteOpportunityScore = websiteOpportunityScore; }

    public Integer getLeadOpportunityScore() { return leadOpportunityScore; }
    public void setLeadOpportunityScore(Integer leadOpportunityScore) { this.leadOpportunityScore = leadOpportunityScore; }

    public Double getLocationConfidence() { return locationConfidence; }
    public void setLocationConfidence(Double locationConfidence) { this.locationConfidence = locationConfidence; }

    public String getQualificationLevel() { return qualificationLevel; }
    public void setQualificationLevel(String qualificationLevel) { this.qualificationLevel = qualificationLevel; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getWebsiteOpportunityReason() { return websiteOpportunityReason; }
    public void setWebsiteOpportunityReason(String websiteOpportunityReason) { this.websiteOpportunityReason = websiteOpportunityReason; }

    public String getDecisionMakerName() { return decisionMakerName; }
    public void setDecisionMakerName(String decisionMakerName) { this.decisionMakerName = decisionMakerName; }

    public String getDecisionMakerTitle() { return decisionMakerTitle; }
    public void setDecisionMakerTitle(String decisionMakerTitle) { this.decisionMakerTitle = decisionMakerTitle; }

    public List<String> getWebsiteIssues() { return websiteIssues; }
    public void setWebsiteIssues(List<String> websiteIssues) { this.websiteIssues = websiteIssues; }

    public List<String> getPositiveEvidence() { return positiveEvidence; }
    public void setPositiveEvidence(List<String> positiveEvidence) { this.positiveEvidence = positiveEvidence; }

    public List<String> getNegativeEvidence() { return negativeEvidence; }
    public void setNegativeEvidence(List<String> negativeEvidence) { this.negativeEvidence = negativeEvidence; }

    public String getSocialHandle() {
        return socialHandle;
    }

    public void setSocialHandle(String socialHandle) {
        this.socialHandle = socialHandle;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public com.setuleads.entity.EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(com.setuleads.entity.EntityType entityType) {
        this.entityType = entityType;
    }

    public Double getIdentityConfidence() {
        return identityConfidence;
    }

    public void setIdentityConfidence(Double identityConfidence) {
        this.identityConfidence = identityConfidence;
    }

    public Double getEvidenceConfidence() {
        return evidenceConfidence;
    }

    public void setEvidenceConfidence(Double evidenceConfidence) {
        this.evidenceConfidence = evidenceConfidence;
    }

    public SourceEvidence getSourceEvidence() {
        return sourceEvidence;
    }

    public void setSourceEvidence(SourceEvidence sourceEvidence) {
        this.sourceEvidence = sourceEvidence;
    }

    public String getWebsiteStatus() {
        return websiteStatus;
    }

    public void setWebsiteStatus(String websiteStatus) {
        this.websiteStatus = websiteStatus;
    }

    public String getOpportunityType() {
        return opportunityType;
    }

    public void setOpportunityType(String opportunityType) {
        this.opportunityType = opportunityType;
    }

    public Double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(Double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getRelevanceStatus() {
        return relevanceStatus;
    }

    public void setRelevanceStatus(String relevanceStatus) {
        this.relevanceStatus = relevanceStatus;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(String confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public List<String> getMatchedSignals() {
        return matchedSignals;
    }

    public void setMatchedSignals(List<String> matchedSignals) {
        this.matchedSignals = matchedSignals;
    }

    public List<String> getNegativeSignals() {
        return negativeSignals;
    }

    public void setNegativeSignals(List<String> negativeSignals) {
        this.negativeSignals = negativeSignals;
    }

    public List<String> getRelevanceReasons() {
        return relevanceReasons;
    }

    public void setRelevanceReasons(List<String> relevanceReasons) {
        this.relevanceReasons = relevanceReasons;
    }

    public List<String> getRejectionReasons() {
        return rejectionReasons;
    }

    public void setRejectionReasons(List<String> rejectionReasons) {
        this.rejectionReasons = rejectionReasons;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public String getBusinessStatus() {
        return businessStatus;
    }

    public void setBusinessStatus(String businessStatus) {
        this.businessStatus = businessStatus;
    }

    public String getSourceQuery() {
        return sourceQuery;
    }

    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getGeoapifyPlaceId() {
        return geoapifyPlaceId;
    }

    public void setGeoapifyPlaceId(String geoapifyPlaceId) {
        this.geoapifyPlaceId = geoapifyPlaceId;
    }

    public String getGooglePlaceId() {
        return googlePlaceId;
    }

    public void setGooglePlaceId(String googlePlaceId) {
        this.googlePlaceId = googlePlaceId;
    }

    public String getOsmType() {
        return osmType;
    }

    public void setOsmType(String osmType) {
        this.osmType = osmType;
    }

    public String getOsmId() {
        return osmId;
    }

    public void setOsmId(String osmId) {
        this.osmId = osmId;
    }

    public String getOvertureId() {
        return overtureId;
    }

    public void setOvertureId(String overtureId) {
        this.overtureId = overtureId;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }
}
