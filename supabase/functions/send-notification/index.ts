import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, title, body: notifBody, data } = await req.json();

    if (!user_id || !title || !notifBody) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Insert in-app notification
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        body: notifBody,
        data: data || {},
      });

    if (insertError) {
      console.error('Insert notification error:', insertError);
    }

    // 2. Look up push token and send push notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', user_id)
      .single();

    if (profile?.push_token) {
      const pushToken = profile.push_token;

      // Expo Push Token (starts with ExponentPushToken)
      if (pushToken.startsWith('ExponentPushToken') || pushToken.startsWith('ExpoPushToken')) {
        try {
          const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: pushToken,
              title,
              body: notifBody,
              data: data || {},
              sound: 'default',
              badge: 1,
            }),
          });

          const expoResult = await expoResponse.json();

          // Update delivered_at on success
          if (expoResponse.ok && expoResult.data?.[0]?.status === 'ok') {
            await supabase
              .from('notifications')
              .update({ delivered_at: new Date().toISOString() })
              .eq('user_id', user_id)
              .is('delivered_at', null)
              .order('created_at', { ascending: false })
              .limit(1);
          } else {
            console.error('Expo push failed:', expoResult);
          }
        } catch (pushError) {
          console.error('Expo push send error:', pushError);
        }
      }
      // Web push (JSON subscription with endpoint) — extensible with VAPID keys
      else if (pushToken.startsWith('{')) {
        // Web push requires VAPID keys — placeholder for future implementation
        console.error('Web push not yet implemented');
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('send-notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
