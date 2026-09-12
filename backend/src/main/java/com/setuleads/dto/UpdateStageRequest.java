package com.setuleads.dto;

import com.setuleads.entity.LeadStage;
import jakarta.validation.constraints.NotNull;

public class UpdateStageRequest {

    @NotNull(message = "Stage is required")
    private LeadStage stage;

    public LeadStage getStage() {
        return stage;
    }

    public void setStage(LeadStage stage) {
        this.stage = stage;
    }
}
