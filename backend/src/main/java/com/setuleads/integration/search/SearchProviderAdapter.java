package com.setuleads.integration.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;

@Component
public class SearchProviderAdapter {

    private static final Logger logger = LoggerFactory.getLogger(SearchProviderAdapter.class);
    private final BingSearchAdapter bingSearchAdapter;
    private final DuckDuckGoSearchAdapter duckDuckGoSearchAdapter;

    public SearchProviderAdapter(BingSearchAdapter bingSearchAdapter, DuckDuckGoSearchAdapter duckDuckGoSearchAdapter) {
        this.bingSearchAdapter = bingSearchAdapter;
        this.duckDuckGoSearchAdapter = duckDuckGoSearchAdapter;
    }

    public static class MultiSearchStats {
        public List<RawSearchResult> allRawResults = new ArrayList<>();
        public Map<String, ProviderPlatformStats> platformStats = new HashMap<>();
        public int totalQueriesExecuted = 0;
        public int totalPagesFetched = 0;
        public boolean hasPartialFailure = false;
        public String globalStatus = "SUCCESS";
    }

    public static class ProviderPlatformStats {
        public String platform;
        public String status = "SUCCESS";
        public int queriesExecuted = 0;
        public int pagesFetched = 0;
        public int rawCount = 0;
        public String lastError;
    }

    public List<SearchResultPage> executeMultiQuerySearch(List<String> queries, int maxPagesPerQuery) {
        List<SearchResultPage> pages = new ArrayList<>();
        if (queries == null || queries.isEmpty()) return pages;

        List<CompletableFuture<SearchResultPage>> futures = new ArrayList<>();
        for (String q : queries) {
            for (int p = 1; p <= maxPagesPerQuery; p++) {
                final int pageNum = p;
                futures.add(CompletableFuture.supplyAsync(() -> {
                    SearchResultPage page = bingSearchAdapter.executeSearch(q, pageNum);
                    if (!page.isSuccess() || page.getResults() == null || page.getResults().isEmpty()) {
                        logger.info("Bing returned 0 results or failed for '{}' (page {}). Triggering DDG fallback...", q, pageNum);
                        page = duckDuckGoSearchAdapter.executeSearch(q, pageNum);
                    }
                    return page;
                }));
            }
        }

        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("Parallel search execution wait limit reached: {}", e.getMessage());
        }

        for (CompletableFuture<SearchResultPage> f : futures) {
            try {
                if (f.isDone() && !f.isCompletedExceptionally()) {
                    SearchResultPage page = f.getNow(null);
                    if (page != null) pages.add(page);
                }
            } catch (Exception ignored) {}
        }
        return pages;
    }

    public MultiSearchStats executeParallelQueries(Map<String, List<String>> platformQueries, int maxPagesPerQuery) {
        MultiSearchStats stats = new MultiSearchStats();
        Set<String> seenUrls = Collections.synchronizedSet(new HashSet<>());
        List<RawSearchResult> aggregatedResults = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : platformQueries.entrySet()) {
            String platform = entry.getKey();
            List<String> dorks = entry.getValue();

            ProviderPlatformStats pStat = new ProviderPlatformStats();
            pStat.platform = platform;
            stats.platformStats.put(platform, pStat);

            for (String dork : dorks) {
                futures.add(CompletableFuture.runAsync(() -> {
                    boolean querySuccess = false;
                    for (int page = 1; page <= maxPagesPerQuery; page++) {
                        pStat.queriesExecuted++;
                        pStat.pagesFetched++;

                        SearchResultPage pageResult = bingSearchAdapter.executeSearch(dork, page);

                        if (!pageResult.isSuccess() || pageResult.getResults().isEmpty()) {
                            // Fallback to DuckDuckGo Adapter
                            logger.info("Bing returned 0 results or failed for '{}' (page {}). Triggering DDG fallback...", dork, page);
                            pageResult = duckDuckGoSearchAdapter.executeSearch(dork, page);
                        }

                        if (pageResult.isSuccess() && !pageResult.getResults().isEmpty()) {
                            querySuccess = true;
                            for (RawSearchResult r : pageResult.getResults()) {
                                if (r.getUrl() != null && !seenUrls.contains(r.getUrl())) {
                                    seenUrls.add(r.getUrl());
                                    aggregatedResults.add(r);
                                    pStat.rawCount++;
                                }
                            }
                        } else if (!pageResult.isSuccess()) {
                            pStat.lastError = pageResult.getError();
                        }
                    }

                    if (!querySuccess && pStat.lastError != null) {
                        pStat.status = "PARTIAL_FAILURE";
                    }
                }));
            }
        }

        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("Parallel search execution wait limit reached: {}", e.getMessage());
            stats.hasPartialFailure = true;
        }

        stats.allRawResults = new ArrayList<>(aggregatedResults);
        for (ProviderPlatformStats ps : stats.platformStats.values()) {
            stats.totalQueriesExecuted += ps.queriesExecuted;
            stats.totalPagesFetched += ps.pagesFetched;
            if ("PARTIAL_FAILURE".equalsIgnoreCase(ps.status) || ps.lastError != null) {
                stats.hasPartialFailure = true;
            }
        }

        if (stats.allRawResults.isEmpty()) {
            stats.globalStatus = stats.hasPartialFailure ? "PARTIAL_FAILURE" : "SUCCESS_ZERO_RESULTS";
        } else if (stats.hasPartialFailure) {
            stats.globalStatus = "PARTIAL";
        } else {
            stats.globalStatus = "SUCCESS";
        }

        return stats;
    }
}
