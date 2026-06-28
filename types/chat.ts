// /types/chat.ts

export interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  content: string | null;
  type?: 'text' | 'audio';
  audio_url?: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface ChatUser {
  id: string;
  name: string | null;
  gender: string | null;
  photos?: string[];
}
