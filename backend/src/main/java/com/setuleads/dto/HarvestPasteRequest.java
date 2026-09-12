package com.setuleads.dto;

import java.util.List;

public class HarvestPasteRequest {

    private String rawText;
    private String location;
    private List<ParsedCandidate> parsedCandidates;

    public static class ParsedCandidate {
        private String businessName;
        private String email;
        private String phone;
        private String websiteUrl;
        private String instagramHandle;
        private String linkedinUrl;
        private String linktreeUrl;
        private String location;

        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getWebsiteUrl() { return websiteUrl; }
        public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

        public String getInstagramHandle() { return instagramHandle; }
        public void setInstagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; }

        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

        public String getLinktreeUrl() { return linktreeUrl; }
        public void setLinktreeUrl(String linktreeUrl) { this.linktreeUrl = linktreeUrl; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<ParsedCandidate> getParsedCandidates() { return parsedCandidates; }
    public void setParsedCandidates(List<ParsedCandidate> parsedCandidates) { this.parsedCandidates = parsedCandidates; }
}
