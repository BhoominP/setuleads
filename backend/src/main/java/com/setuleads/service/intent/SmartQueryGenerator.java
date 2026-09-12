package com.setuleads.service.intent;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SmartQueryGenerator {

    public SearchIntent createSearchIntent(String originalQuery, String originalLocation) {
        String normQuery = originalQuery != null ? originalQuery.trim().toLowerCase() : "";
        String normLoc = originalLocation != null ? originalLocation.trim().toLowerCase() : "";

        // Extract clean terms if user pasted an explicit Google Dork (e.g. site:instagram.com "startup" "surat" "@gmail.com")
        String cleanQuery = sanitizeDorkQuery(normQuery);

        // Extract city from location (e.g. "Surat, Gujarat" -> "Surat")
        String city = normLoc.contains(",") ? normLoc.split(",")[0].trim() : normLoc;

        List<String> keywords = new ArrayList<>();
        List<String> synonyms = new ArrayList<>();
        List<String> industryTerms = new ArrayList<>();
        List<String> businessTerms = List.of("company", "agency", "services", "studio", "solutions", "firm", "business", "founder", "co-founder", "ceo");
        List<String> negativeTerms = List.of("vacancy", "job vacancy", "salary", "glassdoor", "wikipedia", "course", "degree", "university");

        keywords.add(cleanQuery);

        if (cleanQuery.contains("startup") || cleanQuery.contains("start up") || cleanQuery.contains("startups")) {
            synonyms.addAll(List.of("startup", "startups", "founder", "co-founder", "new venture", "tech startup", "software company", "SaaS", "digital business", "entrepreneur"));
            industryTerms.addAll(List.of("technology", "software", "web development", "digital solutions", "app development", "IT services"));
        } else if (cleanQuery.contains("web") || cleanQuery.contains("website") || cleanQuery.contains("software")) {
            synonyms.addAll(List.of("web development", "website development", "web agency", "software development", "IT company", "tech agency", "full stack"));
            industryTerms.addAll(List.of("technology", "React", "WordPress", "frontend", "digital agency"));
        } else if (cleanQuery.contains("marketing") || cleanQuery.contains("digital")) {
            synonyms.addAll(List.of("digital marketing", "SEO agency", "social media marketing", "performance marketing", "advertising agency", "media agency"));
            industryTerms.addAll(List.of("marketing", "SEO", "branding", "content marketing"));
        } else {
            synonyms.add(cleanQuery);
            industryTerms.add(cleanQuery);
        }

        String intentType = cleanQuery.contains("startup") ? "STARTUP_DISCOVERY" : "BUSINESS_DISCOVERY";

        return new SearchIntent(
                originalQuery,
                cleanQuery,
                originalLocation,
                normLoc,
                intentType,
                keywords,
                synonyms,
                industryTerms,
                businessTerms,
                negativeTerms
        );
    }

    public List<String> generateQueries(SearchIntent intent, int maxTotalQueries) {
        Set<String> queries = new LinkedHashSet<>();
        String rawQuery = intent.getOriginalQuery() != null ? intent.getOriginalQuery().trim() : "";
        String cleanQuery = intent.getNormalizedQuery();
        String loc = intent.getOriginalLocation() != null ? intent.getOriginalLocation().trim() : "";
        String city = loc.contains(",") ? loc.split(",")[0].trim() : loc;

        if (city.isEmpty()) {
            city = loc;
        }

        // If user typed an explicit dork e.g. site:instagram.com "startup" "surat" "@gmail.com"
        if (rawQuery.toLowerCase().contains("site:")) {
            // Fix double quotes or typos e.g. "@gmail.com"" or "suart"
            String sanitizedRaw = rawQuery.replace("\"\"", "\"")
                                          .replaceAll("(?i)\"suart\"", "\"Surat\"")
                                          .replaceAll("(?i)\\bsuart\\b", "Surat");

            queries.add(sanitizedRaw);

            // Also add clean variations derived from user dork
            if (sanitizedRaw.toLowerCase().contains("instagram.com")) {
                queries.add(String.format("site:instagram.com %s %s", cleanQuery, city));
                queries.add(String.format("site:instagram.com \"%s\" \"%s\"", cleanQuery, city));
                queries.add(String.format("site:instagram.com/p/ \"%s\" \"%s\"", cleanQuery, city));
                queries.add(String.format("site:instagram.com/reel/ \"%s\" \"%s\"", cleanQuery, city));
            } else {
                queries.add(sanitizedRaw + " " + city);
            }

            return new ArrayList<>(queries);
        }

        // Standard Query Generation (User entered "startup" or "web development")
        // 1. INSTAGRAM PROFILE & CONTENT QUERIES
        queries.add(String.format("site:instagram.com %s %s", cleanQuery, city));
        queries.add(String.format("site:instagram.com %s %s", cleanQuery, loc));
        queries.add(String.format("site:instagram.com \"%s\" \"%s\"", city, cleanQuery));
        queries.add(String.format("site:instagram.com \"%s\" \"founder\"", city));
        queries.add(String.format("site:instagram.com \"%s\" \"business\"", city));
        queries.add(String.format("site:instagram.com \"%s\" \"technology\"", city));

        // Instagram Posts & Reels
        queries.add(String.format("site:instagram.com/p/ %s %s", cleanQuery, city));
        queries.add(String.format("site:instagram.com/reel/ %s %s", cleanQuery, city));
        queries.add(String.format("site:instagram.com/p/ \"%s\" \"%s\"", cleanQuery, city));
        queries.add(String.format("site:instagram.com/reel/ \"%s\" \"%s\"", cleanQuery, city));

        // Business / Tech variations
        if (cleanQuery.equals("startup") || cleanQuery.equals("startups")) {
            queries.add(String.format("site:instagram.com \"software\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"web development\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"digital agency\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"technology\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"SaaS\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"app development\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"IT company\" \"%s\"", city));
            queries.add(String.format("site:instagram.com \"tech company\" \"%s\"", city));
        }

        // Founder / Digital-First
        queries.add(String.format("site:instagram.com \"founder\" \"%s\"", city));
        queries.add(String.format("site:instagram.com \"co-founder\" \"%s\"", city));
        queries.add(String.format("site:instagram.com \"CEO\" \"%s\"", city));
        queries.add(String.format("site:instagram.com \"%s founder\" \"%s\"", cleanQuery, city));

        // 2. LINKEDIN QUERIES
        queries.add(String.format("site:linkedin.com/company \"%s\" \"%s\"", cleanQuery, city));
        queries.add(String.format("site:linkedin.com/posts \"%s\" \"%s\"", cleanQuery, city));
        queries.add(String.format("site:linkedin.com/in \"%s\" \"%s\"", cleanQuery, city));

        // 3. LINKTREE QUERIES
        queries.add(String.format("site:linktr.ee \"%s\" \"%s\"", cleanQuery, city));

        // 4. FACEBOOK QUERIES
        queries.add(String.format("site:facebook.com \"%s\" \"%s\"", cleanQuery, city));

        List<String> result = new ArrayList<>(queries);
        if (result.size() > maxTotalQueries) {
            return result.subList(0, maxTotalQueries);
        }
        return result;
    }

    private String sanitizeDorkQuery(String input) {
        if (input == null || input.isEmpty()) return "";
        // Strip site: operators and quotes to get pure keyword terms e.g. "site:instagram.com \"startup\" \"suart\" \"@gmail.com\"" -> "startup"
        String stripped = input.replaceAll("(?i)site:[^\\s]+", "")
                               .replaceAll("@\\S+", "")
                               .replace("\"", " ")
                               .replaceAll("(?i)\\bsuart\\b", "surat")
                               .replaceAll("\\s+", " ")
                               .trim();
        return stripped.isEmpty() ? input : stripped;
    }
}
