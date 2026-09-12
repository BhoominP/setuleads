package com.setuleads.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DiscoveryResponse {

    private String query;
    private String location;
    private List<CandidateDTO> candidates = new ArrayList<>();
    private MetricsDTO metrics = new MetricsDTO();
    private Map<String, Object> debugInfo;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<CandidateDTO> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<CandidateDTO> candidates) {
        this.candidates = candidates;
    }

    public MetricsDTO getMetrics() {
        return metrics;
    }

    public void setMetrics(MetricsDTO metrics) {
        this.metrics = metrics;
    }

    public Map<String, Object> getDebugInfo() {
        return debugInfo;
    }

    public void setDebugInfo(Map<String, Object> debugInfo) {
        this.debugInfo = debugInfo;
    }
}
