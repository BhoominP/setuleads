package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContactabilityEngine {

    private static final Pattern DECISION_MAKER_PATTERN = Pattern.compile(
        "(?i)\\b(founder|co-founder|owner|ceo|managing director|director|president|marketing manager|business manager|proprietor|partner)\\b"
    );

    private static final Pattern NAME_BEFORE_TITLE_PATTERN = Pattern.compile(
        "(?i)\\b([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2})\\s*(?:[-|–,]\\s*|\\s+is\\s+the\\s+|\\s*\\|\\s*)(founder|co-founder|owner|ceo|managing director|director|president|marketing manager|business manager|proprietor|partner)\\b"
    );

    public static class ContactabilityResult {
        private final int score;
        private final String decisionMakerName;
        private final String decisionMakerTitle;
        private final List<String> contactChannels = new ArrayList<>();

        public ContactabilityResult(int score, String decisionMakerName, String decisionMakerTitle, List<String> contactChannels) {
            this.score = Math.min(100, Math.max(0, score));
            this.decisionMakerName = decisionMakerName;
            this.decisionMakerTitle = decisionMakerTitle;
            if (contactChannels != null) {
                this.contactChannels.addAll(contactChannels);
            }
        }

        public int getScore() { return score; }
        public String getDecisionMakerName() { return decisionMakerName; }
        public String getDecisionMakerTitle() { return decisionMakerTitle; }
        public List<String> getContactChannels() { return contactChannels; }
    }

    public ContactabilityResult evaluate(String email, String phone, String whatsapp, String instagram, String linkedin, String websiteUrl, String textContent) {
        int rawScore = 0;
        List<String> channels = new ArrayList<>();

        // Public business email (+30)
        if (email != null && !email.isBlank() && email.contains("@")) {
            rawScore += 30;
            channels.add("Email: " + email.trim());
        }

        // Phone (+20)
        if (phone != null && !phone.isBlank()) {
            rawScore += 20;
            channels.add("Phone: " + phone.trim());
        }

        // WhatsApp (+15)
        if (whatsapp != null && !whatsapp.isBlank()) {
            rawScore += 15;
            channels.add("WhatsApp: " + whatsapp.trim());
        }

        // Instagram (+10)
        if (instagram != null && !instagram.isBlank()) {
            rawScore += 10;
            channels.add("Instagram: @" + instagram.replace("@", "").trim());
        }

        // LinkedIn (+10)
        if (linkedin != null && !linkedin.isBlank()) {
            rawScore += 10;
            channels.add("LinkedIn Profile/Page");
        }

        // Website Contact Form (+10)
        if (websiteUrl != null && !websiteUrl.isBlank() && !isSocialUrl(websiteUrl)) {
            rawScore += 10;
            channels.add("Website Contact Flow");
        }

        // Decision Maker Identification (+15)
        String dmName = null;
        String dmTitle = null;

        if (textContent != null && !textContent.isBlank()) {
            Matcher nameMatcher = NAME_BEFORE_TITLE_PATTERN.matcher(textContent);
            if (nameMatcher.find()) {
                dmName = nameMatcher.group(1).trim();
                dmTitle = capitalize(nameMatcher.group(2).trim());
            } else {
                Matcher titleMatcher = DECISION_MAKER_PATTERN.matcher(textContent);
                if (titleMatcher.find()) {
                    dmTitle = capitalize(titleMatcher.group(1).trim());
                }
            }
        }

        if (dmTitle != null || dmName != null) {
            rawScore += 15;
            if (dmName != null) {
                channels.add("Decision Maker: " + dmName + " (" + (dmTitle != null ? dmTitle : "Owner/Exec") + ")");
            } else {
                channels.add("Decision Maker Role: " + dmTitle);
            }
        }

        int normalizedScore = Math.min(100, rawScore);
        return new ContactabilityResult(normalizedScore, dmName, dmTitle, channels);
    }

    public void applyTo(CandidateDTO candidate, String textContent) {
        ContactabilityResult result = evaluate(
            candidate.getEmail(),
            candidate.getPhone(),
            candidate.getWhatsapp(),
            candidate.getSocialHandle(),
            candidate.getWebsiteUrl() != null && candidate.getWebsiteUrl().contains("linkedin.com") ? candidate.getWebsiteUrl() : null,
            candidate.getWebsiteUrl(),
            textContent
        );
        candidate.setContactabilityScore(result.getScore());
        candidate.setDecisionMakerName(result.getDecisionMakerName());
        candidate.setDecisionMakerTitle(result.getDecisionMakerTitle());
    }

    private boolean isSocialUrl(String url) {
        if (url == null) return false;
        String u = url.toLowerCase();
        return u.contains("instagram.com") || u.contains("facebook.com") || u.contains("linkedin.com") || u.contains("linktr.ee") || u.contains("twitter.com") || u.contains("x.com");
    }

    private String capitalize(String str) {
        if (str == null || str.isBlank()) return str;
        return Character.toUpperCase(str.charAt(0)) + str.substring(1).toLowerCase();
    }
}
