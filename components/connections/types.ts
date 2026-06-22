export type ConnectionStatus =
  | 'pending_submission'
  | 'pending_review'
  | 'active'
  | 'connected'
  | 'ended';

export interface ConnectionRow {
  id: string;
  status: string;
  tasks_completed: number;
  current_day: number;
  chat_unlocked: boolean;
  connected: boolean;
  host_id: string;
  guest_id: string;
  expires_at: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  photos: string[];
}

export interface SubmissionRow {
  id: string;
  connection_id: string;
  day_number: number;
  status: string;
  deadline: string | null;
}

export interface StandardRow {
  id: string;
  woman_id: string;
  is_active: boolean;
  created_at: string;
}

export interface IntentionRow {
  id: string;
  standard_id: string;
  day_number: number;
}

export function mapStatus(raw: string, hasPendingReview: boolean): ConnectionStatus {
  if (hasPendingReview) return 'pending_review';
  if (raw === 'active' || raw === 'pending') return 'active';
  if (raw === 'tasks_submitted') return 'pending_submission';
  if (raw === 'chat_unlocked' || raw === 'completed') return 'connected';
  return 'ended';
}
