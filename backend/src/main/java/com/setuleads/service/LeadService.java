package com.setuleads.service;

import com.setuleads.dto.CreateLeadRequest;
import com.setuleads.dto.LeadDTO;
import com.setuleads.entity.ActivityEntity;
import com.setuleads.entity.ActivityType;
import com.setuleads.entity.LeadEntity;
import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;
import com.setuleads.exception.ResourceNotFoundException;
import com.setuleads.repository.ActivityRepository;
import com.setuleads.repository.LeadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final ActivityRepository activityRepository;
    private final com.setuleads.service.gemini.GeminiSemanticService geminiSemanticService;

    public LeadService(LeadRepository leadRepository, ActivityRepository activityRepository,
                       com.setuleads.service.gemini.GeminiSemanticService geminiSemanticService) {
        this.leadRepository = leadRepository;
        this.activityRepository = activityRepository;
        this.geminiSemanticService = geminiSemanticService;
    }

    public String generateOutreachForCandidate(com.setuleads.dto.CandidateDTO candidate) {
        return geminiSemanticService.generatePersonalizedOutreach(candidate);
    }

    @Transactional
    public List<LeadDTO> getLeads(LeadStage stage, LeadSource source, String search, Integer minScore, Integer maxScore) {
        purgeExistingDuplicates();
        List<LeadEntity> entities = leadRepository.filterLeads(stage, source, search, minScore, maxScore);
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeadDTO getLeadById(UUID id) {
        LeadEntity entity = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        return toDTO(entity);
    }

    @Transactional
    public LeadDTO createLead(CreateLeadRequest req) {
        java.util.Optional<LeadEntity> dupOpt = findExistingDuplicate(req.getBusinessName(), req.getEmail(), req.getWebsiteUrl());
        if (dupOpt.isPresent()) {
            LeadEntity existing = dupOpt.get();
            mapRequestToEntity(req, existing);
            LeadEntity updated = leadRepository.save(existing);
            return toDTO(updated);
        }

        LeadEntity entity = new LeadEntity();
        mapRequestToEntity(req, entity);
        if (entity.getStage() == null) {
            entity.setStage(LeadStage.NEW);
        }
        LeadEntity saved = leadRepository.save(entity);

        // Record creation activity
        ActivityEntity activity = new ActivityEntity();
        activity.setLeadId(saved.getId());
        activity.setType(ActivityType.STAGE_CHANGE);
        activity.setDescription("Lead created in stage: " + saved.getStage());
        activityRepository.save(activity);

        return toDTO(saved);
    }

    @Transactional
    public LeadDTO updateLead(UUID id, CreateLeadRequest req) {
        LeadEntity entity = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        mapRequestToEntity(req, entity);
        LeadEntity updated = leadRepository.save(entity);
        return toDTO(updated);
    }

    @Transactional
    public LeadDTO updateStage(UUID id, LeadStage newStage) {
        LeadEntity entity = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        LeadStage oldStage = entity.getStage();
        if (oldStage != newStage) {
            entity.setStage(newStage);
            entity.setLastContactedAt(OffsetDateTime.now());
            LeadEntity updated = leadRepository.save(entity);

            ActivityEntity activity = new ActivityEntity();
            activity.setLeadId(id);
            activity.setType(ActivityType.STAGE_CHANGE);
            activity.setDescription(String.format("Stage changed from %s to %s", oldStage, newStage));
            activityRepository.save(activity);

            return toDTO(updated);
        }
        return toDTO(entity);
    }

    @Transactional
    public List<LeadDTO> harvestPaste(com.setuleads.dto.HarvestPasteRequest req) {
        List<com.setuleads.util.TextExtractorUtils.ExtractedLead> extracted = new java.util.ArrayList<>();
        
        if (req.getRawText() != null && !req.getRawText().trim().isEmpty()) {
            extracted.addAll(com.setuleads.util.TextExtractorUtils.parseRawText(req.getRawText(), req.getLocation()));
        } else if (req.getParsedCandidates() != null) {
            for (com.setuleads.dto.HarvestPasteRequest.ParsedCandidate pc : req.getParsedCandidates()) {
                com.setuleads.util.TextExtractorUtils.ExtractedLead ex = new com.setuleads.util.TextExtractorUtils.ExtractedLead();
                ex.businessName = pc.getBusinessName();
                ex.email = pc.getEmail();
                ex.phone = pc.getPhone();
                ex.websiteUrl = pc.getWebsiteUrl();
                ex.instagramHandle = pc.getInstagramHandle();
                ex.linkedinUrl = pc.getLinkedinUrl();
                ex.linktreeUrl = pc.getLinktreeUrl();
                ex.location = pc.getLocation() != null ? pc.getLocation() : req.getLocation();
                extracted.add(ex);
            }
        }

        List<LeadDTO> createdLeads = new java.util.ArrayList<>();
        for (com.setuleads.util.TextExtractorUtils.ExtractedLead item : extracted) {
            String website = item.websiteUrl != null ? item.websiteUrl : (item.linktreeUrl != null ? item.linktreeUrl : (item.instagramHandle != null ? "https://instagram.com/" + item.instagramHandle.replace("@", "") : null));
            java.util.Optional<LeadEntity> dupOpt = findExistingDuplicate(item.businessName, item.email, website);

            LeadEntity entity = dupOpt.orElseGet(LeadEntity::new);
            
            String cleanName = item.businessName != null ? item.businessName.trim() : "";
            if (cleanName.isEmpty() || cleanName.startsWith("@") || cleanName.toLowerCase().contains("@gmail")) {
                if (item.email != null && item.email.contains("@")) {
                    cleanName = item.email.split("@")[0].replace('.', ' ').replace('_', ' ').trim();
                    if (!cleanName.isEmpty()) {
                        cleanName = Character.toUpperCase(cleanName.charAt(0)) + cleanName.substring(1);
                    } else {
                        cleanName = "Social Prospect";
                    }
                } else {
                    cleanName = "Social Prospect";
                }
            }
            entity.setBusinessName(cleanName);

            if (item.email != null && !item.email.trim().isEmpty()) entity.setEmail(item.email.trim());
            if (item.phone != null && !item.phone.trim().isEmpty()) entity.setPhone(item.phone.trim());
            if (website != null && !website.trim().isEmpty()) entity.setWebsiteUrl(website.trim());
            if (entity.getLocation() == null || entity.getLocation().trim().isEmpty()) {
                entity.setLocation(item.location != null && !item.location.trim().isEmpty() ? item.location.trim() : (req.getLocation() != null ? req.getLocation().trim() : "Vadodara, Gujarat"));
            }
            if (entity.getSource() == null) entity.setSource(LeadSource.SOCIAL_XRAY);
            if (entity.getStage() == null) entity.setStage(LeadStage.NEW);

            StringBuilder notes = new StringBuilder(entity.getGeneralNotes() != null ? entity.getGeneralNotes() : "Harvested via Smart Web Clipboard. ");
            if (item.instagramHandle != null && !notes.toString().contains(item.instagramHandle)) notes.append("IG: ").append(item.instagramHandle).append(" ");
            if (item.linkedinUrl != null && !notes.toString().contains(item.linkedinUrl)) notes.append("LinkedIn: ").append(item.linkedinUrl).append(" ");
            if (item.linktreeUrl != null && !notes.toString().contains(item.linktreeUrl)) notes.append("Linktree: ").append(item.linktreeUrl).append(" ");
            entity.setGeneralNotes(notes.toString());

            LeadEntity saved = leadRepository.save(entity);

            if (dupOpt.isEmpty()) {
                ActivityEntity activity = new ActivityEntity();
                activity.setLeadId(saved.getId());
                activity.setType(ActivityType.NOTE);
                activity.setDescription("Imported via Smart Text Harvester");
                activityRepository.save(activity);
            }

            createdLeads.add(toDTO(saved));
        }

        return createdLeads;
    }

    public java.util.Optional<LeadEntity> findExistingDuplicate(String businessName, String email, String websiteUrl) {
        if (email != null && !email.trim().isEmpty()) {
            List<LeadEntity> byEmail = leadRepository.findByEmailIgnoreCase(email.trim());
            if (!byEmail.isEmpty()) return java.util.Optional.of(byEmail.get(0));
        }

        if (websiteUrl != null && !websiteUrl.trim().isEmpty()) {
            String normWeb = normalizeUrl(websiteUrl);
            List<LeadEntity> all = leadRepository.findAll();
            for (LeadEntity l : all) {
                if (l.getWebsiteUrl() != null && normalizeUrl(l.getWebsiteUrl()).equalsIgnoreCase(normWeb)) {
                    return java.util.Optional.of(l);
                }
            }
        }

        if (businessName != null && !businessName.trim().isEmpty()) {
            String normName = normalizeBusinessName(businessName);
            List<LeadEntity> all = leadRepository.findAll();
            for (LeadEntity l : all) {
                if (l.getBusinessName() != null && normalizeBusinessName(l.getBusinessName()).equalsIgnoreCase(normName)) {
                    return java.util.Optional.of(l);
                }
            }
        }

        return java.util.Optional.empty();
    }

    @Transactional
    public void purgeExistingDuplicates() {
        List<LeadEntity> allLeads = leadRepository.findAll();
        java.util.Map<String, LeadEntity> seenKeys = new java.util.HashMap<>();
        java.util.List<UUID> toDelete = new java.util.ArrayList<>();

        for (LeadEntity lead : allLeads) {
            String key = null;
            if (lead.getEmail() != null && !lead.getEmail().trim().isEmpty()) {
                key = "email:" + lead.getEmail().trim().toLowerCase();
            } else if (lead.getWebsiteUrl() != null && !lead.getWebsiteUrl().trim().isEmpty()) {
                key = "web:" + normalizeUrl(lead.getWebsiteUrl());
            } else if (lead.getBusinessName() != null && !lead.getBusinessName().trim().isEmpty()) {
                key = "name:" + normalizeBusinessName(lead.getBusinessName());
            }

            if (key != null) {
                if (seenKeys.containsKey(key)) {
                    LeadEntity primary = seenKeys.get(key);
                    if (primary.getEmail() == null && lead.getEmail() != null) primary.setEmail(lead.getEmail());
                    if (primary.getPhone() == null && lead.getPhone() != null) primary.setPhone(lead.getPhone());
                    if (primary.getWebsiteUrl() == null && lead.getWebsiteUrl() != null) primary.setWebsiteUrl(lead.getWebsiteUrl());
                    leadRepository.save(primary);
                    toDelete.add(lead.getId());
                } else {
                    seenKeys.put(key, lead);
                }
            }
        }

        for (UUID id : toDelete) {
            leadRepository.deleteById(id);
        }
    }

    private String normalizeUrl(String url) {
        if (url == null) return "";
        return url.toLowerCase().trim()
                .replace("https://", "")
                .replace("http://", "")
                .replace("www.", "")
                .replaceAll("/+$", "");
    }

    private String normalizeBusinessName(String name) {
        if (name == null) return "";
        return name.toLowerCase().trim()
                .replace("instagram · ", "")
                .replaceAll("[\\[\\]()\\-_\\s]+", "");
    }

    @Transactional
    public void deleteLead(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found with id: " + id);
        }
        leadRepository.deleteById(id);
    }

    private void mapRequestToEntity(CreateLeadRequest req, LeadEntity entity) {
        if (req.getBusinessName() != null && !req.getBusinessName().isEmpty()) {
            entity.setBusinessName(req.getBusinessName());
        }
        if (req.getContactName() != null) entity.setContactName(req.getContactName());
        if (req.getEmail() != null) entity.setEmail(req.getEmail());
        if (req.getPhone() != null) entity.setPhone(req.getPhone());
        if (req.getWebsiteUrl() != null) entity.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getSource() != null) entity.setSource(req.getSource());
        if (req.getSourceQuery() != null) entity.setSourceQuery(req.getSourceQuery());
        if (req.getLocation() != null) entity.setLocation(req.getLocation());
        if (req.getStage() != null) entity.setStage(req.getStage());
        if (req.getEstimatedValue() != null) entity.setEstimatedValue(req.getEstimatedValue());
        if (req.getWebsiteNotes() != null) entity.setWebsiteNotes(req.getWebsiteNotes());
        if (req.getGeneralNotes() != null) entity.setGeneralNotes(req.getGeneralNotes());
        if (req.getWebsiteScore() != null) entity.setWebsiteScore(req.getWebsiteScore());
        if (req.getGooglePlaceId() != null) entity.setGooglePlaceId(req.getGooglePlaceId());
        if (req.getGeoapifyPlaceId() != null) entity.setGeoapifyPlaceId(req.getGeoapifyPlaceId());
        if (req.getOsmType() != null) entity.setOsmType(req.getOsmType());
        if (req.getOsmId() != null) entity.setOsmId(req.getOsmId());
        if (req.getOvertureId() != null) entity.setOvertureId(req.getOvertureId());
        if (req.getDiscoveryArea() != null) entity.setDiscoveryArea(req.getDiscoveryArea());
    }

    public LeadDTO toDTO(LeadEntity entity) {
        LeadDTO dto = new LeadDTO();
        dto.setId(entity.getId());
        dto.setBusinessName(entity.getBusinessName());
        dto.setContactName(entity.getContactName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setWebsiteUrl(entity.getWebsiteUrl());
        dto.setSource(entity.getSource());
        dto.setSourceQuery(entity.getSourceQuery());
        dto.setLocation(entity.getLocation());
        dto.setStage(entity.getStage());
        dto.setEstimatedValue(entity.getEstimatedValue());
        dto.setWebsiteNotes(entity.getWebsiteNotes());
        dto.setGeneralNotes(entity.getGeneralNotes());
        dto.setWebsiteScore(entity.getWebsiteScore());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setLastContactedAt(entity.getLastContactedAt());
        dto.setGooglePlaceId(entity.getGooglePlaceId());
        dto.setGeoapifyPlaceId(entity.getGeoapifyPlaceId());
        dto.setOsmType(entity.getOsmType());
        dto.setOsmId(entity.getOsmId());
        dto.setOvertureId(entity.getOvertureId());
        dto.setDiscoveryArea(entity.getDiscoveryArea());
        return dto;
    }
}
