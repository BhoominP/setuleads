package com.setuleads.controller;

import com.setuleads.dto.WebsiteCheckRequest;
import com.setuleads.dto.WebsiteCheckResponse;
import com.setuleads.service.WebsiteCheckService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/websites")
public class WebsiteController {

    private final WebsiteCheckService websiteCheckService;

    public WebsiteController(WebsiteCheckService websiteCheckService) {
        this.websiteCheckService = websiteCheckService;
    }

    @PostMapping("/check")
    public ResponseEntity<WebsiteCheckResponse> inspectWebsite(@Valid @RequestBody WebsiteCheckRequest request) {
        WebsiteCheckResponse response = websiteCheckService.inspectWebsite(request.getUrl());
        return ResponseEntity.ok(response);
    }
}
