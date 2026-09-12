package com.setuleads.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
public class LeadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "website_url")
    private String websiteUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private LeadSource source;

    @Column(name = "source_query")
    private String sourceQuery;

    @Column(name = "location")
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    private LeadStage stage = LeadStage.NEW;

    @Column(name = "estimated_value")
    private BigDecimal estimatedValue;

    @Column(name = "website_notes", columnDefinition = "TEXT")
    private String websiteNotes;

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @Column(name = "website_score")
    private Integer websiteScore;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "last_contacted_at")
    private OffsetDateTime lastContactedAt;

    @Column(name = "google_place_id")
    private String googlePlaceId;

    @Column(name = "geoapify_place_id")
    private String geoapifyPlaceId;

    @Column(name = "osm_type")
    private String osmType;

    @Column(name = "osm_id")
    private String osmId;

    @Column(name = "overture_id")
    private String overtureId;

    @Column(name = "discovery_area")
    private String discoveryArea;

    @PrePersist
    public void prePersist() {
        if (this.stage == null) {
            this.stage = LeadStage.NEW;
        }
    }

    // Getters and Setters

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
