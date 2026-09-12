package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class RelevanceQualifierTest {

    private RelevanceQualifier qualifier;

    @BeforeEach
    void setUp() {
        qualifier = new RelevanceQualifier();
    }

    @Test
    @DisplayName("TEST 1: Startup query + Clothing Store -> RELEVANT (Web Dev Target Prospect)")
    void test1_StartupClothingBoutique() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Palav Shree Fashion Boutique");
        candidate.setCategories(Arrays.asList("commercial.clothing"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "startup");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.50, "Clothing store must qualify as general startup prospect!");
    }

    @Test
    @DisplayName("TEST 2: Startup query + Bakery Shop -> RELEVANT (Web Dev Target Prospect)")
    void test2_StartupBakeryShop() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Govardhan Bakes & Sweets");
        candidate.setCategories(Arrays.asList("commercial.food_and_drink.confectionery"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "startup");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.50, "Bakery shop must qualify as general startup prospect!");
    }

    @Test
    @DisplayName("TEST 3: Clothing query + Fashion Studio -> RELEVANT")
    void test3_ClothingSearch() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Vogue Apparel Fashion Studio");
        candidate.setCategories(Arrays.asList("commercial.clothing"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "clothing");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.70);
    }

    @Test
    @DisplayName("TEST 4: Bakery query + Cake Studio -> RELEVANT")
    void test4_BakerySearch() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Delight Cake Studio");
        candidate.setCategories(Arrays.asList("commercial.food_and_drink.confectionery"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "bakery");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.70);
    }

    @Test
    @DisplayName("TEST 4B: 'cake shop' query + 'Neuton Hair Salon' -> REJECTED")
    void test4B_CakeShopQueryExcludesHairSalon() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Neuton Hair Salon");
        candidate.setCategories(Arrays.asList("service.beauty", "hairdresser"));
        candidate.setGeoapifyPlaceId("place_12345"); // map place!

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "cake shop");

        assertEquals("REJECTED", result.status, "Hair salon MUST BE REJECTED when searching for cake shop!");
        assertEquals(0.00, result.score);
    }

    @Test
    @DisplayName("TEST 4C: 'cake shop' query + 'Photo Craft' -> REJECTED")
    void test4C_CakeShopQueryExcludesPhotoCraft() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Photo Craft");
        candidate.setCategories(Arrays.asList("commercial.photo", "craft"));
        candidate.setOsmId("98765"); // map place!

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "cake shop");

        assertEquals("REJECTED", result.status, "Photo craft studio MUST BE REJECTED when searching for cake shop!");
        assertEquals(0.00, result.score);
    }

    @Test
    @DisplayName("TEST 5: Software company query + ABC Software Solutions -> RELEVANT")
    void test5_SoftwareCompanySolutions() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("ABC Software Solutions");
        candidate.setCategories(Arrays.asList("software"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "software company");

        assertEquals("RELEVANT", result.status);
        assertEquals("HIGH_CONFIDENCE", result.confidenceLevel);
        assertTrue(result.score >= 0.70);
    }

    @Test
    @DisplayName("TEST 6: Software company query + Bakery Shop -> REJECTED (Specific Tech Intent)")
    void test6_SoftwareCompanyBakery() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Govardhan Bakes & Sweets");
        candidate.setCategories(Arrays.asList("food", "bakery"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "software company");

        assertEquals("REJECTED", result.status);
        assertTrue(result.score < 0.30);
    }

    @Test
    @DisplayName("TEST 7: Startup query + State Record Office -> REJECTED (Non-Business Infrastructure)")
    void test7_StartupGovernmentOffice() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("State Record Office");
        candidate.setCategories(Arrays.asList("office.government"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "startup");

        assertEquals("REJECTED", result.status);
        assertTrue(result.score < 0.30);
    }

    @Test
    @DisplayName("TEST 8: Startup query + Police Station -> REJECTED (Infrastructure)")
    void test8_StartupPoliceStation() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Police Headquarters Partapnagar");
        candidate.setCategories(Arrays.asList("service.police"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "startup");

        assertEquals("REJECTED", result.status);
        assertTrue(result.score < 0.30);
    }

    @Test
    @DisplayName("TEST 9: Software company query + XYZ Software Pvt Ltd (website=null) -> RELEVANT")
    void test9_SoftwareNoWebsitePreserved() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("XYZ Software Pvt Ltd");
        candidate.setCategories(Arrays.asList("software"));
        candidate.setWebsiteUrl(null); // No website!

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "software company");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.70, "Relevant business without website MUST be preserved!");
    }

    @Test
    @DisplayName("TEST 10: Online Service query + Digital Web Agency -> RELEVANT")
    void test10_OnlineServiceAgency() {
        CandidateDTO candidate = new CandidateDTO();
        candidate.setBusinessName("Apex Digital Web Agency");
        candidate.setCategories(Arrays.asList("office.company", "service"));

        RelevanceQualifier.QualificationResult result = qualifier.qualify(candidate, "online service");

        assertEquals("RELEVANT", result.status);
        assertTrue(result.score >= 0.50);
    }
}
