package com.setuleads.controller;

import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;
import com.setuleads.service.ExcelExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leads")
public class ExportController {

    private final ExcelExportService excelExportService;

    public ExportController(ExcelExportService excelExportService) {
        this.excelExportService = excelExportService;
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportLeads(
            @RequestParam(required = false) LeadStage stage,
            @RequestParam(required = false) LeadSource source,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) Integer maxScore) {

        byte[] excelBytes = excelExportService.exportLeadsToExcel(stage, source, search, minScore, maxScore);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=setuleads_export.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
