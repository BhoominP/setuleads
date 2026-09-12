import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeads,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
} from '@/api/leadsApi';
import type { Lead, CreateLeadPayload, LeadStage } from '@/types/lead';

export interface UseLeadsFilters {
  stage?: LeadStage | 'all';
  searchQuery?: string;
  source?: string;
}

export const LOCAL_LEADS_KEY = 'setuleads_leads_fallback';

export function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLeads(items: Lead[]) {
  try {
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save leads to local fallback', e);
  }
}

function mapDtoToLead(dto: any): Lead {
  return {
    id: dto.id,
    business_name: dto.businessName,
    contact_name: dto.contactName || null,
    email: dto.email || null,
    phone: dto.phone || null,
    website_url: dto.websiteUrl || null,
    source: dto.source ? dto.source.toLowerCase() : 'manual',
    source_query: dto.sourceQuery || null,
    location: dto.location || null,
    stage: dto.stage ? (dto.stage.toLowerCase() as LeadStage) : 'new',
    estimated_value: dto.estimatedValue || null,
    website_notes: dto.websiteNotes || null,
    general_notes: dto.generalNotes || null,
    website_score: dto.websiteScore || null,
    created_at: dto.createdAt || new Date().toISOString(),
    updated_at: dto.updatedAt || new Date().toISOString(),
    last_contacted_at: dto.lastContactedAt || null,
    geoapify_place_id: dto.geoapifyPlaceId || null,
    google_place_id: dto.googlePlaceId || null,
    osm_type: dto.osmType || null,
    osm_id: dto.osmId || null,
    overture_id: dto.overtureId || null,
    discovery_area: dto.discoveryArea || null,
  };
}

function mapPayloadToDto(payload: any) {
  return {
    businessName: payload.business_name,
    contactName: payload.contact_name || null,
    email: payload.email || null,
    phone: payload.phone || null,
    websiteUrl: payload.website_url || null,
    source: payload.source ? payload.source.toUpperCase() : 'MANUAL',
    sourceQuery: payload.source_query || null,
    location: payload.location || null,
    stage: payload.stage ? payload.stage.toUpperCase() : 'NEW',
    estimatedValue: payload.estimated_value || null,
    websiteNotes: payload.website_notes || null,
    generalNotes: payload.general_notes || null,
    websiteScore: payload.website_score || null,
    geoapifyPlaceId: payload.geoapify_place_id || null,
    googlePlaceId: payload.google_place_id || null,
    osmType: payload.osm_type || null,
    osmId: payload.osm_id || null,
    overtureId: payload.overture_id || null,
    discoveryArea: payload.discovery_area || null,
  };
}

export function useLeads(filters?: UseLeadsFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async (): Promise<Lead[]> => {
      let apiLeads: Lead[] = [];
      try {
        const params: any = {};
        if (filters?.stage && filters.stage !== 'all') {
          params.stage = filters.stage.toUpperCase();
        }
        if (filters?.source && filters.source !== 'all') {
          params.source = filters.source.toUpperCase();
        }
        if (filters?.searchQuery && filters.searchQuery.trim()) {
          params.search = filters.searchQuery.trim();
        }

        const data: any = await fetchLeads(params);
        if (Array.isArray(data)) {
          apiLeads = data.map(mapDtoToLead);
        }
      } catch (err) {
        console.warn('Spring Boot leads query failed, using local storage fallback', err);
      }

      const localLeads = getLocalLeads();
      const combined = [...apiLeads];

      for (const locItem of localLeads) {
        const isDuplicate = combined.some((s) => s.id === locItem.id || s.business_name?.toLowerCase() === locItem.business_name?.toLowerCase());
        if (!isDuplicate) {
          combined.push(locItem);
        }
      }

      let list = combined;
      if (filters?.stage && filters.stage !== 'all') {
        list = list.filter((l) => l.stage === filters.stage);
      }
      if (filters?.source && filters.source !== 'all') {
        list = list.filter((l) => l.source === filters.source);
      }
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        list = list.filter(
          (l) =>
            l.business_name?.toLowerCase().includes(q) ||
            l.location?.toLowerCase().includes(q) ||
            l.contact_name?.toLowerCase().includes(q)
        );
      }

      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return list;
    },
  });
}

export function useAddLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeadPayload): Promise<Lead> => {
      const dtoReq = mapPayloadToDto(payload);
      try {
        const createdDto: any = await createLead(dtoReq);
        const createdLead = mapDtoToLead(createdDto);
        return createdLead;
      } catch (err) {
        console.warn('Spring Boot createLead failed, storing locally', err);
        const fallbackLead: Lead = {
          id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          business_name: payload.business_name,
          contact_name: payload.contact_name || null,
          email: payload.email || null,
          phone: payload.phone || null,
          website_url: payload.website_url || null,
          source: payload.source || 'manual',
          source_query: payload.source_query || null,
          location: payload.location || null,
          stage: payload.stage || 'new',
          estimated_value: payload.estimated_value || null,
          website_notes: payload.website_notes || null,
          general_notes: payload.general_notes || null,
          website_score: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_contacted_at: null,
          geoapify_place_id: payload.geoapify_place_id || null,
          google_place_id: payload.google_place_id || null,
          osm_type: payload.osm_type || null,
          osm_id: payload.osm_id || null,
          overture_id: payload.overture_id || null,
          discovery_area: payload.discovery_area || null,
        };
        const current = getLocalLeads();
        saveLocalLeads([fallbackLead, ...current]);
        return fallbackLead;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }): Promise<Lead> => {
      const dtoReq = mapPayloadToDto(updates);
      try {
        const updatedDto: any = await updateLead(id, dtoReq);
        return mapDtoToLead(updatedDto);
      } catch (err) {
        console.warn('Spring Boot updateLead failed', err);
        const current = getLocalLeads();
        const updated = current.map((l) => (l.id === id ? { ...l, ...updates } : l));
        saveLocalLeads(updated);
        return updated.find((l) => l.id === id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newStage }: { id: string; newStage: LeadStage }) => {
      try {
        const updatedDto: any = await updateLeadStage(id, newStage.toUpperCase());
        return mapDtoToLead(updatedDto);
      } catch (err) {
        console.warn('Spring Boot updateLeadStage failed', err);
        const current = getLocalLeads();
        const updated = current.map((l) =>
          l.id === id
            ? {
                ...l,
                stage: newStage,
                last_contacted_at: newStage !== 'new' ? new Date().toISOString() : l.last_contacted_at,
              }
            : l
        );
        saveLocalLeads(updated);
        return updated.find((l) => l.id === id)!;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteLead(id);
      } catch (err) {
        console.warn('Spring Boot deleteLead failed', err);
      }
      const current = getLocalLeads();
      saveLocalLeads(current.filter((l) => l.id !== id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
