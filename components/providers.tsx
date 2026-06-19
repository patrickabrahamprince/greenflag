'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';

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
            if (data) setBalance((data as any).balance);
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
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1C1C1E',
            color: '#fff',
            border: '1px solid #2A2A2E',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}
