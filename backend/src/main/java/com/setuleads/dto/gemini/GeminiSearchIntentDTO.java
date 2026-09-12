package com.setuleads.dto.gemini;

import java.util.ArrayList;
import java.util.List;

public class GeminiSearchIntentDTO {
    private String targetEntityType;
    private List<String> categories = new ArrayList<>();
    private String location;
    private boolean websiteRequired;
    private boolean websiteOpportunityRequired;
    private boolean contactabilityPreferred;

    public String getTargetEntityType() { return targetEntityType; }
    public void setTargetEntityType(String targetEntityType) { this.targetEntityType = targetEntityType; }

    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isWebsiteRequired() { return websiteRequired; }
    public void setWebsiteRequired(boolean websiteRequired) { this.websiteRequired = websiteRequired; }

    public boolean isWebsiteOpportunityRequired() { return websiteOpportunityRequired; }
    public void setWebsiteOpportunityRequired(boolean websiteOpportunityRequired) { this.websiteOpportunityRequired = websiteOpportunityRequired; }

    public boolean isContactabilityPreferred() { return contactabilityPreferred; }
    public void setContactabilityPreferred(boolean contactabilityPreferred) { this.contactabilityPreferred = contactabilityPreferred; }
}
