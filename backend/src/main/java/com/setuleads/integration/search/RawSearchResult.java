package com.setuleads.integration.search;

public class RawSearchResult {
    private String title;
    private String url;
    private String snippet;
    private int position;
    private String searchEngine;
    private String query;

    public RawSearchResult() {}

    public RawSearchResult(String title, String url, String snippet, int position, String searchEngine, String query) {
        this.title = title;
        this.url = url;
        this.snippet = snippet;
        this.position = position;
        this.searchEngine = searchEngine;
        this.query = query;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public String getSearchEngine() { return searchEngine; }
    public void setSearchEngine(String searchEngine) { this.searchEngine = searchEngine; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}
