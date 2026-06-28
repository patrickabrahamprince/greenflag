// /types/notifications.ts

export type NotificationType = 'message' | 'match' | 'coin_purchase' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, any>;
  read_at: string | null;
  created_at: string;
}
