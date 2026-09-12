package com.setuleads.dto;

import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class LeadDTO {

    private UUID id;
    private String businessName;
    private String contactName;
    private String email;
    private String phone;
    private String websiteUrl;
    private LeadSource source;
    private String sourceQuery;
    private String location;
    private LeadStage stage;
    private BigDecimal estimatedValue;
    private String websiteNotes;
    private String generalNotes;
    private Integer websiteScore;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime lastContactedAt;
    private String googlePlaceId;
    private String geoapifyPlaceId;
    private String osmType;
    private String osmId;
    private String overtureId;
    private String discoveryArea;

    private String aiReasoning;
    private java.util.List<String> aiPitchAngles;
    private Boolean isAiVerified = false;

    // Getters and Setters

    public String getAiReasoning() { return aiReasoning; }
    public void setAiReasoning(String aiReasoning) { this.aiReasoning = aiReasoning; }

    public java.util.List<String> getAiPitchAngles() { return aiPitchAngles; }
    public void setAiPitchAngles(java.util.List<String> aiPitchAngles) { this.aiPitchAngles = aiPitchAngles; }

    public Boolean getIsAiVerified() { return isAiVerified; }
    public void setIsAiVerified(Boolean isAiVerified) { this.isAiVerified = isAiVerified; }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public LeadSource getSource() {
        return source;
    }

    public void setSource(LeadSource source) {
        this.source = source;
    }

    public String getSourceQuery() {
        return sourceQuery;
    }

    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LeadStage getStage() {
        return stage;
    }

    public void setStage(LeadStage stage) {
        this.stage = stage;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public String getWebsiteNotes() {
        return websiteNotes;
    }

    public void setWebsiteNotes(String websiteNotes) {
        this.websiteNotes = websiteNotes;
    }

    public String getGeneralNotes() {
        return generalNotes;
    }

    public void setGeneralNotes(String generalNotes) {
        this.generalNotes = generalNotes;
    }

    public Integer getWebsiteScore() {
        return websiteScore;
    }

    public void setWebsiteScore(Integer websiteScore) {
        this.websiteScore = websiteScore;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public OffsetDateTime getLastContactedAt() {
        return lastContactedAt;
    }

    public void setLastContactedAt(OffsetDateTime lastContactedAt) {
        this.lastContactedAt = lastContactedAt;
    }

    public String getGooglePlaceId() {
        return googlePlaceId;
    }

    public void setGooglePlaceId(String googlePlaceId) {
        this.googlePlaceId = googlePlaceId;
    }

    public String getGeoapifyPlaceId() {
        return geoapifyPlaceId;
    }

    public void setGeoapifyPlaceId(String geoapifyPlaceId) {
        this.geoapifyPlaceId = geoapifyPlaceId;
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

    public String getDiscoveryArea() {
        return discoveryArea;
    }

    public void setDiscoveryArea(String discoveryArea) {
        this.discoveryArea = discoveryArea;
    }
}
