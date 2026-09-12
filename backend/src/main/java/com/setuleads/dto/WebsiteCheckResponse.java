package com.setuleads.dto;

import java.util.ArrayList;
import java.util.List;

public class WebsiteCheckResponse {

    private String url;
    private int score;
    private List<String> issues = new ArrayList<>();
    private String title;
    private String description;
    private boolean isHttps;
    private boolean hasMobileViewport;
    private boolean hasMetaDescription;
    private String platform = "Custom Web";
    private long responseTimeMs;
    private int httpStatus;
    private int redesignOpportunityScore;
    private String websiteStatus = "UNVERIFIED";
    private String websiteOpportunityReason;

    public int getRedesignOpportunityScore() {
        return redesignOpportunityScore;
    }

    public void setRedesignOpportunityScore(int redesignOpportunityScore) {
        this.redesignOpportunityScore = redesignOpportunityScore;
    }

    public String getWebsiteStatus() {
        return websiteStatus;
    }

    public void setWebsiteStatus(String websiteStatus) {
        this.websiteStatus = websiteStatus;
    }

    public String getWebsiteOpportunityReason() {
        return websiteOpportunityReason;
    }

    public void setWebsiteOpportunityReason(String websiteOpportunityReason) {
        this.websiteOpportunityReason = websiteOpportunityReason;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public List<String> getIssues() {
        return issues;
    }

    public void setIssues(List<String> issues) {
        this.issues = issues;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isHttps() {
        return isHttps;
    }

    public void setHttps(boolean https) {
        isHttps = https;
    }

    public boolean isHasMobileViewport() {
        return hasMobileViewport;
    }

    public void setHasMobileViewport(boolean hasMobileViewport) {
        this.hasMobileViewport = hasMobileViewport;
    }

    public boolean isHasMetaDescription() {
        return hasMetaDescription;
    }

    public void setHasMetaDescription(boolean hasMetaDescription) {
        this.hasMetaDescription = hasMetaDescription;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(int httpStatus) {
        this.httpStatus = httpStatus;
    }
}
