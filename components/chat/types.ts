export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ConnectionData {
  id: string;
  status: string;
  tasks_completed: number;
  chat_unlocked: boolean;
  connected: boolean;
  current_day: number;
  woman: { id: string; name: string; photos: string[] };
  man: { id: string; name: string; photos: string[] };
}
