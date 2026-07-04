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
  chat_unlocked: boolean;
  connected: boolean;
  current_day: number;
  partner: { id: string; name: string; photos: string[] } | null;
}
