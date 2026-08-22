'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Edit3, Coins, Loader2, BadgeCheck, MapPin, Cake } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel';
import { MyStandardsSection } from '@/components/profile/MyStandardsSection';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile reads entirely from the global stores (populated once by
  // Providers on app load) rather than fetching its own data, so
  // "refresh" here means re-pulling the same two rows Providers fetched
  // and re-populating those stores, not a local reload.
  const refresh = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (profile) setUser(profile as any);
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', authUser.id).single();
    if (wallet) setBalance(wallet.balance);
  };

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(refresh);

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
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-5rem)] screen-gradient flex flex-col">
      {/* Plain icon tap target, not .btn-ghost -- that class is now a
          bordered Lavender pill (correct for text CTAs), which reads
          wrong around a bare gear icon. Matches the round icon-button
          convention the deck uses for profile-screen chrome.
          Fixed above the scroll area (not inside it) so it stays
          reachable regardless of scroll position, matching every other
          tab's header. */}
      <div className="max-w-app mx-auto w-full px-8 pt-safe-top shrink-0">
        <div className="flex items-center justify-end mb-2">
          <button onClick={() => { hapticTap(); router.push('/settings'); }} aria-label="Settings" className="p-2 text-ink active:opacity-60 transition-opacity">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-8 pb-24 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

      <div className="relative w-full aspect-[3/4] mb-5 rounded-photo overflow-hidden shadow-[0_20px_60px_-20px_rgba(69,5,12,0.35)]">
        <ProfileImageCarousel images={user.photos ?? []} disableLightbox />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
        {user.phone_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 animate-fade-in">
            <BadgeCheck className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] font-semibold text-ink tracking-wide">Verified</span>
          </div>
        )}
        <button
          onClick={() => { hapticTap(); router.push('/profile/edit'); }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-raised flex items-center justify-center active:scale-90 transition-transform"
        >
          <Edit3 className="w-4 h-4 text-ink" />
        </button>
      </div>

      <div className="flex flex-col items-center pb-6">
        <h2 className="text-2xl font-display text-ink">{user.name}</h2>

        <div className="flex items-center gap-2 mt-2.5">
          {!!user.age && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-ink/70 bg-raised border border-raised">
              <Cake className="w-3 h-3" />
              {user.age}
            </span>
          )}
          {!!user.city && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-ink/70 bg-raised border border-raised">
              <MapPin className="w-3 h-3" />
              {user.city}
            </span>
          )}
        </div>

        <ProfileCompletion user={user} />

        {user.bio && (
          <div className="mt-5 w-full rounded-card bg-card p-6">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1.5">About</p>
            <p className={
              user.persona === 'woman'
                ? 'italic text-ink/80 leading-relaxed text-sm'
                : 'text-ink/80 text-sm leading-relaxed'
            }>
              {user.bio}
            </p>
          </div>
        )}

        {!!user.interests_have?.length && (
          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-2 text-center">Interests</p>
            <div className="flex flex-wrap justify-center gap-1.5">
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
          </div>
        )}
      </div>

      {/* Hinge-style prompt card -- the teaser Q&A collected during
          onboarding was never actually shown anywhere on the profile
          itself until now. */}
      {user.teaser_prompt && user.teaser_answer && (
        <div
          className="mb-6 rounded-card border border-gold/20 p-6 shadow-[0_12px_32px_-16px_rgba(69,5,12,0.4)]"
          style={{ background: 'linear-gradient(135deg, rgba(210,4,45,0.12) 0%, rgba(15,10,10,0.9) 60%)' }}
        >
          <p className="text-[10px] uppercase tracking-widest text-gold/70 mb-2">{user.teaser_prompt}</p>
          <p className="font-display text-lg text-ink leading-snug">{user.teaser_answer}</p>
        </div>
      )}

      <div className="space-y-3">
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

      <div className="mt-6">
        {/* Closest real analog to the deck's Mindaro subscription card --
            this app's monetization surface is coins, not a subscription
            tier, so the card keeps its real balance/purchase content but
            picks up the same on-palette accent treatment. */}
        <div
          className="rounded-card border border-gold/20 p-5 flex items-center justify-between shadow-[0_12px_32px_-16px_rgba(210,4,45,0.3)]"
          style={{ background: 'linear-gradient(135deg, rgba(210,4,45,0.16) 0%, rgba(15,10,10,0.9) 60%)' }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold text-ink leading-none">{balance}</p>
              <p className="text-xs text-muted mt-1">
                {user.persona === 'woman' ? 'Coins · for nudges & reveals' : 'Coins · spend to connect'}
              </p>
            </div>
          </div>
          <button onClick={() => { hapticTap(); router.push('/coins'); }} className="btn-primary !min-h-[36px] text-xs px-4 shrink-0">
            Buy
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-raised/50">
        <button onClick={handleLogout} disabled={loggingOut} className="btn-danger w-full flex items-center justify-center gap-2">
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
      </div>
    </div>
  );
}
