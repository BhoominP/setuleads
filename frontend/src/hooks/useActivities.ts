import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActivities, createActivity } from '@/api/activitiesApi';
import type { Activity, CreateActivityPayload } from '@/types/activity';

export function useActivities(leadId: string | null) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: async (): Promise<Activity[]> => {
      if (!leadId) return [];
      try {
        const data: any = await fetchActivities(leadId);
        if (Array.isArray(data)) {
          return data.map((a: any) => ({
            id: a.id,
            lead_id: a.leadId,
            type: a.type ? (a.type.toLowerCase() as any) : 'note',
            content: a.description || '',
            created_at: a.createdAt || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch activities from Spring Boot', err);
      }
      return [];
    },
    enabled: Boolean(leadId),
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateActivityPayload): Promise<Activity> => {
      try {
        const created: any = await createActivity(payload.lead_id, {
          type: payload.type,
          description: payload.content || '',
        });
        return {
          id: created.id,
          lead_id: created.leadId,
          type: created.type ? (created.type.toLowerCase() as any) : 'note',
          content: created.description || payload.content || '',
          created_at: created.createdAt || new Date().toISOString(),
        };
      } catch (err) {
        console.warn('Failed to create activity via Spring Boot', err);
        return {
          id: `act_${Date.now()}`,
          lead_id: payload.lead_id,
          type: payload.type,
          content: payload.content || '',
          created_at: new Date().toISOString(),
        };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
