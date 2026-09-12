package com.setuleads.dto.gemini;

import java.util.ArrayList;
import java.util.List;

public class GeminiQualificationDTO {
    private String entityType;
    private Integer entityConfidence = 85;
    private Integer intentRelevance = 85;
    private Integer locationConfidence = 85;
    private Integer evidenceConfidence = 90;
    private String decision;
    private List<String> positiveEvidence = new ArrayList<>();
    private List<String> negativeEvidence = new ArrayList<>();
    private String reason;
    private List<String> confidenceNotes = new ArrayList<>();

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Integer getEntityConfidence() { return entityConfidence; }
    public void setEntityConfidence(Integer entityConfidence) { this.entityConfidence = entityConfidence; }

    public Integer getIntentRelevance() { return intentRelevance; }
    public void setIntentRelevance(Integer intentRelevance) { this.intentRelevance = intentRelevance; }

    public Integer getLocationConfidence() { return locationConfidence; }
    public void setLocationConfidence(Integer locationConfidence) { this.locationConfidence = locationConfidence; }

    public Integer getEvidenceConfidence() { return evidenceConfidence; }
    public void setEvidenceConfidence(Integer evidenceConfidence) { this.evidenceConfidence = evidenceConfidence; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public List<String> getPositiveEvidence() { return positiveEvidence; }
    public void setPositiveEvidence(List<String> positiveEvidence) { this.positiveEvidence = positiveEvidence; }

    public List<String> getNegativeEvidence() { return negativeEvidence; }
    public void setNegativeEvidence(List<String> negativeEvidence) { this.negativeEvidence = negativeEvidence; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<String> getConfidenceNotes() { return confidenceNotes; }
    public void setConfidenceNotes(List<String> confidenceNotes) { this.confidenceNotes = confidenceNotes; }
}

