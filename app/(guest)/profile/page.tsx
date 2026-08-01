'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Edit3, Coins, Loader2, BadgeCheck } from 'lucide-react';
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel';
import { MyStandardsSection } from '@/components/profile/MyStandardsSection';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    hapticTap();
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    setBalance(0);
    router.replace('/login');
  };

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-end mb-2">
        <button onClick={() => { hapticTap(); router.push('/settings'); }} className="btn-ghost p-2">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-[3/4] mb-4 rounded-3xl overflow-hidden">
        <ProfileImageCarousel images={user.photos ?? []} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
        {user.phone_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 animate-fade-in">
            <BadgeCheck className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] font-semibold text-white tracking-wide">Verified</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center pb-6">
        <h2 className="text-2xl font-display text-white">{user.name}</h2>
        <p className="text-muted text-sm mt-1">{user.age} &middot; {user.city}</p>
        {user.bio && (
          <p className={
            user.persona === 'woman'
              ? 'italic text-gray-600 leading-relaxed mt-3 text-center max-w-xs'
              : 'text-muted text-sm mt-3 text-center max-w-xs'
          }>
            {user.bio}
          </p>
        )}
        {!!user.interests_have?.length && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xs">
            {user.interests_have.map((tag) => (
              <button
                key={tag}
                onClick={hapticTap}
                className="px-3 py-1 rounded-full text-[11px] font-medium text-gold bg-gold/10 border border-gold/20 active:scale-90 transition-transform"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 px-4">
        <button onClick={() => { hapticTap(); router.push('/profile/edit'); }} className="btn-primary w-full flex items-center justify-center gap-2">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>

        <button onClick={() => { hapticTap(); router.push('/settings'); }} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {user.persona === 'woman' && <MyStandardsSection userId={user.id} />}

      {user.persona !== 'woman' && (
        <div className="px-4 mt-6">
          <div
            className="rounded-2xl border border-gold/20 p-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(192,38,211,0.16) 0%, rgba(28,28,30,0.9) 60%)' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-display font-semibold text-white leading-none">{balance}</p>
                <p className="text-xs text-muted mt-1">Coins &middot; spend to connect</p>
              </div>
            </div>
            <button onClick={() => { hapticTap(); router.push('/coins'); }} className="btn-primary text-sm py-2.5 px-5 shrink-0">
              Buy
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-8">
        <button onClick={handleLogout} disabled={loggingOut} className="btn-danger w-full flex items-center justify-center gap-2">
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
    </div>
  );
}
