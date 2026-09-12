package com.setuleads.dto.gemini;

import java.util.ArrayList;
import java.util.List;

public class GeminiWebsiteOpportunityDTO {

    public static class WebsiteIssueItem {
        private String category;
        private String severity;
        private String description;
        private String evidence;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getEvidence() { return evidence; }
        public void setEvidence(String evidence) { this.evidence = evidence; }
    }

    private int redesignOpportunityScore;
    private List<WebsiteIssueItem> issues = new ArrayList<>();
    private List<String> strengths = new ArrayList<>();
    private List<String> pitchAngles = new ArrayList<>();
    private String reason;

    public int getRedesignOpportunityScore() { return redesignOpportunityScore; }
    public void setRedesignOpportunityScore(int redesignOpportunityScore) { this.redesignOpportunityScore = redesignOpportunityScore; }

    public List<WebsiteIssueItem> getIssues() { return issues; }
    public void setIssues(List<WebsiteIssueItem> issues) { this.issues = issues; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getPitchAngles() { return pitchAngles; }
    public void setPitchAngles(List<String> pitchAngles) { this.pitchAngles = pitchAngles; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
