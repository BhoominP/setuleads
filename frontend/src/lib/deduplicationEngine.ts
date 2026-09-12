/**
 * Layered Confidence-Based Candidate Deduplication Engine
 */

import type { UnifiedSearchResult } from '@/types/leadSource';

export interface CandidateRecord extends UnifiedSearchResult {
  geoapify_place_id?: string | null;
  google_place_id?: string | null;
  osm_type?: string | null;
  osm_id?: string | null;
  overture_id?: string | null;
  source_query?: string;
  discovery_area?: string;
}

export function normalizeDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    return host || null;
  } catch {
    const cleaned = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return cleaned || null;
  }
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 7) return null;
  return digits;
}

export function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Calculates Haversine spatial distance between two (lat, lon) points in meters.
 */
export function calculateDistanceMeters(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DeduplicationReport {
  rawCount: number;
  geoapifyCount: number;
  googleCount: number;
  osmCount: number;
  overtureCount: number;
  socialXrayCount?: number;
  uniqueCount: number;
  relevantCount: number;
  rejectedCount: number;
  withWebsiteCount: number;
  noWebsiteCount: number;
  crossSourceMatchesCount: number;
}

export function deduplicateCandidates(candidates: CandidateRecord[]): {
  deduplicated: CandidateRecord[];
  report: DeduplicationReport;
} {
  const rawCount = candidates.length;
  let geoapifyCount = 0;
  let googleCount = 0;
  let osmCount = 0;
  let overtureCount = 0;
  let socialXrayCount = 0;

  candidates.forEach((c) => {
    if (c.source === 'geoapify') geoapifyCount++;
    if (c.source === 'google_places') googleCount++;
    if (c.source === 'osm') osmCount++;
    if (c.source === 'overture') overtureCount++;
    if (c.source === 'social_xray') socialXrayCount++;
  });

  const mergedList: CandidateRecord[] = [];

  for (const candidate of candidates) {
    const candDomain = normalizeDomain(candidate.website_url);
    const candPhone = normalizePhone(candidate.phone);
    const candNameNorm = normalizeName(candidate.business_name);

    let matchIndex = -1;

    for (let i = 0; i < mergedList.length; i++) {
      const existing = mergedList[i];

      // Layer 1: Geoapify Place ID
      if (
        candidate.geoapify_place_id &&
        existing.geoapify_place_id &&
        candidate.geoapify_place_id === existing.geoapify_place_id
      ) {
        matchIndex = i;
        break;
      }

      // Layer 2: OSM ID
      if (
        candidate.osm_id &&
        existing.osm_id &&
        candidate.osm_type === existing.osm_type &&
        candidate.osm_id === existing.osm_id
      ) {
        matchIndex = i;
        break;
      }

      // Layer 3: Overture ID
      if (
        candidate.overture_id &&
        existing.overture_id &&
        candidate.overture_id === existing.overture_id
      ) {
        matchIndex = i;
        break;
      }

      // Layer 4: Normalized Domain match
      const existDomain = normalizeDomain(existing.website_url);
      if (candDomain && existDomain && candDomain === existDomain) {
        matchIndex = i;
        break;
      }

      // Layer 5: Phone number match
      const existPhone = normalizePhone(existing.phone);
      if (candPhone && existPhone && candPhone === existPhone) {
        matchIndex = i;
        break;
      }

      // Layer 6: Normalized Name + Spatial Distance < 200m
      const existNameNorm = normalizeName(existing.business_name);
      if (candNameNorm && existNameNorm && candNameNorm === existNameNorm) {
        const dist = calculateDistanceMeters(
          candidate.latitude,
          candidate.longitude,
          existing.latitude,
          existing.longitude
        );
        if (dist === null || dist < 200) {
          matchIndex = i;
          break;
        }
      }
    }

    if (matchIndex >= 0) {
      const existing = mergedList[matchIndex];

      if (existing.source !== candidate.source) {
        (existing as any).is_cross_source = true;
      }

      if (!existing.phone && candidate.phone) existing.phone = candidate.phone;
      if (!existing.website_url && candidate.website_url) {
        existing.website_url = candidate.website_url;
        existing.has_website = true;
      }
      if (!existing.latitude && candidate.latitude) existing.latitude = candidate.latitude;
      if (!existing.longitude && candidate.longitude) existing.longitude = candidate.longitude;
      if (!existing.geoapify_place_id && candidate.geoapify_place_id) existing.geoapify_place_id = candidate.geoapify_place_id;
      if (!existing.osm_id && candidate.osm_id) {
        existing.osm_type = candidate.osm_type;
        existing.osm_id = candidate.osm_id;
      }
      if (!existing.overture_id && candidate.overture_id) existing.overture_id = candidate.overture_id;
    } else {
      mergedList.push({ ...candidate });
    }
  }

  let withWebsiteCount = 0;
  let noWebsiteCount = 0;
  let crossSourceMatchesCount = 0;

  mergedList.forEach((item) => {
    if (item.has_website) withWebsiteCount++;
    else noWebsiteCount++;
    if ((item as any).is_cross_source) crossSourceMatchesCount++;
  });

  return {
    deduplicated: mergedList,
    report: {
      rawCount,
      geoapifyCount,
      googleCount,
      osmCount,
      overtureCount,
      socialXrayCount,
      uniqueCount: mergedList.length,
      relevantCount: mergedList.filter((i) => i.relevance_status === 'RELEVANT').length,
      rejectedCount: mergedList.filter((i) => i.relevance_status === 'REJECTED').length,
      withWebsiteCount,
      noWebsiteCount,
      crossSourceMatchesCount,
    },
  };
}
