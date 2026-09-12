package com.setuleads.service;

import com.setuleads.entity.ActivityEntity;
import com.setuleads.entity.ActivityType;
import com.setuleads.exception.ResourceNotFoundException;
import com.setuleads.repository.ActivityRepository;
import com.setuleads.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final LeadRepository leadRepository;

    public ActivityService(ActivityRepository activityRepository, LeadRepository leadRepository) {
        this.activityRepository = activityRepository;
        this.leadRepository = leadRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityEntity> getActivitiesByLeadId(UUID leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead not found with id: " + leadId);
        }
        return activityRepository.findByLeadIdOrderByCreatedAtDesc(leadId);
    }

    @Transactional
    public ActivityEntity addActivity(UUID leadId, ActivityType type, String description) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead not found with id: " + leadId);
        }
        ActivityEntity activity = new ActivityEntity();
        activity.setLeadId(leadId);
        activity.setType(type);
        activity.setDescription(description);
        return activityRepository.save(activity);
    }
}
