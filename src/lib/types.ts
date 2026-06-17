export type UserRole = "man" | "woman";
export type Difficulty = "easy" | "medium" | "hard";
export type TrialStatus = "pending" | "active" | "completed" | "failed" | "withdrawn";
export type TaskStatus = "locked" | "pending" | "submitted" | "approved" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  age: number;
  city: string;
  bio: string;
  photos: string[];
  phone?: string;
  instagram_url?: string;
  tastes?: string;
  about_me_tags?: string[];
  looking_for_tags?: string[];
  created_at: string;
}

export interface Test {
  id: string;
  host_id: string;
  name: string;
  difficulty: Difficulty;
  is_active: boolean;
  is_paused: boolean;
  created_at: string;
  host?: Profile;
}

export interface Task {
  id: string;
  test_id: string;
  day_number: number;
  description: string;
}

export interface Connection {
  id: string;
  guest_id: string;
  host_id: string;
  test_id: string;
  status: TrialStatus;
  current_day: number;
  tasks_completed: number;
  started_at: string;
  expires_at: string;
  streak_frozen: boolean;
  guest?: Profile;
  host?: Profile;
  test?: Test;
}

export interface Submission {
  id: string;
  connection_id: string;
  task_id: string;
  day_number: number;
  status: TaskStatus;
  proof_url: string | null;
  proof_text: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  message_type?: "text" | "image";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  connection_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}
