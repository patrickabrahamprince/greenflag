export interface ConnectionWithHost {
  id: string;
  standard_id: string | null;
  guest_id: string;
  host_id: string;
  status: string;
  current_day: number | null;
  chat_unlocked: boolean | null;
  connected: boolean | null;
  freezes_used: number | null;
  expires_at: string | null;
  frozen_until: string | null;
  ended_reason: string | null;
  deadline: string | null;
  host: { id: string; name: string; photos: string[] };
}

export interface SubmissionRecord {
  id: string;
  connection_id: string;
  day_number: number;
  day: number;
  approved: boolean | null;
  media_type: string | null;
  media_url: string | null;
  content: string | null;
  moderation_status: string | null;
  deadline: string | null;
  submitted_at: string | null;
  auto_approved: boolean | null;
  prompt?: string | null;
  task_number?: number;
}

export interface IntentionRecord {
  id: string;
  standard_id: string | null;
  day_number: number;
  task_number?: number;
  type: string;
  prompt: string;
}

export type ConnectionState =
  | 'pending_submission'
  | 'pending_review'
  | 'missed_deadline'
  | 'ended';
