import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any, any, any>;

interface NotificationPayload {
  supabase: AnySupabaseClient;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function triggerWebPush(userId: string, title: string, body: string, url?: string): Promise<void> {
  try {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\\n/g, '').trim();
    if (!supabaseUrl || !serviceRoleKey) return;

    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ userId, title, body, url }),
    });
  } catch (err) {
    console.error('Web push trigger failed:', err);
  }
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

    const url = (payload.data?.connectionId as string)
      ? `/messages/${payload.data?.connectionId}`
      : undefined;
    await triggerWebPush(payload.user_id, payload.title, payload.body, url);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export async function notifyHostOfSubmission(
  supabase: AnySupabaseClient,
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
  supabase: AnySupabaseClient,
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
  supabase: AnySupabaseClient,
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

export async function notifyNewMessage(
  supabase: AnySupabaseClient,
  recipientId: string,
  senderName: string,
  connectionId: string,
  preview: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: recipientId,
    title: senderName,
    body: preview.length > 100 ? preview.slice(0, 100) + '...' : preview,
    data: { connectionId, type: 'new_message' },
  });
}

export async function notifyWomanOfStandardBegin(
  supabase: AnySupabaseClient,
  womanId: string,
  manName: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: womanId,
    title: 'New connection',
    body: `${manName} pledged 500 coins to begin your Standard`,
    data: { connectionId, type: 'standard_begin' },
  });
}

export async function notifyManOfDayApproval(
  supabase: AnySupabaseClient,
  manId: string,
  dayNumber: number,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Day approved',
    body: `Day ${dayNumber} approved. Day ${dayNumber + 1} unlocked. Submit in 24h.`,
    data: { connectionId, dayNumber, type: 'day_approved' },
  });
}

export async function notifyManOfDay5(
  supabase: AnySupabaseClient,
  manId: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Access earned!',
    body: "Day 5 approved. You've earned access. Message her.",
    data: { connectionId, type: 'day5_approved' },
  });
}

export async function notifyBothOfCompletion(
  supabase: AnySupabaseClient,
  manId: string,
  womanId: string,
  connectionId: string
): Promise<void> {
  const payload = {
    title: "You're Connected!",
    body: "8/8 Complete. You're Connected.",
    data: { connectionId, type: 'completed' },
  };
  await sendNotification({ supabase, user_id: manId, ...payload });
  await sendNotification({ supabase, user_id: womanId, ...payload });
}

export async function notifyManOfRejection(
  supabase: AnySupabaseClient,
  manId: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Connection ended',
    body: 'Connection ended. She chose not to continue.',
    data: { connectionId, type: 'rejected' },
  });
}

export async function notifyWomanOfMediaReady(
  supabase: AnySupabaseClient,
  womanId: string,
  manName: string,
  dayNumber: number,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: womanId,
    title: 'Submission ready',
    body: `${manName}'s Day ${dayNumber} submission is ready to review`,
    data: { connectionId, dayNumber, type: 'media_approved' },
  });
}

export async function notifyUserOfBan(
  supabase: AnySupabaseClient,
  userId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: userId,
    title: 'Account suspended',
    body: 'Your account has been suspended.',
    data: { type: 'account_banned' },
  });
}

export async function notifyUserOfApplicationRejection(
  supabase: AnySupabaseClient,
  userId: string,
  reason: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: userId,
    title: "Your application wasn't approved",
    body: reason,
    data: { type: 'application_rejected' },
  });
}

export async function notifyBothOfMediaRejection(
  supabase: AnySupabaseClient,
  manId: string,
  womanId: string,
  connectionId: string
): Promise<void> {
  const payload = {
    title: 'Submission rejected',
    body: 'Submission rejected by moderation.',
    data: { connectionId, type: 'media_rejected' },
  };
  await sendNotification({ supabase, user_id: manId, ...payload });
  await sendNotification({ supabase, user_id: womanId, ...payload });
}
