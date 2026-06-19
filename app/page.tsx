'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (user) {
      if (user.role === 'host') {
        router.replace('/profile');
      } else {
        router.replace('/discover');
      }
    } else {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        if (authUser) return;
        router.replace('/login');
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
