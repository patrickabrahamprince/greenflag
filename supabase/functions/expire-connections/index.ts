import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiredConnection {
  id: string;
  guest_id: string;
  host_id: string;
  status: string;
}

interface AuditLog {
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
}

async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, body, data });

  if (notifError) {
    console.error('Notification insert error:', notifError);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', userId)
    .single();

  if (profile?.push_token) {
    const pushToken = profile.push_token;
    if (pushToken.startsWith('ExponentPushToken') || pushToken.startsWith('ExpoPushToken')) {
      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: pushToken,
            title,
            body,
            data,
            sound: 'default',
            badge: 1,
          }),
        });
      } catch (pushError) {
        console.error('Push send error:', pushError);
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find connections that are in progress, past expiry, and not yet connected
    const { data: connections, error: fetchError } = await supabase
      .from('connections')
      .select('id, guest_id, host_id, status')
      .eq('status', 'pending')
      .eq('connected', false)
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Fetch connections error:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;

    for (const conn of connections) {
      // Set status to expired
      const { error: updateError } = await supabase
        .from('connections')
        .update({
          status: 'expired',
          ended_reason: 'expired',
        })
        .eq('id', conn.id);

      if (updateError) {
        console.error(`Failed to expire connection ${conn.id}:`, updateError);
        continue;
      }

      // Fetch names for notification
      const { data: guestProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', conn.guest_id)
        .single();

      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', conn.host_id)
        .single();

      const guestName = guestProfile?.name ?? 'Someone';
      const hostName = hostProfile?.name ?? 'Someone';

      // Push to man
      await sendNotification(
        supabase,
        conn.guest_id,
        'Connection Expired',
        `Your connection with ${hostName} has expired.`
      );

      // Push to woman
      await sendNotification(
        supabase,
        conn.host_id,
        'Connection Expired',
        `Connection with ${guestName} has expired.`
      );

      // Log to audit_logs
      await supabase.from('audit_logs').insert({
        admin_id: '00000000-0000-0000-0000-000000000000',
        action: 'expire_connection',
        target_type: 'connection',
        target_id: conn.id,
        metadata: {
          guest_id: conn.guest_id,
          host_id: conn.host_id,
        },
      } satisfies AuditLog);

      processed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('expire-connections error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
