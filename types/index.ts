export type Persona = 'man' | 'woman';
export type Gender = 'man' | 'woman';

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photos: string[];
  persona: string;
  gender?: string | null;
  interests?: string[];
  looking_for_interests?: string[];
  interests_have?: string[];
  interests_looking_for?: string[];
  why_me_prompts?: string[];
  blur_key?: string;
  connected_count?: number;
  coins?: number | null;
  onboarding_completed?: boolean | null;
  is_banned?: boolean | null;
  ban_reason?: string | null;
  created_at: string;
}

export interface Standard {
  id: string;
  woman_id: string;
  is_active: boolean | null;
  created_at: string;
}

export interface Intention {
  id: string;
  standard_id: string;
  day_number: number;
  type: 'photo' | 'voice' | 'text';
  prompt: string;
}

export interface Connection {
  id: string;
  test_id: string;
  guest_id: string;
  host_id: string;
  status: 'pending' | 'active' | 'chat_unlocked' | 'completed' | 'expired' | 'rejected';
  tasks_completed: number;
  expires_at: string;
  created_at: string;
}

export interface Submission {
  id: string;
  connection_id: string;
  intention_id: number;
  proof_url: string;
  proof_text?: string;
  status: 'submitted' | 'approved' | 'rejected';
  review_note?: string;
  created_at: string;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  balance: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export interface ModQueueItem {
  id: string;
  submission_id: string;
  reported_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
