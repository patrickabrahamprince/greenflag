export interface ConnectionWithHost {
  id: string;
  test_id: string;
  guest_id: string;
  host_id: string;
  status: string;
  tasks_completed: number;
  current_day: number;
  chat_unlocked: boolean;
  connected: boolean;
  freezes_used: number;
  expires_at: string | null;
  frozen_until: string | null;
  ended_reason: string | null;
  deadline: string | null;
  host: { id: string; name: string; photos: string[] };
}

export interface SubmissionRecord {
  id: string;
  connection_id: string;
  task_id: string;
  day_number: number;
  status: string;
  media_type: string | null;
  media_url: string | null;
  proof_url: string | null;
  proof_text: string | null;
  moderation_status: string;
  deadline: string | null;
  submitted_at: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  auto_approved: boolean;
}

export interface IntentionRecord {
  id: string;
  standard_id: string;
  day_number: number;
  type: string;
  prompt: string;
}

export type ConnectionState =
  | 'pending_submission'
  | 'pending_review'
  | 'missed_deadline'
  | 'ended';
