package com.setuleads.controller;

import com.setuleads.dto.CreateLeadRequest;
import com.setuleads.dto.LeadDTO;
import com.setuleads.dto.UpdateStageRequest;
import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;
import com.setuleads.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public ResponseEntity<List<LeadDTO>> getLeads(
            @RequestParam(required = false) LeadStage stage,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) Integer maxScore) {

        List<LeadDTO> leads = leadService.getLeads(stage, source, search, minScore, maxScore);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadDTO> getLeadById(@PathVariable UUID id) {
        LeadDTO lead = leadService.getLeadById(id);
        return ResponseEntity.ok(lead);
    }

    @PostMapping
    public ResponseEntity<LeadDTO> createLead(@Valid @RequestBody CreateLeadRequest request) {
        LeadDTO created = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadDTO> updateLead(@PathVariable UUID id, @Valid @RequestBody CreateLeadRequest request) {
        LeadDTO updated = leadService.updateLead(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/stage")
    public ResponseEntity<LeadDTO> updateStage(@PathVariable UUID id, @Valid @RequestBody UpdateStageRequest request) {
        LeadDTO updated = leadService.updateStage(id, request.getStage());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/harvest-paste")
    public ResponseEntity<List<LeadDTO>> harvestPaste(@RequestBody com.setuleads.dto.HarvestPasteRequest request) {
        List<LeadDTO> created = leadService.harvestPaste(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/generate-outreach")
    public ResponseEntity<java.util.Map<String, String>> generateOutreach(@RequestBody com.setuleads.dto.CandidateDTO candidate) {
        String outreachText = leadService.generateOutreachForCandidate(candidate);
        return ResponseEntity.ok(java.util.Collections.singletonMap("outreachEmail", outreachText));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }
}
