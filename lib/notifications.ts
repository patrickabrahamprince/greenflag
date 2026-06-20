import type { SupabaseClient } from '@supabase/supabase-js';

interface NotificationPayload {
  supabase: SupabaseClient;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    const { error } = await payload.supabase.from('notifications').insert({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    });
    if (error) console.error('Notification insert error:', error);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export async function notifyHostOfSubmission(
  supabase: SupabaseClient,
  hostId: string,
  guestName: string,
  taskNumber: number,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: hostId,
    title: 'New submission',
    body: `${guestName} submitted task ${taskNumber}/8`,
    data: { connectionId, taskNumber, type: 'submission' },
  });
}

export async function notifyGuestOfApproval(
  supabase: SupabaseClient,
  guestId: string,
  hostName: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: guestId,
    title: 'Chat unlocked!',
    body: `${hostName} approved your application. You can now chat!`,
    data: { connectionId, type: 'chat_unlocked' },
  });
}

export async function notifyGuestOfRejection(
  supabase: SupabaseClient,
  guestId: string,
  hostName: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: guestId,
    title: 'Application rejected',
    body: `${hostName} passed. Your 5 coins have been refunded.`,
    data: { connectionId, type: 'rejected' },
  });
}
