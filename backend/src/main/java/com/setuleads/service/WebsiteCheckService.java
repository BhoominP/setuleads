package com.setuleads.service;

import com.setuleads.dto.WebsiteCheckResponse;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WebsiteCheckService {

    private static final Logger logger = LoggerFactory.getLogger(WebsiteCheckService.class);

    public boolean isCustomCompanyWebsite(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) return false;
        String u = rawUrl.toLowerCase().trim();
        if (u.contains("facebook.com") || u.contains("instagram.com") || u.contains("linkedin.com") ||
            u.contains("linktr.ee") || u.contains("yelp.com") || u.contains("yellowpages.com") ||
            u.contains("justdial.com") || u.contains("tripadvisor.com") || u.contains("google.com") ||
            u.contains("twitter.com") || u.contains("x.com") || u.contains("youtube.com")) {
            return false;
        }
        return u.contains(".") && !u.endsWith(".");
    }

    public WebsiteCheckResponse inspectWebsite(String rawUrl) {
        WebsiteCheckResponse res = new WebsiteCheckResponse();
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            res.setScore(100); // Perfect quality for no site (or N/A)
            res.setRedesignOpportunityScore(0);
            res.setWebsiteStatus("NOT_FOUND");
            res.setIssues(List.of("No website discovered for this business"));
            res.setWebsiteOpportunityReason("No custom domain available to audit");
            return res;
        }

        if (!isCustomCompanyWebsite(rawUrl)) {
            res.setUrl(rawUrl);
            res.setScore(100);
            res.setRedesignOpportunityScore(0);
            res.setWebsiteStatus("NOT_FOUND");
            res.setIssues(List.of("Directory / Social URL provided instead of custom business domain"));
            res.setWebsiteOpportunityReason("Social or directory profile url, not a custom business website");
            return res;
        }

        String formattedUrl = rawUrl.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = "https://" + formattedUrl;
        }
        res.setUrl(formattedUrl);
        boolean isHttps = formattedUrl.startsWith("https://");
        res.setHttps(isHttps);

        List<String> issues = new ArrayList<>();
        int websiteQualityScore = 100; // Starts at 100, deducted per flaw
        int redesignOpportunity = 0;   // Starts at 0, increased per observable flaw

        // 1. Technical Signal: HTTPS Protocol
        if (!isHttps) {
            websiteQualityScore -= 20;
            redesignOpportunity += 20;
            issues.add("Insecure HTTP protocol — site lacks valid SSL encryption.");
        }

        long startTime = System.currentTimeMillis();
        try {
            Connection.Response response = Jsoup.connect(formattedUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(8000)
                    .followRedirects(true)
                    .execute();

            long elapsed = System.currentTimeMillis() - startTime;
            res.setResponseTimeMs(elapsed);
            res.setHttpStatus(response.statusCode());

            if (response.statusCode() >= 400) {
                res.setScore(30);
                res.setRedesignOpportunityScore(70);
                res.setWebsiteStatus("INACCESSIBLE");
                res.setPlatform("HTTP Error " + response.statusCode());
                issues.add("HTTP Error " + response.statusCode() + " returned by target server.");
                res.setIssues(issues);
                res.setWebsiteOpportunityReason("Target website returned HTTP error " + response.statusCode() + " when accessed");
                return res;
            }

            res.setWebsiteStatus("AUDITED");

            // 2. Performance Signal: Page Load Delay
            if (elapsed > 4000) {
                websiteQualityScore -= 20;
                redesignOpportunity += 25;
                issues.add("Slow page load speed (" + elapsed + " ms) on mobile networks.");
            } else if (elapsed > 2500) {
                websiteQualityScore -= 10;
                redesignOpportunity += 15;
                issues.add("Moderate load delay (" + elapsed + " ms) — optimization recommended.");
            }

            Document doc = response.parse();
            String title = doc.title();
            res.setTitle(title);
            if (title == null || title.trim().length() < 4) {
                websiteQualityScore -= 10;
                redesignOpportunity += 10;
                issues.add("Missing or inadequate HTML title tag for search indexing.");
            }

            String metaDescription = doc.select("meta[name=description]").attr("content");
            if (metaDescription.isEmpty()) {
                metaDescription = doc.select("meta[property=og:description]").attr("content");
            }
            res.setDescription(metaDescription);

            // 3. SEO Signal: Meta Description
            boolean hasMetaDesc = metaDescription != null && metaDescription.trim().length() >= 10;
            res.setHasMetaDescription(hasMetaDesc);
            if (!hasMetaDesc) {
                websiteQualityScore -= 15;
                redesignOpportunity += 15;
                issues.add("Missing SEO meta description tag — search engines fall back to auto snippets.");
            }

            // 4. Mobile Signal: Viewport Responsiveness
            boolean hasViewport = !doc.select("meta[name=viewport]").isEmpty();
            res.setHasMobileViewport(hasViewport);
            if (!hasViewport) {
                websiteQualityScore -= 25;
                redesignOpportunity += 30;
                issues.add("Missing mobile viewport tag — layout breaks or renders un-scaled on phone screens.");
            }

            // 5. Tech Stack & Design Age Signals
            String htmlLower = doc.html().toLowerCase();
            if (htmlLower.contains("wp-content") || htmlLower.contains("wordpress")) {
                res.setPlatform("WordPress CMS");
                if (htmlLower.contains("wp-includes/js/jquery/jquery.js") && !htmlLower.contains("wp-element")) {
                    redesignOpportunity += 10;
                    issues.add("Legacy WordPress installation — potential plugin asset bloat and outdated theme layout.");
                }
            } else if (htmlLower.contains("wix.com") || htmlLower.contains("wix-image")) {
                res.setPlatform("Wix Platform");
                redesignOpportunity += 15;
                issues.add("Built on template-bound Wix builder platform — design flexibility and page performance limited.");
            } else if (htmlLower.contains("cdn.shopify.com")) {
                res.setPlatform("Shopify");
            } else if (htmlLower.contains("_next/static") || htmlLower.contains("__next_data__")) {
                res.setPlatform("Next.js / React");
            } else {
                res.setPlatform("Custom Web");
            }

            // 6. Conversion Signal: Call to Action & Contact Flow Availability
            boolean hasCta = htmlLower.contains("contact") || htmlLower.contains("book") ||
                             htmlLower.contains("tel:") || htmlLower.contains("mailto:") ||
                             htmlLower.contains("whatsapp") || htmlLower.contains("get a quote") ||
                             htmlLower.contains("schedule");
            if (!hasCta) {
                websiteQualityScore -= 15;
                redesignOpportunity += 15;
                issues.add("Lacks visible Call-To-Action (CTA) or direct booking/contact flow.");
            }

        } catch (Exception e) {
            logger.warn("Website check failed for {}: {}", formattedUrl, e.getMessage());
            long elapsed = System.currentTimeMillis() - startTime;
            res.setResponseTimeMs(elapsed);
            res.setHttpStatus(0);
            res.setPlatform("Unreachable / Blocked");
            res.setHasMobileViewport(false);
            res.setHasMetaDescription(false);
            res.setWebsiteStatus(elapsed > 7000 ? "TIMEOUT" : "BLOCKED");
            websiteQualityScore = 30;
            redesignOpportunity = 40; // Moderate opportunity (needs verification), not manufactured 100
            issues.add("Target site server connection timed out or blocked automated HTTP request.");
        }

        int finalQuality = Math.max(10, Math.min(100, websiteQualityScore));
        int finalOpportunity = Math.max(0, Math.min(100, redesignOpportunity));

        res.setScore(finalQuality);
        res.setRedesignOpportunityScore(finalOpportunity);
        res.setIssues(issues);

        if (issues.isEmpty()) {
            res.setWebsiteOpportunityReason("Website is modern, secure, and fast with no major visible UX/technical flaws detected");
        } else {
            res.setWebsiteOpportunityReason(String.join(". ", issues));
        }

        return res;
    }
}
