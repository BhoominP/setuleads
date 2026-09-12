package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import com.setuleads.entity.EntityType;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class IdentityValidator {

    private static final Pattern WORD_BOUNDARY = Pattern.compile("[^a-z0-9]+");

    public static class IdentityValidationResult {
        public EntityType entityType;
        public double identityConfidence;
        public double evidenceConfidence;
        public List<String> identitySignals = new ArrayList<>();
        public List<String> riskSignals = new ArrayList<>();

        public IdentityValidationResult(EntityType entityType, double identityConfidence, double evidenceConfidence) {
            this.entityType = entityType;
            this.identityConfidence = Math.round(identityConfidence * 100.0) / 100.0;
            this.evidenceConfidence = Math.round(evidenceConfidence * 100.0) / 100.0;
        }
    }

    public IdentityValidationResult validate(CandidateDTO candidate, String searchQuery) {
        String name = candidate.getBusinessName() != null ? candidate.getBusinessName().trim() : "";
        String lowerName = name.toLowerCase();
        Set<String> nameTokens = tokenize(lowerName);

        String website = candidate.getWebsiteUrl() != null ? candidate.getWebsiteUrl().toLowerCase() : "";
        String snippet = "";
        String resultTitle = "";

        if (candidate.getSourceEvidence() != null) {
            if (candidate.getSourceEvidence().getSnippet() != null) {
                snippet = candidate.getSourceEvidence().getSnippet().toLowerCase();
            }
            if (candidate.getSourceEvidence().getResultTitle() != null) {
                resultTitle = candidate.getSourceEvidence().getResultTitle().toLowerCase();
            }
        }

        String fullText = (name + " " + resultTitle + " " + snippet).toLowerCase();
        Set<String> fullTokens = tokenize(fullText);

        List<String> signals = new ArrayList<>();
        List<String> risks = new ArrayList<>();

        // =========================================================
        // 0A. APP STORE / SOFTWARE DIRECTORY / HELP PORTAL FILTER
        // =========================================================
        Set<String> appStorePhrases = new HashSet<>(Arrays.asList(
            "microsoft store", "chrome web store", "web store help", "download apps, games",
            "install & manage web apps", "google play", "app store", "macupdate", "softonic",
            "support.google.com", "play.google.com", "apps.apple.com"
        ));

        for (String appPhrase : appStorePhrases) {
            if (fullText.contains(appPhrase) || lowerName.contains(appPhrase) || website.contains(appPhrase)) {
                risks.add("Global app store / extension directory page ('" + appPhrase + "')");
                IdentityValidationResult res = new IdentityValidationResult(EntityType.ORGANIZATION, 0.95, 0.90);
                res.identitySignals.add("app_store_portal: global app/extension download page");
                res.riskSignals.addAll(risks);
                return res;
            }
        }

        // =========================================================
        // 0B. DICTIONARY / INFORMATIONAL ARTICLE / NEWS MEDIA FILTER
        // =========================================================
        Set<String> informationalPhrases = new HashSet<>(Arrays.asList(
            "definition, meaning", "definition & meaning", "meaning & synonyms", "definition, types",
            "what is", "types of", "examples of", "the new york times", "bbc technology", "bbc news",
            "wikipedia", "wikihow", "dictionary.com", "vocabulary.com", "investopedia", "coursera"
        ));

        for (String phrase : informationalPhrases) {
            if (fullText.contains(phrase) || lowerName.contains(phrase)) {
                risks.add("Informational article / dictionary definition detected ('" + phrase + "')");
                IdentityValidationResult res = new IdentityValidationResult(EntityType.ORGANIZATION, 0.95, 0.90);
                res.identitySignals.add("informational_article: generic news/dictionary/educational content");
                res.riskSignals.addAll(risks);
                return res;
            }
        }

        Set<String> informationalTokens = new HashSet<>(Arrays.asList(
            "definition", "definitions", "meaning", "synonyms", "vocabulary", "dictionary",
            "nytimes", "bbc", "wikihow", "wikipedia", "investopedia", "coursera", "merriam", "webster"
        ));

        for (String infoToken : informationalTokens) {
            if (nameTokens.contains(infoToken)) {
                risks.add("Informational token in business name ('" + infoToken + "')");
                IdentityValidationResult res = new IdentityValidationResult(EntityType.ORGANIZATION, 0.90, 0.85);
                res.identitySignals.add("informational_article: token '" + infoToken + "' detected");
                res.riskSignals.addAll(risks);
                return res;
            }
        }

        // =========================================================
        // 1. PERSON PROFILE DETECTION
        // =========================================================
        boolean isLinkedInPersonal = website.contains("linkedin.com/in/");
        boolean isPersonTitle = lowerName.contains(" — ") || lowerName.contains(" - ") || resultTitle.contains(" — ");
        
        Set<String> personalRoles = new HashSet<>(Arrays.asList(
            "engineer", "developer", "architect", "designer", "manager", "director",
            "consultant", "student", "freelancer", "enthusiast", "intern", "founder at", "co-founder at"
        ));

        boolean hasPersonalRole = false;
        for (String role : personalRoles) {
            if (fullText.contains(role)) {
                hasPersonalRole = true;
                break;
            }
        }

        // Person Name Heuristic
        Set<String> commercialTokens = new HashSet<>(Arrays.asList(
            "inc", "ltd", "pvt", "llc", "store", "shop", "studio", "bakery", "boutique",
            "apparel", "clothing", "technologies", "technology", "solutions", "services",
            "lab", "labs", "cafe", "clinic", "co", "company", "works", "brand", "agency",
            "bakes", "enterprise", "enterprises", "industries", "group"
        ));

        boolean hasCommercialToken = false;
        for (String cToken : commercialTokens) {
            if (nameTokens.contains(cToken)) {
                hasCommercialToken = true;
                break;
            }
        }

        if (isLinkedInPersonal || (isPersonTitle && hasPersonalRole && !hasCommercialToken)) {
            risks.add("Individual person profile detected (LinkedIn/Resume bio)");
            IdentityValidationResult res = new IdentityValidationResult(EntityType.PERSON, 0.90, 0.85);
            res.identitySignals.add("personal_profile: LinkedIn/Individual bio detected");
            res.riskSignals.addAll(risks);
            return res;
        }

        // =========================================================
        // 2. ORGANIZATION / INSTITUTE / REVIEW BLOG / MEETUP DETECTION
        // =========================================================
        Set<String> nonBusinessOrgTokens = new HashSet<>(Arrays.asList(
            "institute", "corporation", "department", "university", "college", "school",
            "news", "review", "blog", "meetup", "association", "ministry", "court",
            "rail", "railway", "board", "government", "forum", "community", "wiki",
            "bank", "hospital", "police"
        ));

        String nonBusinessFound = null;
        for (String orgToken : nonBusinessOrgTokens) {
            if (nameTokens.contains(orgToken) || lowerName.contains(orgToken)) {
                if (!orgToken.equals("corporation") || nameTokens.contains("institute") || nameTokens.contains("rail") || nameTokens.contains("bank")) {
                    nonBusinessFound = orgToken;
                    break;
                }
            }
        }

        if (nonBusinessFound != null) {
            risks.add("Non-commercial entity token detected ('" + nonBusinessFound + "')");
            IdentityValidationResult res = new IdentityValidationResult(EntityType.ORGANIZATION, 0.85, 0.80);
            res.identitySignals.add("organization_entity: " + nonBusinessFound);
            res.riskSignals.addAll(risks);
            return res;
        }

        // =========================================================
        // 3. PLACE / GEOGRAPHIC ROAD / INFRASTRUCTURE DETECTION
        // =========================================================
        Set<String> placeTokens = new HashSet<>(Arrays.asList(
            "road", "marg", "highway", "street", "expressway", "chowk", "circle",
            "underpass", "flyover", "station", "panchayat", "transport"
        ));

        boolean isPlace = false;
        String placeTokenFound = null;
        for (String pt : placeTokens) {
            if ((nameTokens.contains(pt) || lowerName.contains(" " + pt)) && !hasCommercialToken) {
                isPlace = true;
                placeTokenFound = pt;
                break;
            }
        }

        if (isPlace) {
            risks.add("Geographic place/infrastructure entity detected ('" + placeTokenFound + "')");
            IdentityValidationResult res = new IdentityValidationResult(EntityType.PLACE, 0.90, 0.85);
            res.identitySignals.add("place_entity: road/infrastructure/public spot detected");
            res.riskSignals.addAll(risks);
            return res;
        }

        // =========================================================
        // 4. STRONG BUSINESS IDENTITY EVALUATION
        // =========================================================
        double identityConf = 0.50;
        double evidenceConf = 0.50;

        boolean isMapPlace = candidate.getGeoapifyPlaceId() != null || candidate.getOsmId() != null;
        if (isMapPlace) {
            identityConf += 0.35;
            evidenceConf += 0.35;
            signals.add("map_directory_place: verified physical business place");
        }

        if (hasCommercialToken) {
            identityConf += 0.25;
            evidenceConf += 0.20;
            signals.add("commercial_name_token: explicit business suffix/brand token");
        }

        if (candidate.getEmail() != null && !candidate.getEmail().isEmpty()) {
            identityConf += 0.10;
            evidenceConf += 0.15;
            signals.add("contact_email: direct email discovered (" + candidate.getEmail() + ")");
        }
        if (candidate.getPhone() != null && !candidate.getPhone().isEmpty()) {
            identityConf += 0.10;
            evidenceConf += 0.10;
            signals.add("contact_phone: direct phone discovered (" + candidate.getPhone() + ")");
        }

        if (candidate.getWebsiteUrl() != null && !candidate.getWebsiteUrl().isEmpty()) {
            String lowerWeb = candidate.getWebsiteUrl().toLowerCase();
            boolean isSocialUrl = lowerWeb.contains("instagram.com") || lowerWeb.contains("linkedin.com") ||
                                  lowerWeb.contains("facebook.com") || lowerWeb.contains("linktr.ee");
            if (!isSocialUrl) {
                identityConf += 0.10;
                evidenceConf += 0.15;
                signals.add("official_website: custom domain website discovered (" + candidate.getWebsiteUrl() + ")");
            } else {
                signals.add("social_presence: " + lowerWeb);
            }
        }

        IdentityValidationResult result = new IdentityValidationResult(EntityType.BUSINESS, identityConf, evidenceConf);
        result.identitySignals.addAll(signals);
        result.riskSignals.addAll(risks);
        return result;
    }

    private Set<String> tokenize(String input) {
        if (input == null || input.trim().isEmpty()) {
            return Collections.emptySet();
        }
        String[] parts = WORD_BOUNDARY.split(input.toLowerCase());
        Set<String> set = new HashSet<>();
        for (String p : parts) {
            if (!p.isEmpty()) {
                set.add(p);
            }
        }
        return set;
    }
}
