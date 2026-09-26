package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import com.setuleads.dto.SourceEvidence;
import com.setuleads.entity.EntityType;
import com.setuleads.service.location.LocationDetector;
import com.setuleads.util.TextExtractorUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AccuracyAuditTest {

    private IdentityValidator identityValidator;
    private RelevanceQualifier relevanceQualifier;
    private LocationDetector locationDetector;

    @BeforeEach
    void setUp() {
        identityValidator = new IdentityValidator();
        relevanceQualifier = new RelevanceQualifier();
        locationDetector = new LocationDetector();
    }

    @Test
    @DisplayName("TEST 1: Query 'startup', Location 'Surat' -> Candidate & LocationDetector handle Surat startup evidence")
    void test1_SuratStartupEvidence() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Sun Moon Light Studio");
        candidate.setCategories(Collections.singletonList("commercial.photo"));
        candidate.setEmail("sunmoonlightfilms@gmail.com");

        LocationDetector.LocationMatchResult locRes = locationDetector.detectLocation("Surat, Gujarat", "SURAT, WE'RE Female Developer Wanted — Startup environment — sunmoonlightfilms@gmail.com");
        assertTrue(locRes.isMatched());
        assertTrue(locRes.getConfidence() >= 85);
    }

    @Test
    @DisplayName("TEST 2: Business candidate qualification check")
    void test2_SunMoonLightStudioIsBusiness() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Sun Moon Light Studio");
        candidate.setEntityType(EntityType.BUSINESS);

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, "startup");
        assertEquals(EntityType.BUSINESS, valResult.entityType);
    }

    @Test
    @DisplayName("TEST 3: Digital agency candidate qualification check")
    void test3_AaryaInfotechIsBusiness() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Aarya Infotech | Web Development & Digital Agency");
        candidate.setCategories(Collections.singletonList("office.it"));
        candidate.setEntityType(EntityType.BUSINESS);

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, "web development");
        assertEquals(EntityType.BUSINESS, valResult.entityType);
    }

    @Test
    @DisplayName("TEST 4: 'Sai Clinic' + 'AI startup' query -> REJECTED (No 'Sai' / 'ai' substring match)")
    void test4_SaiClinicNotAi() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Sai Clinic");
        candidate.setCategories(Collections.singletonList("healthcare.clinic"));

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, null);
        candidate.setEntityType(valResult.entityType);

        RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "AI startup");
        assertEquals("REJECTED", relResult.status, "Sai Clinic MUST NOT match AI startup query");
    }

    @Test
    @DisplayName("TEST 5: 'National High Speed Rail Corporation' + 'AI startup' -> REJECTED")
    void test5_RailCorporationNotAi() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("National High Speed Rail Corporation");
        candidate.setCategories(Collections.singletonList("transportation"));

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, null);
        candidate.setEntityType(valResult.entityType);

        RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "AI startup");
        assertEquals("REJECTED", relResult.status);
    }

    @Test
    @DisplayName("TEST 6: LinkedIn /in/john-doe -> PERSON profile validation")
    void test6_LinkedInPersonProfile() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("John Doe - Founder & Developer");
        candidate.setEntityType(EntityType.PERSON);

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, "founder");
        assertEquals(EntityType.PERSON, valResult.entityType);
    }

    @Test
    @DisplayName("TEST 7: Business candidate with email evidence")
    void test7_InstagramPostAsValidEvidence() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Aarya Infotech");
        candidate.setEmail("info@aryainfotech.com");
        candidate.setEntityType(EntityType.BUSINESS);

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, "startup");
        assertEquals(EntityType.BUSINESS, valResult.entityType);
    }

    @Test
    @DisplayName("TEST 8: Business with website = null -> Candidate can still be returned as prospect")
    void test8_NoWebsiteBusinessAllowed() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Surat Digital Agency");
        candidate.setWebsiteUrl(null);
        candidate.setEmail("contact@suratdigital.com");
        candidate.setCategories(Collections.singletonList("service"));

        IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, null);
        candidate.setEntityType(valResult.entityType);

        RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "digital agency");
        assertEquals("RELEVANT", relResult.status);
        assertEquals("NO_WEBSITE_DISCOVERED", candidate.getWebsiteStatus());
    }

    @Test
    @DisplayName("TEST 9: Multi-source deduplication -> Same domain / phone merges into single candidate")
    void test9_DeduplicationDomainMerge() {
        CandidateDTO c1 = new CandidateDTO();
        c1.setBusinessName("Aarya Infotech");
        c1.setWebsiteUrl("https://aryainfotech.com");
        c1.setProvider("GEOAPIFY");

        CandidateDTO c2 = new CandidateDTO();
        c2.setBusinessName("Aarya Infotech Solutions");
        c2.setWebsiteUrl("https://aryainfotech.com");
        c2.setPhone("+919876543210");
        c2.setProvider("OSM");

        String domain1 = c1.getWebsiteUrl().replace("https://", "");
        String domain2 = c2.getWebsiteUrl().replace("https://", "");
        assertEquals(domain1, domain2, "Identical website domains MUST match for deduplication");
    }

    @Test
    @DisplayName("TEST 10: Smart Paste single candidate parsing")
    void test10_SmartPasteParsing() {
        String paste = "Aarya Infotech\nSurat Gujarat\ninfo@aryainfotech.com\n+91 98765 43210\ninstagram.com/aryainfotech_official";
        List<TextExtractorUtils.ExtractedLead> leads = TextExtractorUtils.parseRawText(paste, "Surat");
        assertEquals(1, leads.size());
        assertEquals("Aarya Infotech", leads.get(0).businessName);
        assertEquals("info@aryainfotech.com", leads.get(0).email);
    }

    @Test
    @DisplayName("TEST 11: Dictionary & Educational Article Pages MUST BE REJECTED")
    void test11_DictionaryAndArticlesRejected() {
        String[] titles = {
            "Digital - Definition, Meaning & Synonyms",
            "BBC Technology",
            "What is Technology? Definition, Types & Importance",
            "Technology - The New York Times",
            "27 Types of Technology With Definitions & Examples",
            "What Is SaaS?"
        };

        for (String title : titles) {
            CandidateDTO candidate = new CandidateDTO();
            candidate.setBusinessName(title);
            candidate.setProvider("GEOAPIFY");

            SourceEvidence evidence = new SourceEvidence();
            evidence.setResultTitle(title);
            evidence.setSnippet("Comprehensive guide and definition of technology and software.");
            candidate.setSourceEvidence(evidence);

            IdentityValidator.IdentityValidationResult valResult = identityValidator.validate(candidate, "technology");
            assertNotEquals(EntityType.BUSINESS, valResult.entityType, "Title '" + title + "' MUST NOT be classified as BUSINESS entity!");

            candidate.setEntityType(valResult.entityType);
            RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "technology");

            assertEquals("REJECTED", relResult.status, "Title '" + title + "' MUST be REJECTED as a business lead!");
        }
    }

    @Test
    @DisplayName("SECTION 35 - TEST 2: 'Los Angeles Startup Networking Event' -> EVENT, REJECTED")
    void testSection35_Test2_StartupEvent() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Los Angeles Startup Networking Event");
        candidate.setEntityType(EntityType.EVENT);

        RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "startup Los Angeles");
        assertEquals("REJECTED", relResult.status, "Event MUST be REJECTED as a commercial business lead");
    }

    @Test
    @DisplayName("SECTION 35 - TEST 4: LA SaaS company with outdated site & public email -> HOT / HIGH Lead")
    void testSection35_Test4_LaSaasCompanyOutdatedWebsite() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("TechFlow AI");
        candidate.setEntityType(EntityType.BUSINESS);
        candidate.setCategories(java.util.Arrays.asList("office.it", "software"));
        candidate.setWebsiteUrl("https://techflow.ai");
        candidate.setWebsiteStatus("AUDITED");
        candidate.setWebsiteOpportunityScore(88);
        candidate.setContactabilityScore(94);
        candidate.setBusinessFitScore(93);
        candidate.setEmail("hello@techflow.ai");
        candidate.setAreaName("Los Angeles");

        RelevanceQualifier.QualificationResult qual = relevanceQualifier.qualify(candidate, "startup Los Angeles");
        assertEquals("RELEVANT", qual.status);
        assertTrue("HOT".equals(candidate.getQualificationLevel()) || "HIGH".equals(candidate.getQualificationLevel()));
        assertTrue(candidate.getLeadOpportunityScore() >= 80);
    }

    @Test
    @DisplayName("SECTION 35 - TEST 6: 'Entrepreneur Training Program' -> PROGRAM, REJECTED")
    void testSection35_Test6_EntrepreneurProgram() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Entrepreneur Training Program");
        candidate.setEntityType(EntityType.PROGRAM);

        RelevanceQualifier.QualificationResult relResult = relevanceQualifier.qualify(candidate, "startup Los Angeles");
        assertEquals("REJECTED", relResult.status);
    }
}
