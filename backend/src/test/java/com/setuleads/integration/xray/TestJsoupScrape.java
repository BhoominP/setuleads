package com.setuleads.integration.xray;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class TestJsoupScrape {
    public static void main(String[] args) {
        String[] dorks = {
            "site:instagram.com clothing Los Angeles",
            "site:instagram.com bakery Vadodara",
            "site:linkedin.com/company clothing Los Angeles",
            "site:linktr.ee bakery Vadodara"
        };

        for (String dork : dorks) {
            System.out.println("\n=================== DORK: " + dork + " ===================");
            try {
                String searchUrl = "https://www.bing.com/search?q=" + URLEncoder.encode(dork, StandardCharsets.UTF_8) + "&setlang=en-US&cc=US&mkt=en-US";
                Document doc = Jsoup.connect(searchUrl)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                        .header("Accept-Language", "en-US,en;q=0.9")
                        .timeout(7000)
                        .get();

                Elements results = doc.select("li.b_algo");
                System.out.println("Bing results count: " + results.size());
                int idx = 0;
                for (Element r : results) {
                    idx++;
                    String title = r.select("h2").text();
                    String rawUrl = r.select("h2 a").attr("href");
                    String cleanUrl = cleanBingUrl(rawUrl);
                    System.out.println("  [" + idx + "] Title: " + title);
                    System.out.println("      Raw Href: " + rawUrl);
                    System.out.println("      Clean URL: " + cleanUrl);
                }
            } catch (Exception e) {
                System.err.println("Error: " + e.getMessage());
            }
        }
    }

    private static String cleanBingUrl(String rawUrl) {
        if (rawUrl == null || !rawUrl.contains("u=a1")) return rawUrl;
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
