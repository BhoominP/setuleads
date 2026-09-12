package com.setuleads.util;

import com.setuleads.dto.CandidateDTO;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TextExtractorUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}", Pattern.CASE_INSENSITIVE);

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3,5}\\)?[-.\\s]?\\d{3,5}[-.\\s]?\\d{3,5}");

    private static final Pattern INSTAGRAM_HANDLE_PATTERN = Pattern.compile(
            "(?:(?:https?://)?(?:www\\.)?instagram\\.com/|(?<![a-zA-Z0-9._%+-])@)([a-zA-Z0-9._]{3,30})(?![a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", Pattern.CASE_INSENSITIVE);

    private static final Pattern LINKEDIN_URL_PATTERN = Pattern.compile(
            "(https?://(?:www\\.)?linkedin\\.com/(?:in|company)/[a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern LINKTREE_URL_PATTERN = Pattern.compile(
            "(https?://(?:www\\.)?linktr\\.ee/[a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern URL_PATTERN = Pattern.compile(
            "https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(?:/[^\\s\"'<>]*)?", Pattern.CASE_INSENSITIVE);

    public static class ExtractedLead {
        public String businessName;
        public String email;
        public String phone;
        public String instagramHandle;
        public String linkedinUrl;
        public String linktreeUrl;
        public String websiteUrl;
        public String location;
        public String snippet;

        public CandidateDTO toCandidateDTO(String sourceQuery) {
            CandidateDTO dto = new CandidateDTO();
            dto.setId("xray_" + UUID.randomUUID().toString().substring(0, 8));
            dto.setBusinessName(businessName != null ? businessName : "Social Prospect");
            dto.setEmail(email);
            dto.setPhone(phone);
            dto.setWebsiteUrl(websiteUrl != null ? websiteUrl : (linktreeUrl != null ? linktreeUrl : (instagramHandle != null ? "https://instagram.com/" + instagramHandle.replace("@", "") : null)));
            dto.setCategories(Collections.singletonList("Social & Web Prospect"));
            dto.setProvider("SOCIAL_XRAY");
            dto.setSourceQuery(sourceQuery);
            dto.setAddress(location);
            return dto;
        }
    }

    public static List<ExtractedLead> parseRawText(String rawText, String defaultLocation) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<ExtractedLead> leads = new ArrayList<>();
        // Split by double line breaks or numbering bullet points
        String[] blocks = rawText.split("(?:\\r?\\n\\s*\\r?\\n|\\n(?=\\d+\\.|[A-Z][a-z]+ - |https?://))");

        for (String block : blocks) {
            String trimmedBlock = block.trim();
            if (trimmedBlock.length() < 15) continue;

            ExtractedLead lead = new ExtractedLead();
            lead.snippet = trimmedBlock.length() > 250 ? trimmedBlock.substring(0, 250) + "..." : trimmedBlock;
            lead.location = defaultLocation;

            // Extract Email
            Matcher emailMatcher = EMAIL_PATTERN.matcher(trimmedBlock);
            if (emailMatcher.find()) {
                lead.email = emailMatcher.group().toLowerCase();
            }

            // Extract Phone
            Matcher phoneMatcher = PHONE_PATTERN.matcher(trimmedBlock);
            while (phoneMatcher.find()) {
                String candidatePhone = phoneMatcher.group().replaceAll("[^0-9+]", "");
                if (candidatePhone.length() >= 10 && candidatePhone.length() <= 13) {
                    lead.phone = phoneMatcher.group().trim();
                    break;
                }
            }

            // Extract Instagram Handle
            Matcher instaMatcher = INSTAGRAM_HANDLE_PATTERN.matcher(trimmedBlock);
            if (instaMatcher.find()) {
                String handle = instaMatcher.group(1);
                if (!handle.equalsIgnoreCase("com") && !handle.equalsIgnoreCase("p") && !handle.equalsIgnoreCase("reels")) {
                    lead.instagramHandle = "@" + handle;
                }
            }

            // Extract LinkedIn URL
            Matcher linkedinMatcher = LINKEDIN_URL_PATTERN.matcher(trimmedBlock);
            if (linkedinMatcher.find()) {
                lead.linkedinUrl = linkedinMatcher.group(1);
            }

            // Extract Linktree URL
            Matcher linktreeMatcher = LINKTREE_URL_PATTERN.matcher(trimmedBlock);
            if (linktreeMatcher.find()) {
                lead.linktreeUrl = linktreeMatcher.group(1);
            }

            // Extract Website URL (excluding social network domains)
            Matcher urlMatcher = URL_PATTERN.matcher(trimmedBlock);
            while (urlMatcher.find()) {
                String url = urlMatcher.group();
                String lowerUrl = url.toLowerCase();
                if (!lowerUrl.contains("instagram.com") && !lowerUrl.contains("facebook.com") &&
                    !lowerUrl.contains("linkedin.com") && !lowerUrl.contains("google.com") &&
                    !lowerUrl.contains("twitter.com") && !lowerUrl.contains("x.com")) {
                    lead.websiteUrl = url;
                    break;
                }
            }

            // Extract Business Name from first line or title pattern
            String[] lines = trimmedBlock.split("\\r?\\n");
            String firstLine = lines[0].trim();
            // Strip leading search numbers like "1. ", "2. "
            firstLine = firstLine.replaceAll("^\\d+\\.\\s*", "");
            // Clean up trailing separators
            if (firstLine.contains("-")) {
                firstLine = firstLine.split("-")[0].trim();
            } else if (firstLine.contains("|")) {
                firstLine = firstLine.split("\\|")[0].trim();
            } else if (firstLine.contains("(@")) {
                firstLine = firstLine.split("\\(@")[0].trim();
            }

            if (firstLine.length() >= 3 && firstLine.length() <= 60 && !firstLine.toLowerCase().startsWith("http")) {
                lead.businessName = firstLine;
            } else if (lead.instagramHandle != null) {
                lead.businessName = lead.instagramHandle;
            } else if (lead.email != null) {
                lead.businessName = lead.email.split("@")[0];
            } else {
                lead.businessName = "Social Prospect";
            }

            // Only add if at least an email, phone, website, or social handle was identified
            if (lead.email != null || lead.phone != null || lead.websiteUrl != null ||
                lead.instagramHandle != null || lead.linkedinUrl != null || lead.linktreeUrl != null) {
                leads.add(lead);
            }
        }

        return leads;
    }
}
