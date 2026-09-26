package com.setuleads.service;

import com.setuleads.dto.CandidateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class RelevanceQualifier {

    private static final Logger logger = LoggerFactory.getLogger(RelevanceQualifier.class);
    private static final Pattern WORD_BOUNDARY = Pattern.compile("[^a-z0-9]+");

    public enum SearchIntentType {
        STARTUP,
        CLOTHING,
        BAKERY,
        ONLINE_SERVICE,
        SOFTWARE_COMPANY,
        IT_COMPANY,
        SAAS_COMPANY,
        AI_COMPANY,
        WEB_DEVELOPMENT,
        RESTAURANT,
        DENTIST,
        SALON,
        PHOTO_STUDIO,
        GENERAL_BUSINESS
    }

    public static class IntentDefinition {
        public SearchIntentType intentType;
        public String displayCategoryName;
        public Set<String> targetPhrases = new HashSet<>();
        public Set<String> targetTokens = new HashSet<>();
        public Set<String> positiveCategories = new HashSet<>();
        public Set<String> negativeCategories = new HashSet<>();
        public Set<String> negativeTokens = new HashSet<>();

        public IntentDefinition(SearchIntentType intentType, String displayCategoryName) {
            this.intentType = intentType;
            this.displayCategoryName = displayCategoryName;
        }
    }

    public static class QualificationResult {
        public double score;
        public String status; // "RELEVANT" or "REJECTED"
        public String confidenceLevel; // "HIGH_CONFIDENCE", "MEDIUM_CONFIDENCE", "LOW_CONFIDENCE", "REJECTED"
        public List<String> matchedSignals = new ArrayList<>();
        public List<String> negativeSignals = new ArrayList<>();
        public List<String> relevanceReasons = new ArrayList<>();
        public List<String> rejectionReasons = new ArrayList<>();

        public QualificationResult(double score, String status, String confidenceLevel,
                                   List<String> matchedSignals, List<String> negativeSignals,
                                   List<String> relevanceReasons, List<String> rejectionReasons) {
            this.score = Math.round(score * 100.0) / 100.0;
            this.status = status;
            this.confidenceLevel = confidenceLevel;
            this.matchedSignals = matchedSignals;
            this.negativeSignals = negativeSignals;
            this.relevanceReasons = relevanceReasons;
            this.rejectionReasons = rejectionReasons;
        }
    }

    public IntentDefinition buildIntent(String query) {
        String q = query.toLowerCase().trim();
        Set<String> tokens = tokenize(q);

        IntentDefinition intent;

        if (q.contains("bakery") || q.contains("cake") || q.contains("pastry") || q.contains("confectionery") || q.contains("sweet")) {
            intent = new IntentDefinition(SearchIntentType.BAKERY, "cake shop & bakery");
            intent.targetPhrases.addAll(Arrays.asList("cake shop", "bakery shop", "cake studio", "pastry shop", "confectionery", "bakes studio", "cupcake shop", "sweets shop", "cake bakery", "pastry studio"));
            intent.targetTokens.addAll(Arrays.asList("bakery", "cakes", "cake", "pastry", "pastries", "sweets", "sweet", "bakes", "bake", "patisserie", "confectionery", "cupcake", "cupcakes", "baker", "dessert", "desserts"));
            intent.positiveCategories.addAll(Arrays.asList(
                "commercial.food_and_drink.confectionery", "commercial.food_and_drink.bakery", "bakery", "confectionery", "patisserie", "catering.cafe", "shop:bakery", "shop.bakery", "shop:pastry", "shop.pastry", "shop:confectionery", "shop.confectionery"
            ));
            intent.negativeCategories.addAll(Arrays.asList(
                "hairdresser", "salon", "beauty", "barber", "photo", "photographer", "clothing", "boutique", "garments", "auto", "vehicle", "mechanic", "plumber", "lawyer", "legal", "dentist", "doctor", "hospital", "bank", "gym", "fitness", "laundry", "cleaner", "electronics", "mobile", "estate_agent", "real_estate", "hardware", "construction", "school", "church", "temple", "mosque", "hotel", "motel", "gas_station", "petrol", "fuel", "stationery", "drawing", "steel", "metal", "jewelry", "diamond", "optician", "tattoo", "police", "government", "railway", "transport"
            ));
            intent.negativeTokens.addAll(Arrays.asList(
                "hair", "salon", "beauty", "barber", "photo", "photographer", "craft", "clothing", "boutique", "apparel", "garment", "wear", "auto", "mechanic", "car", "plumber", "lawyer", "legal", "dentist", "doctor", "hospital", "bank", "gym", "laundry", "cleaner", "electronics", "mobile", "phone", "estate", "hardware", "steel", "jewel", "jeweler", "jewelry", "optician", "tattoo", "police", "government", "railway"
            ));
        } else if (q.contains("clothing") || q.contains("boutique") || q.contains("fashion") || q.contains("apparel") || q.contains("wear")) {
            intent = new IntentDefinition(SearchIntentType.CLOTHING, "clothing boutique & fashion store");
            intent.targetPhrases.addAll(Arrays.asList("clothing store", "boutique", "fashion studio", "apparel brand", "online clothing", "garment store", "wear studio", "fashion boutique"));
            intent.targetTokens.addAll(Arrays.asList("clothing", "boutique", "fashion", "apparel", "wear", "garments", "store", "collection", "outfit", "couture", "dress", "dresses", "attire"));
            intent.positiveCategories.addAll(Arrays.asList(
                "commercial.clothing", "commercial.clothing.clothes", "clothing", "boutique", "apparel", "garments", "shop:clothes", "shop.clothes"
            ));
            intent.negativeCategories.addAll(Arrays.asList(
                "bakery", "confectionery", "restaurant", "cafe", "food", "salon", "hairdresser", "beauty", "photo", "photographer", "software", "it", "tech", "lawyer", "dentist", "doctor", "hospital", "bank", "atm", "fuel", "petrol", "railway", "stationery", "steel", "dairy"
            ));
            intent.negativeTokens.addAll(Arrays.asList(
                "bakery", "bakes", "cake", "cakes", "pastry", "restaurant", "food", "hair", "salon", "beauty", "barber", "photo", "photographer", "software", "tech", "lawyer", "dentist", "doctor", "hospital", "bank", "atm", "petrol", "fuel", "railway", "steel", "metal", "dairy"
            ));
        } else if (q.contains("online service") || q.contains("digital service") || q.contains("online store") || q.contains("e-commerce") || q.contains("agency")) {
            intent = new IntentDefinition(SearchIntentType.ONLINE_SERVICE, "digital agency & online service");
            intent.targetPhrases.addAll(Arrays.asList("online service", "digital agency", "online store", "e-commerce", "digital solutions", "web agency", "media agency"));
            intent.targetTokens.addAll(Arrays.asList("online", "digital", "agency", "e-commerce", "media", "solutions", "studio", "web"));
            intent.positiveCategories.addAll(Arrays.asList(
                "service", "office.company", "agency", "office.it", "technology_company", "digital", "digital_agency", "advertising_agency", "web_development"
            ));
            intent.negativeCategories.addAll(Arrays.asList(
                "police", "government", "hospital", "bank", "atm", "fuel", "petrol", "railway", "underpass", "bakery", "post", "market", "salon", "hairdresser", "beauty"
            ));
            intent.negativeTokens.addAll(Arrays.asList(
                "police", "government", "hospital", "bank", "atm", "petrol", "fuel", "railway", "post", "market", "bazar", "bakery", "dairy", "steel", "diamond", "hair", "salon"
            ));
        } else if (q.contains("ai company") || q.contains("artificial intelligence") || tokens.contains("ai")) {
            intent = new IntentDefinition(SearchIntentType.AI_COMPANY, "AI & intelligence technology company");
            intent.targetPhrases.addAll(Arrays.asList("ai company", "ai vision", "ai solutions", "ai technologies", "artificial intelligence"));
            intent.targetTokens.addAll(Arrays.asList("ai", "ml", "intelligence"));
            configureTechIntents(intent);
        } else if (q.contains("software") || q.contains("software company")) {
            intent = new IntentDefinition(SearchIntentType.SOFTWARE_COMPANY, "software development company");
            intent.targetPhrases.addAll(Arrays.asList("software company", "software solutions", "software development", "software lab", "software pvt ltd", "it company", "tech solutions", "infotech", "digital solutions", "technology solutions"));
            intent.targetTokens.addAll(Arrays.asList("software", "dev", "code", "soft", "tech", "technology", "it", "infotech", "systems", "digital", "cyber", "solutions", "web", "cloud", "data", "labs"));
            configureTechIntents(intent);
        } else if (q.contains("web development") || q.contains("web design") || q.contains("website")) {
            intent = new IntentDefinition(SearchIntentType.WEB_DEVELOPMENT, "web design & development agency");
            intent.targetPhrases.addAll(Arrays.asList("web development", "web design", "digital agency", "web studio", "software agency", "digital solutions"));
            intent.targetTokens.addAll(Arrays.asList("web", "website", "developer", "digital", "agency", "design", "software", "media"));
            configureTechIntents(intent);
        } else if (q.contains("saas")) {
            intent = new IntentDefinition(SearchIntentType.SAAS_COMPANY, "SaaS platform provider");
            intent.targetPhrases.addAll(Arrays.asList("saas company", "saas platform", "cloud software"));
            intent.targetTokens.addAll(Arrays.asList("saas", "cloud", "software", "platform"));
            configureTechIntents(intent);
        } else if (q.contains("it company") || q.contains("it services") || q.contains("infotech")) {
            intent = new IntentDefinition(SearchIntentType.IT_COMPANY, "IT services & solutions provider");
            intent.targetPhrases.addAll(Arrays.asList("it company", "it services", "infotech", "it solutions", "software company", "tech company"));
            intent.targetTokens.addAll(Arrays.asList("it", "infotech", "systems", "tech", "technology", "software", "solutions", "digital", "cyber", "networks"));
            configureTechIntents(intent);
        } else if (q.contains("startup") || q.contains("local business")) {
            intent = new IntentDefinition(SearchIntentType.STARTUP, "local business & startup prospect");
            intent.targetPhrases.addAll(Arrays.asList("tech startup", "software startup", "digital brand", "clothing store", "boutique", "bakery", "online service", "creative studio"));
            intent.targetTokens.addAll(Arrays.asList("startup", "tech", "technology", "software", "digital", "clothing", "bakery", "boutique", "salon", "studio", "agency", "store", "shop", "service", "online"));
            intent.positiveCategories.addAll(Arrays.asList(
                "clothing", "food_and_drink", "bakery", "beauty", "office.it", "office.technology",
                "commercial.clothing", "commercial.food_and_drink", "service.beauty", "catering.cafe",
                "office", "office:company", "office.company", "commercial.business"
            ));
            intent.negativeCategories.addAll(Arrays.asList(
                "police", "government", "prosecutor", "court", "atm", "public_toilet",
                "bus_stop", "railway", "underpass", "fuel", "petrol", "gas_station"
            ));
            intent.negativeTokens.addAll(Arrays.asList(
                "police", "government", "court", "railway", "underpass", "petrol", "fuel", "atm"
            ));
        } else if (q.contains("restaurant") || q.contains("food") || q.contains("cafe") || q.contains("dining")) {
            intent = new IntentDefinition(SearchIntentType.RESTAURANT, "restaurant & dining establishment");
            intent.targetPhrases.addAll(Arrays.asList("restaurant", "cafe", "fast food", "dining", "bistro", "eatery"));
            intent.targetTokens.addAll(Arrays.asList("restaurant", "cafe", "food", "dining", "bistro", "eatery", "pizza", "burger", "grill"));
            intent.positiveCategories.addAll(Arrays.asList("restaurant", "cafe", "food", "amenity:restaurant", "amenity:cafe", "catering"));
            intent.negativeCategories.addAll(Arrays.asList("police", "government", "hospital", "bank", "fuel", "hairdresser", "salon", "photo", "software", "lawyer", "dentist"));
            intent.negativeTokens.addAll(Arrays.asList("police", "government", "hospital", "bank", "fuel", "hair", "salon", "photo", "software", "lawyer", "dentist"));
        } else if (q.contains("dentist") || q.contains("dental")) {
            intent = new IntentDefinition(SearchIntentType.DENTIST, "dental clinic & dentist");
            intent.targetPhrases.addAll(Arrays.asList("dental clinic", "dentist", "dental care", "orthodontist"));
            intent.targetTokens.addAll(Arrays.asList("dentist", "dental", "orthodontist", "teeth", "clinic"));
            intent.positiveCategories.addAll(Arrays.asList("dentist", "dental", "clinic", "healthcare", "amenity:dentist"));
            intent.negativeCategories.addAll(Arrays.asList("police", "government", "bank", "fuel", "bakery", "restaurant", "clothing", "photo", "salon"));
            intent.negativeTokens.addAll(Arrays.asList("police", "government", "bank", "fuel", "bakery", "restaurant", "clothing", "photo", "salon"));
        } else if (q.contains("salon") || q.contains("hair") || q.contains("barber") || q.contains("beauty")) {
            intent = new IntentDefinition(SearchIntentType.SALON, "hair salon & beauty parlor");
            intent.targetPhrases.addAll(Arrays.asList("hair salon", "beauty salon", "barber shop", "hair studio"));
            intent.targetTokens.addAll(Arrays.asList("salon", "hair", "barber", "beauty", "spa", "parlor"));
            intent.positiveCategories.addAll(Arrays.asList("service.beauty", "hairdresser", "salon", "beauty"));
            intent.negativeCategories.addAll(Arrays.asList("bakery", "restaurant", "clothing", "photo", "software", "dentist"));
            intent.negativeTokens.addAll(Arrays.asList("bakery", "cake", "pastry", "restaurant", "clothing", "photo", "software", "dentist"));
        } else if (q.contains("photo") || q.contains("photographer") || q.contains("photography")) {
            intent = new IntentDefinition(SearchIntentType.PHOTO_STUDIO, "photo studio & photography services");
            intent.targetPhrases.addAll(Arrays.asList("photo studio", "photography", "photographer", "photo craft"));
            intent.targetTokens.addAll(Arrays.asList("photo", "photography", "photographer", "craft", "camera", "studio"));
            intent.positiveCategories.addAll(Arrays.asList("commercial.photo", "photo", "craft.photographer"));
            intent.negativeCategories.addAll(Arrays.asList("bakery", "restaurant", "clothing", "software", "dentist", "salon", "hairdresser"));
            intent.negativeTokens.addAll(Arrays.asList("bakery", "cake", "pastry", "restaurant", "clothing", "software", "dentist", "hair", "salon"));
        } else {
            // Dynamic query intent builder for custom queries
            intent = new IntentDefinition(SearchIntentType.GENERAL_BUSINESS, query + " business");
            intent.targetPhrases.add(q);
            for (String t : tokens) {
                if (t.length() > 2 && !isGenericStopWord(t)) {
                    intent.targetTokens.add(t);
                    intent.positiveCategories.add(t);
                }
            }
            intent.negativeCategories.addAll(Arrays.asList("police", "government", "court", "atm", "public_toilet", "bus_stop", "fuel"));
            intent.negativeTokens.addAll(Arrays.asList("police", "government", "court", "petrol", "fuel", "atm"));
        }

        return intent;
    }

    private boolean isGenericStopWord(String token) {
        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "shop", "store", "near", "in", "the", "best", "top", "local", "service", "services", "company", "center", "centre", "place"
        ));
        return stopWords.contains(token.toLowerCase());
    }

    private void configureTechIntents(IntentDefinition intent) {
        intent.positiveCategories.addAll(Arrays.asList(
            "software", "software_company", "it_services", "computer_services",
            "web_development", "technology_company", "saas", "information_technology",
            "office.it", "office.technology", "commercial.software", "service.it",
            "office", "office:company", "office.company", "office:it"
        ));

        intent.negativeCategories.addAll(Arrays.asList(
            "hospital", "clinic", "medical", "healthcare", "doctor", "dentist", "pharmacy",
            "bank", "atm", "financial", "police", "government", "prosecutor", "court",
            "education", "school", "college", "university", "department", "railway",
            "transportation", "bus_stop", "stationery", "drawing", "printing", "grocery",
            "fuel", "petrol", "gas_station", "salon", "barber", "hairdresser", "beauty", "bakery", "confectionery", "restaurant",
            "temple", "church", "mosque", "industrial", "manufacturing", "steel", "metal", "jewelry"
        ));

        intent.negativeTokens.addAll(Arrays.asList(
            "hospital", "clinic", "doctor", "bank", "police", "railway", "rail", "microbiology",
            "department", "institute", "school", "college", "university", "stationery", "drawing",
            "chicken", "meat", "mutton", "grocery", "supermarket", "temple", "church", "mosque",
            "liquor", "wine", "beer", "petrol", "fuel", "salon", "barber", "hair", "beauty", "bakery", "bakes", "cake", "pastry", "print", "printing",
            "steel", "iron", "metal", "diamond", "diamonds", "jewel", "jewelry", "tape", "tapes",
            "cement", "textile", "chemical", "pharma", "pharmaceutical", "dairy", "post", "market",
            "bazar", "bazaar", "courier", "cargo", "logistics"
        ));
    }

    public QualificationResult qualify(CandidateDTO candidate, String query) {
        IntentDefinition intent = buildIntent(query);

        List<String> matchedSignals = new ArrayList<>();
        List<String> negativeSignals = new ArrayList<>();
        List<String> relevanceReasons = new ArrayList<>();
        List<String> rejectionReasons = new ArrayList<>();

        // =========================================================
        // 0. ENTITY TYPE PROTECTION (Person / Org / Unknown Rejection)
        // =========================================================
        if (candidate.getEntityType() != null && candidate.getEntityType() != com.setuleads.entity.EntityType.BUSINESS) {
            negativeSignals.add("entity_type_mismatch: " + candidate.getEntityType() + " (-1.00)");
            rejectionReasons.add("Candidate entity type is " + candidate.getEntityType() + " (not a commercial business lead)");
            return new QualificationResult(
                0.00,
                "REJECTED",
                "REJECTED",
                matchedSignals,
                negativeSignals,
                relevanceReasons,
                rejectionReasons
            );
        }

        String rawName = candidate.getBusinessName() != null ? candidate.getBusinessName() : "";
        String normalizedName = rawName.toLowerCase();
        Set<String> nameTokens = tokenize(normalizedName);

        String fullText = normalizedName;
        if (candidate.getSourceEvidence() != null) {
            if (candidate.getSourceEvidence().getResultTitle() != null) {
                fullText += " " + candidate.getSourceEvidence().getResultTitle().toLowerCase();
            }
            if (candidate.getSourceEvidence().getSnippet() != null) {
                fullText += " " + candidate.getSourceEvidence().getSnippet().toLowerCase();
            }
        }

        // Informational / Dictionary Article Check
        Set<String> articlePhrases = new HashSet<>(Arrays.asList(
            "definition, meaning", "definition & meaning", "meaning & synonyms", "definition, types",
            "what is", "types of", "27 types", "types & importance", "definition", "synonyms",
            "vocabulary.com", "dictionary.com", "nytimes", "bbc technology", "bbc news", "wikipedia", "investopedia"
        ));

        boolean isInformationalArticle = false;
        for (String phrase : articlePhrases) {
            if (fullText.contains(phrase) || normalizedName.contains(phrase)) {
                isInformationalArticle = true;
                negativeSignals.add("informational_article: '" + phrase + "' (-0.80)");
                rejectionReasons.add("Informational article or dictionary definition page ('" + phrase + "')");
                break;
            }
        }

        if (isInformationalArticle) {
            return new QualificationResult(
                0.00,
                "REJECTED",
                "REJECTED",
                matchedSignals,
                negativeSignals,
                relevanceReasons,
                rejectionReasons
            );
        }

        List<String> catList = candidate.getCategories() != null ? candidate.getCategories() : Collections.emptyList();
        String catString = String.join(" ", catList).toLowerCase();
        Set<String> catTokens = tokenize(catString);

        String website = candidate.getWebsiteUrl() != null ? candidate.getWebsiteUrl().toLowerCase() : "";

        double score = 0.0;
        boolean hasCategoryContradiction = false;
        boolean hasNameContradiction = false;

        // =========================================================
        // 1. CATEGORY SIGNAL & CONTRADICTION EVALUATION
        // =========================================================
        for (String badCat : intent.negativeCategories) {
            if (catString.contains(badCat) || catTokens.contains(badCat)) {
                hasCategoryContradiction = true;
                negativeSignals.add("category_contradiction: " + badCat + " (-1.00)");
                rejectionReasons.add("Business category '" + badCat + "' contradicts search query intent ('" + query + "')");
                break;
            }
        }

        if (hasCategoryContradiction) {
            return new QualificationResult(
                0.00,
                "REJECTED",
                "REJECTED",
                matchedSignals,
                negativeSignals,
                relevanceReasons,
                rejectionReasons
            );
        }

        boolean categoryMatched = false;
        boolean isSocialXray = "SOCIAL_XRAY".equalsIgnoreCase(candidate.getProvider()) ||
                (candidate.getCategories() != null && candidate.getCategories().contains("Social & Web Prospect"));

        if (isSocialXray) {
            boolean hasBusinessEvidence = candidate.getSocialHandle() != null ||
                                           candidate.getEmail() != null ||
                                           candidate.getPhone() != null ||
                                           containsCommercialToken(nameTokens);

            if (hasBusinessEvidence) {
                score += 0.40;
                matchedSignals.add("social_xray_prospect: verified business footprint (+0.40)");
                relevanceReasons.add("Harvested via Social X-Ray web search");
            } else {
                negativeSignals.add("lacks_business_evidence: no social handle, contact info, or business token");
            }
        } else {
            for (String posCat : intent.positiveCategories) {
                String posColon = posCat.replace('.', ':');
                String posUnderscore = posCat.replace('.', '_');
                String posSpace = posCat.replace('.', ' ');

                if (catString.contains(posCat) || catString.contains(posColon) || catString.contains(posUnderscore) || catString.contains(posSpace) || catTokens.contains(posCat)) {
                    score += 0.55;
                    categoryMatched = true;
                    matchedSignals.add("category_match: " + posCat + " (+0.55)");
                    relevanceReasons.add("Provider category directly matches " + intent.displayCategoryName + " intent");
                    break;
                }
            }
        }

        // =========================================================
        // 2. BUSINESS NAME TOKEN & PHRASE EVALUATION (+25 / REJECT)
        // =========================================================
        for (String badToken : intent.negativeTokens) {
            if (nameTokens.contains(badToken)) {
                hasNameContradiction = true;
                negativeSignals.add("name_contradiction: token '" + badToken + "' (-1.00)");
                rejectionReasons.add("Business name contains contradictory token '" + badToken + "'");
                break;
            }
        }

        if (hasNameContradiction) {
            return new QualificationResult(
                0.00,
                "REJECTED",
                "REJECTED",
                matchedSignals,
                negativeSignals,
                relevanceReasons,
                rejectionReasons
            );
        }

        // Phrase Matching
        boolean phraseMatched = false;
        for (String phrase : intent.targetPhrases) {
            if (normalizedName.contains(phrase)) {
                score += 0.35;
                phraseMatched = true;
                matchedSignals.add("name_phrase: '" + phrase + "' (+0.35)");
                relevanceReasons.add("Business name contains target phrase '" + phrase + "'");
                break;
            }
        }

        // Standalone Token Matching (Strict Word Boundaries - e.g. "sai" MUST NOT match "ai")
        boolean nameTokenMatched = false;
        if (!phraseMatched) {
            for (String targetToken : intent.targetTokens) {
                if (nameTokens.contains(targetToken)) {
                    score += 0.25;
                    nameTokenMatched = true;
                    matchedSignals.add("name_standalone_token: '" + targetToken + "' (+0.25)");
                    relevanceReasons.add("Business name contains standalone token '" + targetToken + "'");
                    break;
                }
            }
        }

        // =========================================================
        // 3. WEBSITE DOMAIN & PROSPECT OPPORTUNITY CLASSIFICATION
        // =========================================================
        boolean domainMatched = false;
        if (!website.isEmpty()) {
            boolean isSocialUrl = website.contains("instagram.com") || website.contains("linkedin.com") ||
                                  website.contains("facebook.com") || website.contains("linktr.ee");

            if (!isSocialUrl) {
                candidate.setWebsiteStatus("OFFICIAL_WEBSITE");
                candidate.setOpportunityType("WEBSITE_AUDIT");
                String domain = extractDomain(website);
                if (domain != null) {
                    Set<String> domainTokens = tokenize(domain);
                    for (String tToken : intent.targetTokens) {
                        if (domainTokens.contains(tToken)) {
                            score += 0.15;
                            domainMatched = true;
                            matchedSignals.add("domain_signal: '" + domain + "' (+0.15)");
                            relevanceReasons.add("Website domain reinforces intent ('" + domain + "')");
                            break;
                        }
                    }
                    if (!domainMatched && isTechRelated(intent.intentType) && (domain.endsWith(".io") || domain.endsWith(".ai") || domain.contains("tech") || domain.contains("soft"))) {
                        score += 0.10;
                        domainMatched = true;
                        matchedSignals.add("domain_signal: TLD/Keyword in '" + domain + "' (+0.10)");
                    }
                }
            } else {
                candidate.setWebsiteStatus("NO_WEBSITE_DISCOVERED");
                candidate.setOpportunityType("WEBSITE_CREATION");
                relevanceReasons.add("No custom website discovered; prime outreach prospect for website creation");
            }
        } else {
            candidate.setWebsiteStatus("NO_WEBSITE_DISCOVERED");
            candidate.setOpportunityType("WEBSITE_CREATION");
            relevanceReasons.add("No custom website discovered; prime outreach prospect for website creation");
        }

        // =========================================================
        // 4. POSITIVE SIGNAL VALIDATION (REJECT IF NO QUERY MATCH)
        // =========================================================
        boolean isMapPlace = candidate.getGeoapifyPlaceId() != null || candidate.getOsmId() != null || candidate.getOvertureId() != null;
        boolean hasAnyPositiveQueryMatch = categoryMatched || phraseMatched || nameTokenMatched || domainMatched || isMapPlace ||
                (intent.intentType == SearchIntentType.STARTUP && containsCommercialToken(nameTokens)) ||
                (intent.intentType == SearchIntentType.GENERAL_BUSINESS && containsCommercialToken(nameTokens));

        if (!hasAnyPositiveQueryMatch) {
            negativeSignals.add("no_query_match_signal: candidate lacks category or name match for '" + query + "'");
            rejectionReasons.add("Candidate business name and category do not match search query intent ('" + query + "')");
            return new QualificationResult(
                0.00,
                "REJECTED",
                "REJECTED",
                matchedSignals,
                negativeSignals,
                relevanceReasons,
                rejectionReasons
            );
        }

        // Add physical map verification bonus ONLY IF the place already matches query intent!
        if (isMapPlace) {
            score += 0.15;
            matchedSignals.add("map_directory_presence: verified map place (+0.15)");
        }

        double finalScore = Math.max(0.0, Math.min(1.0, score));

        // =========================================================
        // 5. SUB-SCORES & LEAD OPPORTUNITY SCORE COMPUTATION
        // =========================================================
        int intentRelevance = (int) Math.round(finalScore * 100);
        int businessFit = Math.max(candidate.getBusinessFitScore() != null ? candidate.getBusinessFitScore() : 30, intentRelevance);
        int locationConfidence = candidate.getLocationConfidence() != null ? (int) Math.round(candidate.getLocationConfidence() * 100) : 85;
        int evidenceConfidence = candidate.getEvidenceConfidence() != null ? (int) Math.round(candidate.getEvidenceConfidence() * 100) : 85;
        int websiteOpportunity = candidate.getWebsiteOpportunityScore() != null ? candidate.getWebsiteOpportunityScore() : (candidate.getWebsiteUrl() != null && !candidate.getWebsiteUrl().isBlank() ? 70 : 40);
        int contactability = candidate.getContactabilityScore() != null ? candidate.getContactabilityScore() : 50;

        candidate.setBusinessFitScore(businessFit);
        candidate.setContactabilityScore(contactability);
        candidate.setWebsiteOpportunityScore(websiteOpportunity);

        int compositeLeadOpportunity = (int) Math.round(
            (businessFit * 0.20) +
            (intentRelevance * 0.15) +
            (locationConfidence * 0.10) +
            (evidenceConfidence * 0.10) +
            (websiteOpportunity * 0.30) +
            (contactability * 0.15)
        );

        if (businessFit < 60 || contactability < 40 || intentRelevance < 50) {
            compositeLeadOpportunity = Math.min(compositeLeadOpportunity, 85);
        }

        candidate.setLeadOpportunityScore(compositeLeadOpportunity);

        // =========================================================
        // 6. THRESHOLD & QUALIFICATION LEVEL CLASSIFICATION
        // =========================================================
        String confidenceLevel;
        String status;

        if (finalScore >= 0.65) {
            confidenceLevel = "HIGH_CONFIDENCE";
            status = "RELEVANT";
        } else if (finalScore >= 0.45) {
            confidenceLevel = "MEDIUM_CONFIDENCE";
            status = "RELEVANT";
        } else if (finalScore >= 0.15) {
            confidenceLevel = "LOW_CONFIDENCE";
            status = "RELEVANT";
        } else {
            confidenceLevel = "REJECTED";
            status = "REJECTED";
            if (rejectionReasons.isEmpty()) {
                rejectionReasons.add("Score " + String.format(Locale.US, "%.2f", finalScore) + " lacks minimum relevance signals");
            }
        }

        String qualificationLevel;
        if ("REJECTED".equals(status)) {
            qualificationLevel = "REJECTED";
        } else if (compositeLeadOpportunity >= 90) {
            qualificationLevel = "HOT";
        } else if (compositeLeadOpportunity >= 75) {
            qualificationLevel = "HIGH";
        } else if (compositeLeadOpportunity >= 60) {
            qualificationLevel = "POTENTIAL";
        } else {
            qualificationLevel = "LOW";
        }

        candidate.setQualificationLevel(qualificationLevel);
        candidate.setRelevanceStatus(status);
        candidate.setConfidenceLevel(confidenceLevel);
        candidate.setRelevanceScore(finalScore);

        String matchReason = String.format(
            "%s-based %s with %s. Business fit score: %d/100, website redesign opportunity score: %d/100, contactability score: %d/100.",
            candidate.getAreaName() != null ? candidate.getAreaName() : "Local",
            intent.displayCategoryName,
            candidate.getWebsiteUrl() != null && !candidate.getWebsiteUrl().isBlank() ? "existing website (" + candidate.getWebsiteUrl() + ")" : "no primary website discovered",
            businessFit,
            websiteOpportunity,
            contactability
        );
        candidate.setMatchReason(matchReason);

        return new QualificationResult(
            finalScore,
            status,
            confidenceLevel,
            matchedSignals,
            negativeSignals,
            relevanceReasons,
            rejectionReasons
        );
    }

    private boolean containsCommercialToken(Set<String> tokens) {
        Set<String> commercialTokens = new HashSet<>(Arrays.asList(
            "studio", "agency", "solutions", "services", "company", "technologies",
            "infotech", "software", "tech", "firm", "store", "shop", "fashion",
            "bakes", "bakery", "boutique", "clinic", "labs", "co", "pvt", "ltd", "llp",
            "founder", "ceo"
        ));
        for (String t : tokens) {
            if (commercialTokens.contains(t)) return true;
        }
        return false;
    }

    private boolean isTechRelated(SearchIntentType type) {
        return type == SearchIntentType.SOFTWARE_COMPANY ||
               type == SearchIntentType.IT_COMPANY ||
               type == SearchIntentType.SAAS_COMPANY ||
               type == SearchIntentType.AI_COMPANY ||
               type == SearchIntentType.WEB_DEVELOPMENT;
    }

    public Set<String> tokenize(String input) {
        if (input == null || input.trim().isEmpty()) {
            return Collections.emptySet();
        }
        String[] parts = WORD_BOUNDARY.split(input.toLowerCase());
        Set<String> set = new HashSet<>();
        for (String p : parts) {
            if (!p.isEmpty()) {
                set.add(p);
            }
        }
        return set;
    }

    private String extractDomain(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            String u = url.trim();
            if (!u.startsWith("http://") && !u.startsWith("https://")) u = "http://" + u;
            URI uri = new URI(u);
            String host = uri.getHost();
            if (host == null) return null;
            if (host.startsWith("www.")) host = host.substring(4);
            return host.toLowerCase();
        } catch (Exception e) {
            return null;
        }
    }
}

