'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { PushNotificationRegistrar } from './push-notification-registrar';
import { useScreenshotGuard } from '@/lib/hooks/useScreenshotGuard';
import { useNativePush } from '@/lib/hooks/useNativePush';

export function Providers({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);

  // No-ops on web (no browser API can detect a screenshot); reacts on the
  // native iOS build. See lib/hooks/useScreenshotGuard.ts.
  useScreenshotGuard();

  // PushNotificationRegistrar below is Web Push (VAPID) -- it already
  // no-ops harmlessly inside the iOS WKWebView (no Notification/
  // serviceWorker/pushManager support there). This is the native-only
  // complement, registering for real APNs push instead.
  useNativePush(user?.id);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data as any);
          });
        supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setBalance(data.balance);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearUser();
          setBalance(0);
        } else if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setUser(data as any);
            });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <PushNotificationRegistrar />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: 'linear-gradient(135deg, rgba(28,28,30,0.98) 0%, rgba(15,15,17,0.98) 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '4px solid #C026D3',
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '13.5px',
            fontWeight: 500,
            boxShadow: '0 12px 32px -8px rgba(0,0,0,0.55)',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#111111' },
            style: { borderLeft: '4px solid #22C55E' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#111111' },
            style: { borderLeft: '4px solid #EF4444' },
          },
        }}
      />
    </>
  );
}
