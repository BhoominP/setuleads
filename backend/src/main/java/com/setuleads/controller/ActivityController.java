package com.setuleads.controller;

import com.setuleads.entity.ActivityEntity;
import com.setuleads.entity.ActivityType;
import com.setuleads.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads/{leadId}/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityEntity>> getActivities(@PathVariable UUID leadId) {
        List<ActivityEntity> activities = activityService.getActivitiesByLeadId(leadId);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<ActivityEntity> addActivity(
            @PathVariable UUID leadId,
            @RequestBody Map<String, String> payload) {

        String typeStr = payload.get("type");
        String description = payload.get("description");
        if (typeStr == null || description == null) {
            throw new IllegalArgumentException("Both 'type' and 'description' are required");
        }

        ActivityType type = ActivityType.valueOf(typeStr.toUpperCase());
        ActivityEntity created = activityService.addActivity(leadId, type, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
