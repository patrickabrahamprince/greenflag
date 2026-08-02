import type { SupabaseClient } from '@supabase/supabase-js';
import http2 from 'http2';
import { SignJWT, importPKCS8 } from 'jose';

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

// Cached across invocations within the same warm serverless instance --
// signing a fresh ES256 JWT per notification is wasted work since Apple
// accepts the same token for up to an hour.
let cachedApnsJwt: { token: string; expiresAt: number } | null = null;

async function getApnsJwt(keyId: string, teamId: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedApnsJwt && cachedApnsJwt.expiresAt > now + 60) {
    return cachedApnsJwt.token;
  }
  const key = await importPKCS8(privateKeyPem, 'ES256');
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .sign(key);
  cachedApnsJwt = { token, expiresAt: now + 60 * 50 };
  return token;
}

// No-ops entirely until APNS_KEY_ID/APNS_TEAM_ID/APNS_PRIVATE_KEY/
// APNS_BUNDLE_ID are set (all four only exist once there's an Apple
// Developer account to generate the .p8 auth key from) -- device tokens
// are still captured and stored via useNativePush + /api/push/register-
// device in the meantime, so nothing needs to be recaptured once this
// activates. Uses Apple's modern token-based provider API over HTTP/2
// (required -- APNs doesn't support HTTP/1.1) rather than the older
// certificate-based approach, so there's no cert to renew yearly.
async function triggerApplePush(
  supabase: AnySupabaseClient,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKeyPem = process.env.APNS_PRIVATE_KEY;
  const bundleId = process.env.APNS_BUNDLE_ID || 'com.greenflagapp.app';
  if (!keyId || !teamId || !privateKeyPem) return;

  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('platform', 'ios');
  if (!tokens || tokens.length === 0) return;

  const jwt = await getApnsJwt(keyId, teamId, privateKeyPem.replace(/\\n/g, '\n'));
  const host = process.env.APNS_ENVIRONMENT === 'sandbox'
    ? 'api.sandbox.push.apple.com'
    : 'api.push.apple.com';

  await Promise.all(
    (tokens as { token: string }[]).map(({ token: deviceToken }) => new Promise<void>((resolve) => {
      const client = http2.connect(`https://${host}`);
      client.on('error', (err) => {
        console.error('APNs connection error:', err);
        resolve();
      });

      const payload = JSON.stringify({
        aps: { alert: { title, body }, sound: 'default' },
        ...data,
      });

      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        authorization: `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
      });
      req.setEncoding('utf8');
      let responseBody = '';
      req.on('data', (chunk) => { responseBody += chunk; });
      req.on('response', (headers) => {
        const status = headers[':status'];
        if (status !== 200) console.error('APNs push failed:', status, responseBody);
      });
      req.on('end', () => { client.close(); resolve(); });
      req.on('error', (err) => { console.error('APNs request error:', err); client.close(); resolve(); });
      req.write(payload);
      req.end();
    }))
  );
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
    await Promise.all([
      triggerWebPush(payload.user_id, payload.title, payload.body, url),
      triggerApplePush(payload.supabase, payload.user_id, payload.title, payload.body, payload.data),
    ]);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
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
    title: 'New Connection',
    body: `${manName} spent 500 coins to begin your Standard`,
    data: { connectionId, type: 'standard_begin' },
  });
}

export async function notifyManOfDayApproval(
  supabase: AnySupabaseClient,
  manId: string,
  womanName: string,
  dayNumber: number,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Day Approved',
    body: `${womanName} approved Day ${dayNumber}. Day ${dayNumber + 1} unlocks in 24 hours — you'll have 48 hours to submit once it does.`,
    data: { connectionId, dayNumber, type: 'day_approved' },
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
    body: 'All three days complete. Your conversation is now open.',
    data: { connectionId, type: 'completed' },
  };
  await sendNotification({ supabase, user_id: manId, ...payload });
  await sendNotification({ supabase, user_id: womanId, ...payload });
}

export async function notifyManOfRejection(
  supabase: AnySupabaseClient,
  manId: string,
  connectionId: string,
  reason?: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Connection Ended',
    body: reason ? `She chose not to continue: "${reason}"` : 'Connection ended. She chose not to continue.',
    data: { connectionId, type: 'rejected' },
  });
}

export async function notifyManOfRetryUnlocked(
  supabase: AnySupabaseClient,
  manId: string,
  connectionId: string
): Promise<void> {
  await sendNotification({
    supabase,
    user_id: manId,
    title: 'Another Chance',
    body: "She's open to giving you another chance. Retry when you're ready.",
    data: { connectionId, type: 'retry_unlocked' },
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
    title: 'Submission Ready',
    body: `${manName}'s Day ${dayNumber} submission is ready — review within 24 hours or the connection ends.`,
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
    title: 'Account Suspended',
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
    title: 'Not Approved This Time',
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
    title: 'Submission Rejected',
    body: 'Submission rejected by moderation.',
    data: { connectionId, type: 'media_rejected' },
  };
  await sendNotification({ supabase, user_id: manId, ...payload });
  await sendNotification({ supabase, user_id: womanId, ...payload });
}
