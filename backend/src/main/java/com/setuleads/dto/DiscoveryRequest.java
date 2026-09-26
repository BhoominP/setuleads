package com.setuleads.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class DiscoveryRequest {

    @NotBlank(message = "Query is required")
    private String query;

    @NotBlank(message = "Location is required")
    private String location;

    private List<String> sources; // ["GOOGLE_PLACES", "OPENSTREETMAP", "SOCIAL_XRAY"]

    private boolean debug;
    private Boolean useGemini = true;

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

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public Boolean getUseGemini() {
        return useGemini != null ? useGemini : true;
    }

    public void setUseGemini(Boolean useGemini) {
        this.useGemini = useGemini;
    }
}
