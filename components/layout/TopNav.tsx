// /components/layout/TopNav.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function TopNav() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [nameInit, setNameInit] = useState<string>('?');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, photos')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.name) {
          setNameInit(profile.name.charAt(0).toUpperCase());
        }
        if (profile.photos && profile.photos.length > 0) {
          setPhotoUrl(profile.photos[0]);
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  return (
    <nav className="h-16 px-6 bg-white border-b border-[#E8E6E1] flex items-center justify-between sticky top-0 z-30 max-w-app mx-auto w-full">
      <Link href="/discover" className="font-['Playfair_Display'] text-xl italic font-bold text-[#1A1A1A]">
        GreenFlag
      </Link>

      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full overflow-hidden bg-[#F0EDE9] flex items-center justify-center border border-[#E8E6E1] transition-transform hover:scale-105 active:scale-95"
          aria-label="Profile"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-['Playfair_Display'] text-xs italic font-bold text-[#1A1A1A]/60">
              {nameInit}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
