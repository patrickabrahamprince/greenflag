'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Edit3, Coins, Loader2, BadgeCheck, MapPin, Cake } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    <div className="min-h-screen screen-gradient text-slate-900 pb-48 max-w-app mx-auto px-6 pt-safe-top">
      {/* Settings Header */}
      <div className="flex items-center justify-end py-2">
        <button 
          onClick={() => { hapticTap(); router.push('/settings'); }} 
          aria-label="Settings" 
          className="p-2 text-slate-700 hover:text-slate-900 active:opacity-60 transition-opacity"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-[3/4] mb-5 rounded-photo overflow-hidden shadow-lg border border-slate-200/80">
        <ProfileImageCarousel images={user.photos ?? []} disableLightbox />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        {user.phone_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 border border-emerald/30 backdrop-blur-md rounded-full pl-2 pr-3 py-1 shadow-glow-emerald">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald" />
            <span className="text-[10px] font-bold text-white tracking-wider uppercase">Verified</span>
          </div>
        )}
        <button
          onClick={() => { hapticTap(); router.push('/profile/edit'); }}
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:border-emerald"
        >
          <Edit3 className="w-4 h-4 text-emerald" />
        </button>
      </div>

      <div className="flex flex-col items-center pb-6">
        <h2 className="text-2xl font-display font-bold text-ink tracking-tight">{user.name}</h2>

        <div className="flex items-center gap-2 mt-2.5">
          {!!user.age && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-ink/80 bg-slate-100 border border-slate-200/80">
              <Cake className="w-3.5 h-3.5 text-emerald" />
              {user.age}
            </span>
          )}
          {!!user.city && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-ink/80 bg-slate-100 border border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-emerald" />
              {user.city}
            </span>
          )}
        </div>

        <ProfileCompletion user={user} />

        {user.bio && (
          <div className="mt-2 w-full card p-5 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald mb-1.5">About</p>
            <p className="text-ink/80 text-sm leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}

        {!!user.interests_have?.length && (
          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase font-bold tracking-widest text-ink/50 mb-2.5 text-center">Interests</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {user.interests_have.map((tag) => (
                <button
                  key={tag}
                  onClick={hapticTap}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 active:scale-95 transition-transform"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {user.teaser_prompt && user.teaser_answer && (
        <div
          className="mb-6 card border-emerald-200 p-5 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-white"
        >
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 mb-1.5">{user.teaser_prompt}</p>
          <p className="font-display font-bold text-lg text-ink leading-snug">{user.teaser_answer}</p>
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

      {/* Travel Hub Card */}
      <div className="mt-5 p-5 card border-emerald-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-emerald-50 via-white to-white">
        <div>
          <h3 className="font-display text-sm font-bold text-ink flex items-center gap-1.5">
            <span>✈️</span>
            <span>GreenFlag Trips</span>
          </h3>
          <p className="text-xs text-ink/60 mt-1 max-w-[200px] leading-relaxed">
            Plan weekend getaways, host trips, and meet new people.
          </p>
        </div>
        <button
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="px-4 py-2 rounded-full bg-emerald hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 shadow-sm"
        >
          View Trips
        </button>
      </div>

      {/* Coin Balance Card */}
      <div className="mt-5">
        <div className="card border-amber-200 p-5 flex items-center justify-between shadow-sm bg-gradient-to-br from-amber-50 via-white to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink leading-none">{balance.toLocaleString()}</p>
              <p className="text-xs text-ink/50 mt-1">Available Coins</p>
            </div>
          </div>
          <button onClick={() => { hapticTap(); router.push('/coins'); }} className="btn-primary !min-h-[38px] text-xs px-5 shrink-0 font-bold">
            Get Coins
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={() => { hapticTap(); setShowLogoutConfirm(true); }}
          disabled={loggingOut}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="dialog-card max-w-sm w-full text-center">
            <LogOut className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-ink mb-2">Sign out?</h3>
            <p className="text-sm text-ink/60 mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to access your matches and messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="btn-danger flex-1 text-sm flex items-center justify-center gap-2"
              >
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
