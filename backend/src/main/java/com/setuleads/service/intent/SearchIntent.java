package com.setuleads.service.intent;

import com.setuleads.service.RelevanceQualifier.SearchIntentType;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class SearchIntent {

    private String originalQuery;
    private String normalizedQuery;
    private String location;
    private String normalizedLocation;
    private String intentCategory;
    private SearchIntentType intentType;

    private Set<String> keywords = new HashSet<>();
    private Set<String> synonyms = new HashSet<>();
    private Set<String> industryTerms = new HashSet<>();
    private Set<String> businessTerms = new HashSet<>();
    private Set<String> negativeTerms = new HashSet<>();

    private com.setuleads.entity.EntityType targetEntityType = com.setuleads.entity.EntityType.BUSINESS;
    private Set<String> targetCategories = new HashSet<>();
    private Set<String> targetIndustries = new HashSet<>();
    private Set<String> targetLocations = new HashSet<>();
    private Set<String> requiredSignals = new HashSet<>();
    private Set<com.setuleads.entity.EntityType> excludedEntityTypes = new HashSet<>(
        java.util.Arrays.asList(
            com.setuleads.entity.EntityType.EVENT,
            com.setuleads.entity.EntityType.PERSON,
            com.setuleads.entity.EntityType.PROGRAM,
            com.setuleads.entity.EntityType.INSTITUTION,
            com.setuleads.entity.EntityType.MEDIA,
            com.setuleads.entity.EntityType.ARTICLE
        )
    );

    public SearchIntent() {}

    public SearchIntent(String originalQuery, String location, SearchIntentType intentType) {
        this.originalQuery = originalQuery;
        this.normalizedQuery = originalQuery != null ? originalQuery.toLowerCase().trim() : "";
        this.location = location;
        this.normalizedLocation = location != null ? location.toLowerCase().trim() : "";
        this.intentType = intentType;
        this.intentCategory = intentType != null ? intentType.name() : "GENERAL_BUSINESS";
        if (location != null && !location.isBlank()) {
            this.targetLocations.add(location.toLowerCase().trim());
        }
    }

    public SearchIntent(String originalQuery, String normalizedQuery, String location, String normalizedLocation,
                        String intentCategory, Collection<String> keywords, Collection<String> synonyms,
                        Collection<String> industryTerms, Collection<String> businessTerms, Collection<String> negativeTerms) {
        this.originalQuery = originalQuery;
        this.normalizedQuery = normalizedQuery;
        this.location = location;
        this.normalizedLocation = normalizedLocation;
        this.intentCategory = intentCategory;
        if (keywords != null) this.keywords.addAll(keywords);
        if (synonyms != null) this.synonyms.addAll(synonyms);
        if (industryTerms != null) this.industryTerms.addAll(industryTerms);
        if (businessTerms != null) this.businessTerms.addAll(businessTerms);
        if (negativeTerms != null) this.negativeTerms.addAll(negativeTerms);
    }

    public String getOriginalLocation() { return location; }

    public String getOriginalQuery() { return originalQuery; }
    public void setOriginalQuery(String originalQuery) { this.originalQuery = originalQuery; }

    public String getNormalizedQuery() { return normalizedQuery; }
    public void setNormalizedQuery(String normalizedQuery) { this.normalizedQuery = normalizedQuery; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNormalizedLocation() { return normalizedLocation; }
    public void setNormalizedLocation(String normalizedLocation) { this.normalizedLocation = normalizedLocation; }

    public String getIntentCategory() { return intentCategory; }
    public void setIntentCategory(String intentCategory) { this.intentCategory = intentCategory; }

    public SearchIntentType getIntentType() { return intentType; }
    public void setIntentType(SearchIntentType intentType) { this.intentType = intentType; }

    public Set<String> getKeywords() { return keywords; }
    public void setKeywords(Set<String> keywords) { this.keywords = keywords; }

    public Set<String> getSynonyms() { return synonyms; }
    public void setSynonyms(Set<String> synonyms) { this.synonyms = synonyms; }

    public Set<String> getIndustryTerms() { return industryTerms; }
    public void setIndustryTerms(Set<String> industryTerms) { this.industryTerms = industryTerms; }

    public Set<String> getBusinessTerms() { return businessTerms; }
    public void setBusinessTerms(Set<String> businessTerms) { this.businessTerms = businessTerms; }

    public Set<String> getNegativeTerms() { return negativeTerms; }
    public void setNegativeTerms(Set<String> negativeTerms) { this.negativeTerms = negativeTerms; }
}
