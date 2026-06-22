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

    // Find submissions eligible for auto-approval:
    //   status = 'pending' (pending_review), moderation approved, deadline passed
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, connection_id, day_number, status, moderation_status, deadline, auto_approved')
      .eq('status', 'pending')
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
      // Fetch the associated connection
      const { data: connection, error: connError } = await supabase
        .from('connections')
        .select('id, guest_id, host_id, status, current_day, connected')
        .eq('id', sub.connection_id)
        .single();

      if (connError || !connection) {
        console.error(`Connection not found for submission ${sub.id}:`, connError);
        continue;
      }

      // Only auto-approve if connection is active and not yet fully connected
      if (connection.connected) {
        continue;
      }

      // 1. Update submission status to approved
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'approved',
          auto_approved: true,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error(`Failed to auto-approve submission ${sub.id}:`, updateError);
        continue;
      }

      // 2. Increment connection's current_day
      const newDay = connection.current_day + 1;
      const { error: dayError } = await supabase
        .from('connections')
        .update({ current_day: newDay })
        .eq('id', connection.id);

      if (dayError) {
        console.error(`Failed to update current_day for connection ${connection.id}:`, dayError);
        continue;
      }

      // 3. Day 6: Unlock chat
      if (newDay === 6) {
        await supabase
          .from('connections')
          .update({ chat_unlocked: true })
          .eq('id', connection.id);

        await sendNotification(
          supabase,
          connection.guest_id,
          'Chat Unlocked!',
          `You can now chat with your match.`
        );
      }

      // 4. Day 9: Mark as fully connected
      if (newDay === 9) {
        const now = new Date().toISOString();

        await supabase
          .from('connections')
          .update({
            connected: true,
            connected_at: now,
          })
          .eq('id', connection.id);

        // Increment connected_count on both profiles
        const { data: guestProfile } = await supabase
          .from('profiles')
          .select('connected_count')
          .eq('id', connection.guest_id)
          .single();

        const { data: hostProfile } = await supabase
          .from('profiles')
          .select('connected_count')
          .eq('id', connection.host_id)
          .single();

        if (guestProfile) {
          await supabase
            .from('profiles')
            .update({ connected_count: (guestProfile.connected_count ?? 0) + 1 })
            .eq('id', connection.guest_id);
        }

        if (hostProfile) {
          await supabase
            .from('profiles')
            .update({ connected_count: (hostProfile.connected_count ?? 0) + 1 })
            .eq('id', connection.host_id);
        }

        await sendNotification(
          supabase,
          connection.guest_id,
          'You\'re Connected!',
          'Congratulations! You are now fully connected.'
        );

        await sendNotification(
          supabase,
          connection.host_id,
          'You\'re Connected!',
          'Congratulations! You are now fully connected.'
        );
      }

      // 5. Create next submission record (if not day 8)
      if (sub.day_number < 8) {
        const nextDayNumber = sub.day_number + 1;
        const nextDeadline = new Date();
        nextDeadline.setHours(nextDeadline.getHours() + 48);

        const { error: nextSubError } = await supabase
          .from('submissions')
          .insert({
            connection_id: connection.id,
            day_number: nextDayNumber,
            status: 'pending',
            moderation_status: 'approved',
            deadline: nextDeadline.toISOString(),
          });

        if (nextSubError) {
          console.error(`Failed to create next submission for connection ${connection.id}:`, nextSubError);
        }
      }

      // 6. Push notification to man
      await sendNotification(
        supabase,
        connection.guest_id,
        `Day ${sub.day_number} Auto-Approved`,
        `Day ${newDay} is now unlocked.`
      );

      // 7. Log to audit_logs
      await supabase.from('audit_logs').insert({
        admin_id: '00000000-0000-0000-0000-000000000000',
        action: 'auto_approve_submission',
        target_type: 'submission',
        target_id: sub.id,
        metadata: {
          connection_id: connection.id,
          day_number: sub.day_number,
          new_day: newDay,
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
