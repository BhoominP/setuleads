package com.setuleads.integration.search;

import java.util.ArrayList;
import java.util.List;

public class SearchResultPage {
    private String providerName;
    private String query;
    private int page;
    private int statusCode = 200;
    private String error;
    private boolean isSuccess = true;
    private List<RawSearchResult> results = new ArrayList<>();

    public SearchResultPage() {}

    public SearchResultPage(String providerName, String query, int page, int statusCode, String error, boolean isSuccess, List<RawSearchResult> results) {
        this.providerName = providerName;
        this.query = query;
        this.page = page;
        this.statusCode = statusCode;
        this.error = error;
        this.isSuccess = isSuccess;
        this.results = results != null ? results : new ArrayList<>();
    }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getStatusCode() { return statusCode; }
    public void setStatusCode(int statusCode) { this.statusCode = statusCode; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public boolean isSuccess() { return isSuccess; }
    public void setSuccess(boolean success) { isSuccess = success; }

    public List<RawSearchResult> getResults() { return results; }
    public void setResults(List<RawSearchResult> results) { this.results = results; }
}
