export type Persona = 'man' | 'woman';
export type Gender = 'man' | 'woman';

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photos: string[] | null;
  persona: string;
  gender?: string | null;
  interests?: string[] | null;
  looking_for_interests?: string[] | null;
  interests_have?: string[] | null;
  interests_looking_for?: string[] | null;
  why_me_prompts?: string[] | null;
  quiz_answers?: Record<string, string> | null;
  teaser_prompt?: string | null;
  teaser_answer?: string | null;
  blur_key?: string | null;
  connected_count?: number | null;
  coins?: number | null;
  onboarding_completed?: boolean | null;
  phone_verified?: boolean | null;
  is_banned?: boolean | null;
  ban_reason?: string | null;
  approval_status?: string | null;
  review_started_at?: string | null;
  push_primer_shown?: boolean | null;
  created_at: string | null;
}

export interface Standard {
  id: string;
  woman_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Intention {
  id: string;
  standard_id: string | null;
  day_number: number;
  task_number?: number;
  type: string;
  prompt: string;
}

export interface Connection {
  id: string;
  standard_id: string | null;
  guest_id: string;
  host_id: string;
  status: string;
  current_day: number | null;
  day_count: number | null;
  expires_at: string;
  created_at: string | null;
  chat_unlocked: boolean | null;
  connected: boolean | null;
}

export interface Submission {
  id: string;
  connection_id: string;
  day_number: number;
  task_number: number | null;
  proof_url: string | null;
  proof_text: string | null;
  status: string | null;
  approved: boolean | null;
  created_at: string | null;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
}

export interface Wallet {
  user_id: string;
  balance: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount_inr: number | null;
  coins: number;
  type: string;
  created_at: string | null;
}

export interface ModQueueItem {
  id: string;
  submission_id: string;
  reported_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
