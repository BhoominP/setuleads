package com.setuleads.integration.search;

public interface SearchProvider {
    String getProviderName();
    SearchResultPage executeSearch(String query, int page);
}
