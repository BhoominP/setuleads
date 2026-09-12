export type ActivityType =
  | 'note'
  | 'email_sent'
  | 'call'
  | 'follow_up'
  | 'meeting'
  | 'stage_change';

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  content: string;
  created_at: string;
}

export interface CreateActivityPayload {
  lead_id: string;
  type: ActivityType;
  content: string;
}
