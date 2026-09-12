package com.setuleads.entity;

public enum LeadSource {
    GEOAPIFY,
    OPENSTREETMAP,
    OSM,
    OVERTURE,
    GOOGLE_PLACES, // Retained for backwards compatibility with legacy database records
    SOCIAL_XRAY,
    WEB_DORK,
    MANUAL,
    REFERRAL,
    TELEGRAM,
    INTERNSHALA,
    INBOUND_FORM,
    OTHER
}
