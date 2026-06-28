'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { PushNotificationRegistrar } from './push-notification-registrar';

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);

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
          style: {
            background: '#FFFFFF',
            color: '#1A1A1A',
            border: '1px solid #E8E6E1',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}
