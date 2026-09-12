package com.setuleads.dto;

import java.util.ArrayList;
import java.util.List;

public class MetricsDTO {

    private int geoapifyCandidates = 0;
    private int osmCandidates = 0;
    private int socialXrayCandidates = 0;
    private int overtureCandidates = 0;
    private int rawCandidates = 0;
    private int uniqueBusinesses = 0;
    private int relevantCandidates = 0;
    private int rejectedCandidates = 0;
    private int peopleDetected = 0;
    private int organizationsDetected = 0;
    private int unknownDetected = 0;
    private int duplicatesRemoved = 0;
    private int crossSourceMatches = 0;
    private int instagramCount = 0;
    private int linkedinCount = 0;
    private int linktreeCount = 0;
    private int facebookCount = 0;
    private List<String> expandedTerms = new ArrayList<>();
    private int queriesExecuted = 0;
    private int subAreas = 0;
    private int geoapifyRequests = 0;
    private int osmPasses = 0;
    private int overtureQueries = 0;
    private String geoapifyStatus = "NOT_ATTEMPTED";
    private String osmStatus = "NOT_ATTEMPTED";
    private String socialXrayStatus = "NOT_ATTEMPTED";
    private String overtureStatus = "NOT_ENABLED";

    public int getSocialXrayCandidates() {
        return socialXrayCandidates;
    }

    public void setSocialXrayCandidates(int socialXrayCandidates) {
        this.socialXrayCandidates = socialXrayCandidates;
    }

    public int getPeopleDetected() {
        return peopleDetected;
    }

    public void setPeopleDetected(int peopleDetected) {
        this.peopleDetected = peopleDetected;
    }

    public int getOrganizationsDetected() {
        return organizationsDetected;
    }

    public void setOrganizationsDetected(int organizationsDetected) {
        this.organizationsDetected = organizationsDetected;
    }

    public int getUnknownDetected() {
        return unknownDetected;
    }

    public void setUnknownDetected(int unknownDetected) {
        this.unknownDetected = unknownDetected;
    }

    public int getDuplicatesRemoved() {
        return duplicatesRemoved;
    }

    public void setDuplicatesRemoved(int duplicatesRemoved) {
        this.duplicatesRemoved = duplicatesRemoved;
    }

    public int getInstagramCount() {
        return instagramCount;
    }

    public void setInstagramCount(int instagramCount) {
        this.instagramCount = instagramCount;
    }

    public int getLinkedinCount() {
        return linkedinCount;
    }

    public void setLinkedinCount(int linkedinCount) {
        this.linkedinCount = linkedinCount;
    }

    public int getLinktreeCount() {
        return linktreeCount;
    }

    public void setLinktreeCount(int linktreeCount) {
        this.linktreeCount = linktreeCount;
    }

    public int getFacebookCount() {
        return facebookCount;
    }

    public void setFacebookCount(int facebookCount) {
        this.facebookCount = facebookCount;
    }

    public String getSocialXrayStatus() {
        return socialXrayStatus;
    }

    public void setSocialXrayStatus(String socialXrayStatus) {
        this.socialXrayStatus = socialXrayStatus;
    }

    public int getRelevantCandidates() {
        return relevantCandidates;
    }

    public void setRelevantCandidates(int relevantCandidates) {
        this.relevantCandidates = relevantCandidates;
    }

    public int getRejectedCandidates() {
        return rejectedCandidates;
    }

    public void setRejectedCandidates(int rejectedCandidates) {
        this.rejectedCandidates = rejectedCandidates;
    }

    // Legacy fallback getters/setters for frontend compatibility
    public int getGoogleCandidates() {
        return geoapifyCandidates;
    }

    public String getGoogleStatus() {
        return geoapifyStatus;
    }

    // Getters and Setters

    public int getGeoapifyCandidates() {
        return geoapifyCandidates;
    }

    public void setGeoapifyCandidates(int geoapifyCandidates) {
        this.geoapifyCandidates = geoapifyCandidates;
    }

    public int getOsmCandidates() {
        return osmCandidates;
    }

    public void setOsmCandidates(int osmCandidates) {
        this.osmCandidates = osmCandidates;
    }

    public int getOvertureCandidates() {
        return overtureCandidates;
    }

    public void setOvertureCandidates(int overtureCandidates) {
        this.overtureCandidates = overtureCandidates;
    }

    public int getRawCandidates() {
        return rawCandidates;
    }

    public void setRawCandidates(int rawCandidates) {
        this.rawCandidates = rawCandidates;
    }

    public int getUniqueBusinesses() {
        return uniqueBusinesses;
    }

    public void setUniqueBusinesses(int uniqueBusinesses) {
        this.uniqueBusinesses = uniqueBusinesses;
    }

    public int getCrossSourceMatches() {
        return crossSourceMatches;
    }

    public void setCrossSourceMatches(int crossSourceMatches) {
        this.crossSourceMatches = crossSourceMatches;
    }

    public List<String> getExpandedTerms() {
        return expandedTerms;
    }

    public void setExpandedTerms(List<String> expandedTerms) {
        this.expandedTerms = expandedTerms;
    }

    public int getQueriesExecuted() {
        return queriesExecuted;
    }

    public void setQueriesExecuted(int queriesExecuted) {
        this.queriesExecuted = queriesExecuted;
    }

    public int getSubAreas() {
        return subAreas;
    }

    public void setSubAreas(int subAreas) {
        this.subAreas = subAreas;
    }

    public int getGeoapifyRequests() {
        return geoapifyRequests;
    }

    public void setGeoapifyRequests(int geoapifyRequests) {
        this.geoapifyRequests = geoapifyRequests;
    }

    public int getOsmPasses() {
        return osmPasses;
    }

    public void setOsmPasses(int osmPasses) {
        this.osmPasses = osmPasses;
    }

    public int getOvertureQueries() {
        return overtureQueries;
    }

    public void setOvertureQueries(int overtureQueries) {
        this.overtureQueries = overtureQueries;
    }

    public String getGeoapifyStatus() {
        return geoapifyStatus;
    }

    public void setGeoapifyStatus(String geoapifyStatus) {
        this.geoapifyStatus = geoapifyStatus;
    }

    public String getOsmStatus() {
        return osmStatus;
    }

    public void setOsmStatus(String osmStatus) {
        this.osmStatus = osmStatus;
    }

    public String getOvertureStatus() {
        return overtureStatus;
    }

    public void setOvertureStatus(String overtureStatus) {
        this.overtureStatus = overtureStatus;
    }
}
