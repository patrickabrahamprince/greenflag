export type Role = 'guest' | 'host';

export interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  photos: string[];
  role: Role;
  created_at: string;
}

export interface Standard {
  id: string;
  host_id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
}

export interface Intention {
  id: string;
  standard_id: string;
  day: number;
  description: string;
  type: 'photo' | 'voice' | 'text' | 'location';
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
