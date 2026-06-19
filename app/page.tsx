'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'host' ? '/profile' : '/discover');
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        router.replace('/login');
        return;
      }
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile) {
            setUser(profile as any);
          } else {
            router.replace('/onboard');
          }
        });
    });
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
