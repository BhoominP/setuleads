package com.setuleads.controller;

import com.setuleads.dto.DiscoveryRequest;
import com.setuleads.dto.DiscoveryResponse;
import com.setuleads.service.DiscoveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/discovery")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @PostMapping("/search")
    public ResponseEntity<DiscoveryResponse> searchBusinesses(@Valid @RequestBody DiscoveryRequest request) {
        DiscoveryResponse response = discoveryService.discoverBusinesses(request);
        return ResponseEntity.ok(response);
    }
}
