package com.setuleads.integration.search;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Component
public class BingSearchAdapter implements SearchProvider {

    private static final Logger logger = LoggerFactory.getLogger(BingSearchAdapter.class);

    private static final List<String> NON_BUSINESS_DOMAINS = Arrays.asList(
        "dictionary.com", "vocabulary.com", "merriam-webster.com", "wikipedia.org",
        "wikihow.com", "investopedia.com", "coursera.org", "nytimes.com",
        "bbc.com", "bbc.co.uk", "techtarget.com", "quora.com", "reddit.com",
        "microsoft.com", "chrome.google.com", "chromewebstore.google.com",
        "support.google.com", "play.google.com", "apps.apple.com"
    );

    @Override
    public String getProviderName() {
        return "BING";
    }

    @Override
    public SearchResultPage executeSearch(String query, int page) {
        List<RawSearchResult> rawResults = new ArrayList<>();
        int pageOffset = Math.max(0, (page - 1) * 10 + 1);
        String searchUrl = "https://www.bing.com/search?q=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
                + "&first=" + pageOffset + "&setlang=en-US&cc=US&mkt=en-US";

        try {
            logger.info("BING SEARCH EXECUTE: query='{}', page={}, url={}", query, page, searchUrl);

            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(4500)
                    .get();

            Elements items = doc.select("li.b_algo");
            int pos = 1;
            for (Element item : items) {
                String title = item.select("h2, .result__title").text();
                String snippet = item.select(".b_caption, p, .result__snippet").text();
                String rawUrl = item.select("h2 a, .result__title a").attr("href");
                String url = cleanBingUrl(rawUrl);

                if (url != null && url.startsWith("http") && !isNonBusinessDomain(url)) {
                    rawResults.add(new RawSearchResult(title, url, snippet, pos++, "BING", query));
                }
            }

            return new SearchResultPage("BING", query, page, 200, null, true, rawResults);
        } catch (Exception e) {
            logger.warn("Bing search failed for query '{}' page {}: {}", query, page, e.getMessage());
            return new SearchResultPage("BING", query, page, 500, e.getMessage(), false, rawResults);
        }
    }

    private boolean isNonBusinessDomain(String url) {
        String lower = url.toLowerCase();
        for (String d : NON_BUSINESS_DOMAINS) {
            if (lower.contains(d)) return true;
        }
        return false;
    }

    private String cleanBingUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isEmpty()) return null;
        if (!rawUrl.contains("u=a1")) return rawUrl;
        try {
            int idx = rawUrl.indexOf("u=a1");
            String b64 = rawUrl.substring(idx + 4);
            int endIdx = b64.indexOf("&");
            if (endIdx != -1) b64 = b64.substring(0, endIdx);
            while (b64.length() % 4 != 0) b64 += "=";
            byte[] decoded = Base64.getUrlDecoder().decode(b64);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return rawUrl;
        }
    }
}
