package com.setuleads.dto;

public class SourceEvidence {
    private String provider;       // e.g. "SOCIAL_XRAY", "SMART_PASTE", "GEOAPIFY", "OPENSTREETMAP"
    private String platform;       // e.g. "INSTAGRAM", "LINKEDIN", "LINKTREE", "FACEBOOK", "PASTED_TEXT"
    private String sourceUrl;      // Target profile or SERP link
    private String sourceQuery;    // The dork or query string used
    private String resultTitle;    // Title string
    private String snippet;        // Snippet text from source
    private String extractedText;  // Raw extracted snippet or block
    private String discoveredAt;   // ISO timestamp
    private String evidenceType;   // "SEARCH_RESULT", "PASTED_CLIPBOARD", "MAP_DIRECTORY"

    public SourceEvidence() {}

    public SourceEvidence(String provider, String platform, String sourceUrl, String sourceQuery,
                          String resultTitle, String snippet, String discoveredAt, String evidenceType) {
        this.provider = provider;
        this.platform = platform;
        this.sourceUrl = sourceUrl;
        this.sourceQuery = sourceQuery;
        this.resultTitle = resultTitle;
        this.snippet = snippet;
        this.discoveredAt = discoveredAt;
        this.evidenceType = evidenceType;
    }

    // Getters and Setters

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getSourceQuery() {
        return sourceQuery;
    }

    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    public String getResultTitle() {
        return resultTitle;
    }

    public void setResultTitle(String resultTitle) {
        this.resultTitle = resultTitle;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public String getDiscoveredAt() {
        return discoveredAt;
    }

    public void setDiscoveredAt(String discoveredAt) {
        this.discoveredAt = discoveredAt;
    }

    public String getEvidenceType() {
        return evidenceType;
    }

    public void setEvidenceType(String evidenceType) {
        this.evidenceType = evidenceType;
    }
}
