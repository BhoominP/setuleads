package com.setuleads.service.extraction;

import com.setuleads.entity.EntityType;
import com.setuleads.integration.search.RawSearchResult;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class EntityExtractor {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:(?:\\+91[\\s-]*)?|(?:0[\\s-]*)?)[6-9]\\d{9}");
    private static final Pattern WHATSAPP_PATTERN = Pattern.compile("wa\\.me/(\\d+)|whatsapp:?\\s*(\\+?\\d+)");
    private static final Pattern WEBSITE_PATTERN = Pattern.compile("https?://(?!www\\.instagram\\.com|www\\.linkedin\\.com|www\\.facebook\\.com|linktr\\.ee|t\\.co)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    public DiscoveredBusiness extract(RawSearchResult raw) {
        DiscoveredBusiness business = new DiscoveredBusiness();
        business.setSource("SOCIAL_XRAY");
        business.setSourceUrl(raw.getUrl());
        business.setSourceQuery(raw.getQuery());
        business.setResultTitle(raw.getTitle());
        business.setSnippet(raw.getSnippet());
        business.setExtractedText((raw.getTitle() != null ? raw.getTitle() : "") + " " + (raw.getSnippet() != null ? raw.getSnippet() : ""));

        String url = raw.getUrl() != null ? raw.getUrl().toLowerCase() : "";
        String title = raw.getTitle() != null ? raw.getTitle() : "";
        String snippet = raw.getSnippet() != null ? raw.getSnippet() : "";
        String text = title + " " + snippet;

        // 1. Identify Platform & Handle / URL Structure
        if (url.contains("instagram.com")) {
            business.setSourcePlatform("INSTAGRAM");
            parseInstagramUrl(url, title, snippet, business);
        } else if (url.contains("linkedin.com")) {
            business.setSourcePlatform("LINKEDIN");
            parseLinkedInUrl(url, title, snippet, business);
        } else if (url.contains("linktr.ee")) {
            business.setSourcePlatform("LINKTREE");
            parseLinktreeUrl(url, title, snippet, business);
        } else if (url.contains("facebook.com")) {
            business.setSourcePlatform("FACEBOOK");
            parseFacebookUrl(url, title, snippet, business);
        } else {
            business.setSourcePlatform("WEB");
            business.setEntityType(EntityType.UNKNOWN);
        }

        // 2. Extract Contact Info
        extractContacts(text, business);

        // 3. Entity Classification (if not strictly assigned by URL type)
        classifyEntity(text, business);

        // 4. Clean Business Name if missing or raw
        if (business.getBusinessName() == null || business.getBusinessName().isBlank()) {
            business.setBusinessName(deriveBusinessName(title, business.getSocialHandle()));
        }

        return business;
    }

    private void parseInstagramUrl(String url, String title, String snippet, DiscoveredBusiness business) {
        if (url.contains("/p/") || url.contains("/reel/") || url.contains("/tv/") || url.contains("/stories/")) {
            Matcher handleMatcher = Pattern.compile("@([a-zA-Z0-9._]+)").matcher(title + " " + snippet);
            if (handleMatcher.find()) {
                business.setSocialHandle(handleMatcher.group(1));
            }
            business.setIdentityConfidence(70);
        } else {
            Matcher profileMatcher = Pattern.compile("instagram\\.com/([a-zA-Z0-9._]+)").matcher(url);
            if (profileMatcher.find()) {
                String handle = profileMatcher.group(1);
                if (!handle.equalsIgnoreCase("p") && !handle.equalsIgnoreCase("reel") && !handle.equalsIgnoreCase("explore")) {
                    business.setSocialHandle(handle);
                    business.setIdentityConfidence(90);
                }
            }
        }
    }

    private void parseLinkedInUrl(String url, String title, String snippet, DiscoveredBusiness business) {
        if (url.contains("/in/")) {
            business.setEntityType(EntityType.PERSON);
            Matcher handleMatcher = Pattern.compile("linkedin\\.com/in/([a-zA-Z0-9-]+)").matcher(url);
            if (handleMatcher.find()) {
                business.setSocialHandle(handleMatcher.group(1));
            }
            business.setIdentityConfidence(60);
        } else if (url.contains("/company/")) {
            business.setEntityType(EntityType.BUSINESS);
            Matcher handleMatcher = Pattern.compile("linkedin\\.com/company/([a-zA-Z0-9-]+)").matcher(url);
            if (handleMatcher.find()) {
                business.setSocialHandle(handleMatcher.group(1));
            }
            business.setIdentityConfidence(95);
        } else {
            business.setIdentityConfidence(70);
        }
    }

    private void parseLinktreeUrl(String url, String title, String snippet, DiscoveredBusiness business) {
        Matcher handleMatcher = Pattern.compile("linktr\\.ee/([a-zA-Z0-9._-]+)").matcher(url);
        if (handleMatcher.find()) {
            business.setSocialHandle(handleMatcher.group(1));
            business.setIdentityConfidence(85);
        }
    }

    private void parseFacebookUrl(String url, String title, String snippet, DiscoveredBusiness business) {
        Matcher handleMatcher = Pattern.compile("facebook\\.com/([a-zA-Z0-9._-]+)").matcher(url);
        if (handleMatcher.find()) {
            String handle = handleMatcher.group(1);
            if (!handle.equalsIgnoreCase("pages") && !handle.equalsIgnoreCase("groups") && !handle.equalsIgnoreCase("people")) {
                business.setSocialHandle(handle);
                business.setIdentityConfidence(80);
            }
        }
    }

    private void extractContacts(String text, DiscoveredBusiness business) {
        // Email
        Matcher emailMatcher = EMAIL_PATTERN.matcher(text);
        if (emailMatcher.find()) {
            business.setEmail(emailMatcher.group(0));
        }

        // Phone
        Matcher phoneMatcher = PHONE_PATTERN.matcher(text);
        if (phoneMatcher.find()) {
            business.setPhone(phoneMatcher.group(0).replaceAll("[^0-9+]", ""));
        }

        // WhatsApp
        Matcher waMatcher = WHATSAPP_PATTERN.matcher(text);
        if (waMatcher.find()) {
            String wa = waMatcher.group(1) != null ? waMatcher.group(1) : waMatcher.group(2);
            business.setWhatsapp(wa);
        }

        // External Website
        Matcher webMatcher = WEBSITE_PATTERN.matcher(text);
        if (webMatcher.find()) {
            business.setWebsite(webMatcher.group(0));
        }
    }

    private void classifyEntity(String text, DiscoveredBusiness business) {
        if (business.getEntityType() == EntityType.PERSON) {
            return;
        }

        String norm = text.toLowerCase();

        // 1. Dictionary, Informational Article, Media
        if (norm.contains("definition, meaning") || norm.contains("meaning & synonyms") || norm.contains("meaning and synonyms") ||
            norm.contains("what is") || norm.contains("types of") || norm.contains("types & importance") ||
            norm.contains("the new york times") || norm.contains("bbc technology") || norm.contains("bbc news") ||
            norm.contains("wikipedia") || norm.contains("wikihow") || norm.contains("dictionary.com") ||
            norm.contains("vocabulary.com") || norm.contains("investopedia") || norm.contains("coursera")) {
            business.setEntityType(EntityType.ARTICLE);
            return;
        }

        // 2. Event Classification
        if (norm.contains("networking event") || norm.contains("startup event") || norm.contains("summit 20") ||
            norm.contains("conference") || norm.contains("hackathon") || norm.contains("webinar") ||
            norm.contains("workshop") || norm.contains("meetup")) {
            business.setEntityType(EntityType.EVENT);
            return;
        }

        // 3. Program / Training Classification
        if (norm.contains("training program") || norm.contains("entrepreneurship program") || norm.contains("university program") ||
            norm.contains("government program") || norm.contains("accelerator program") || norm.contains("incubation program") ||
            norm.contains("course") || norm.contains("workshop series")) {
            business.setEntityType(EntityType.PROGRAM);
            return;
        }

        // 4. Institutional Classification
        if (norm.contains("corporation institute") || norm.contains("national institute") || norm.contains("university") ||
            norm.contains("department of") || norm.contains("government of") || norm.contains("i-hub gujarat")) {
            business.setEntityType(EntityType.INSTITUTION);
            return;
        }

        // 5. Person Classification (e.g. "John Smith Founder")
        Pattern personPattern = Pattern.compile("^[a-z]+\\s+[a-z]+(?:\\s+[-|–]\\s*|\\s*\\|\\s*)(?:founder|entrepreneur|developer|designer)\\b");
        if (personPattern.matcher(norm.trim()).find() && (business.getWebsite() == null || !business.getWebsite().contains("."))) {
            business.setEntityType(EntityType.PERSON);
            return;
        }

        // 6. Business / Commercial Indicators
        if (norm.contains("studio") || norm.contains("agency") || norm.contains("infotech") || norm.contains("technologies") ||
            norm.contains("solutions") || norm.contains("fashion") || norm.contains("company") || norm.contains("services") ||
            norm.contains("pvt ltd") || norm.contains("llp") || norm.contains("official") || norm.contains("store") ||
            norm.contains("manufacturer") || norm.contains("hiring") || norm.contains("developer wanted") ||
            norm.contains("saas") || norm.contains("software") || norm.contains("boutique") || norm.contains("bakery")) {
            business.setEntityType(EntityType.BUSINESS);
            return;
        }

        // Default based on social handle or footprint
        if (business.getSocialHandle() != null && !business.getSocialHandle().isBlank()) {
            business.setEntityType(EntityType.BUSINESS);
        } else {
            business.setEntityType(EntityType.UNKNOWN);
        }
    }

    private String deriveBusinessName(String title, String handle) {
        if (title != null && !title.isBlank()) {
            String cleaned = title.split("•")[0].split("\\|")[0].split("- Instagram")[0].split("on Facebook")[0].trim();
            int parenIdx = cleaned.indexOf('(');
            if (parenIdx > 0) {
                cleaned = cleaned.substring(0, parenIdx).trim();
            }
            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }

        if (handle != null && !handle.isBlank()) {
            String formatted = handle.replace('_', ' ').replace('.', ' ').trim();
            if (formatted.length() > 0) {
                return Character.toUpperCase(formatted.charAt(0)) + formatted.substring(1);
            }
        }

        return "Unknown Entity";
    }
}
