'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { PushNotificationRegistrar } from './push-notification-registrar';
import { PwaRegistrar } from './pwa-registrar';
import { KeyboardInsetListener } from './keyboard-inset-listener';
import { KbDebugOverlay } from './kb-debug-overlay';
import { useScreenshotGuard } from '@/lib/hooks/useScreenshotGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);

  // No-ops on web (no browser API can detect a screenshot); reacts on the
  // native iOS build. See lib/hooks/useScreenshotGuard.ts.
  useScreenshotGuard();

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
      <PwaRegistrar />
      <PushNotificationRegistrar />
      <KeyboardInsetListener />
      <KbDebugOverlay />
      {children}
      <Toaster
        position="bottom-center"
        containerStyle={{
          // Moved off the top edge entirely -- no amount of safe-area
          // offsetting there fully avoided the notch/dynamic-island
          // area across every device and orientation. Bottom is a
          // simpler, more robust anchor: clear of the bottom nav pill
          // (which is itself anchored to safe-area-inset-bottom + 1rem
          // at ~4.5rem tall) and it also folds in --kb-inset, so a toast
          // fired while a keyboard is open moves with it instead of
          // ending up underneath it.
          bottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + 5.5rem + var(--kb-inset, 0px))',
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, rgba(192,38,211,0.22) 0%, rgba(28,28,30,0.98) 40%, rgba(15,15,17,0.98) 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '10px 22px',
            fontSize: '13.5px',
            fontWeight: 500,
            maxWidth: '92vw',
            boxShadow: '0 16px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(192,38,211,0.08)',
          },
          success: { iconTheme: { primary: '#E879F9', secondary: '#111111' } },
          error: { iconTheme: { primary: '#E879F9', secondary: '#111111' } },
        }}
      />
    </>
  );
}
