import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Submission {
  id: string;
  connection_id: string;
  day_number: number;
  status: string;
  moderation_status: string;
  deadline: string;
  auto_approved: boolean;
}

interface Connection {
  id: string;
  guest_id: string;
  host_id: string;
  status: string;
  current_day: number;
  connected: boolean;
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

    // Safety-net: auto-approve stale pending submissions and advance days via RPC.
    // Core progression now runs through submit-task → advance_day_if_complete.
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, connection_id, day_number, task_number, approved, moderation_status, deadline')
      .eq('approved', false)
      .eq('moderation_status', 'approved')
      .lt('deadline', new Date().toISOString());

    if (fetchError) {
      console.error('Fetch submissions error:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!submissions || submissions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;

    for (const sub of submissions) {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          approved: true,
          auto_approved: true,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error(`Failed to auto-approve submission ${sub.id}:`, updateError);
        continue;
      }

      // Let the RPC decide if the day is complete
      await supabase.rpc('advance_day_if_complete', {
        p_connection_id: sub.connection_id,
      });

      await supabase.from('audit_logs').insert({
        admin_id: '00000000-0000-0000-0000-000000000000',
        action: 'auto_approve_submission',
        target_type: 'submission',
        target_id: sub.id,
        metadata: {
          connection_id: sub.connection_id,
          day_number: sub.day_number,
        },
      } satisfies AuditLog);

      processed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('auto-approve error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
