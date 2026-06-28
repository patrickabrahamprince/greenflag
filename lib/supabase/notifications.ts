// /lib/supabase/notifications.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Notification, NotificationType } from '@/types/notifications';

export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Notification[]) || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
  return count || 0;
}

export async function markAsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', notificationIds);

  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string | null = null,
  link: string | null = null,
  metadata: Record<string, any> = {}
): Promise<string> {
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_body: body,
    p_link: link,
    p_metadata: metadata,
  });

  if (error) throw error;
  return data as string;
}
