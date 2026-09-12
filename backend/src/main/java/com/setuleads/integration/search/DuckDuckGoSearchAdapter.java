package com.setuleads.integration.search;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DuckDuckGoSearchAdapter implements SearchProvider {

    private static final Logger logger = LoggerFactory.getLogger(DuckDuckGoSearchAdapter.class);

    private static final List<String> NON_BUSINESS_DOMAINS = Arrays.asList(
        "dictionary.com", "vocabulary.com", "merriam-webster.com", "wikipedia.org",
        "wikihow.com", "investopedia.com", "coursera.org", "nytimes.com",
        "bbc.com", "bbc.co.uk", "techtarget.com", "quora.com", "reddit.com",
        "microsoft.com", "chrome.google.com", "chromewebstore.google.com",
        "support.google.com", "play.google.com", "apps.apple.com"
    );

    @Override
    public String getProviderName() {
        return "DUCKDUCKGO";
    }

    @Override
    public SearchResultPage executeSearch(String query, int page) {
        List<RawSearchResult> rawResults = new ArrayList<>();
        try {
            logger.info("DDG SEARCH EXECUTE: query='{}', page={}", query, page);

            Document doc = Jsoup.connect("https://html.duckduckgo.com/html/")
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Origin", "https://html.duckduckgo.com")
                    .header("Referer", "https://html.duckduckgo.com/")
                    .data("q", query)
                    .data("kl", "us-en")
                    .timeout(5000)
                    .post();

            Elements links = doc.select(".result__title a");
            int pos = 1;
            for (Element a : links) {
                String title = a.text();
                String rawHref = a.attr("href");
                String url = unrollDdgUrl(rawHref);

                if (url == null || !url.startsWith("http") || isNonBusinessDomain(url)) continue;

                String snippet = "";
                Element resultBody = a.closest(".result");
                if (resultBody != null) {
                    Element snippetEl = resultBody.selectFirst(".result__snippet");
                    if (snippetEl != null) {
                        snippet = snippetEl.text();
                    }
                }

                rawResults.add(new RawSearchResult(title, url, snippet, pos++, "DUCKDUCKGO", query));
            }

            return new SearchResultPage("DUCKDUCKGO", query, page, 200, null, true, rawResults);
        } catch (Exception e) {
            logger.warn("DDG search failed for query '{}' page {}: {}", query, page, e.getMessage());
            return new SearchResultPage("DUCKDUCKGO", query, page, 500, e.getMessage(), false, rawResults);
        }
    }

    private boolean isNonBusinessDomain(String url) {
        String lower = url.toLowerCase();
        for (String d : NON_BUSINESS_DOMAINS) {
            if (lower.contains(d)) return true;
        }
        return false;
    }

    private String unrollDdgUrl(String href) {
        if (href == null || href.isEmpty()) return null;
        if (href.contains("uddg=")) {
            try {
                int idx = href.indexOf("uddg=");
                String sub = href.substring(idx + 5);
                int endIdx = sub.indexOf("&");
                if (endIdx != -1) sub = sub.substring(0, endIdx);
                return URLDecoder.decode(sub, StandardCharsets.UTF_8);
            } catch (Exception e) {
                return href;
            }
        }
        return href;
    }
}
