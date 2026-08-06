import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Find all active women who are not banned
    const { data: women, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('persona', 'woman')
      .eq('is_banned', false);

    if (fetchError) {
      console.error('Fetch women error:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!women || women.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;

    for (const woman of women) {
      // Add 100 bonus coins via RPC
      const { error: rpcError } = await supabase.rpc('add_coins', {
        p_user_id: woman.id,
        p_amount: 100,
        p_description: 'Monthly bonus',
        p_metadata: { type: 'bonus' },
      });

      if (rpcError) {
        console.error(`Failed to add coins for user ${woman.id}:`, rpcError);
        continue;
      }

      // Also log to coin_transactions for consistency
      const { error: txError } = await supabase.from('coin_transactions').insert({
        user_id: woman.id,
        amount: 100,
        type: 'bonus',
        description: 'Monthly bonus',
      });

      if (txError) {
        console.error(`Failed to insert coin transaction for user ${woman.id}:`, txError);
      }

      // Send push notification
      await sendNotification(
        supabase,
        woman.id,
        'Monthly Bonus!',
        'Your monthly 100 coins have been credited.',
        { type: 'bonus' }
      );

      // Log to audit_logs
      await supabase.from('audit_logs').insert({
        admin_id: '00000000-0000-0000-0000-000000000000',
        action: 'monthly_bonus',
        target_type: 'profile',
        target_id: woman.id,
        metadata: { amount: 100 },
      } satisfies AuditLog);

      processed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('monthly-bonus error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
