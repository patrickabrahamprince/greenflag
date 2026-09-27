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
    <div className="min-h-screen bg-[#FAF9F6] text-[#382A21] pb-48 max-w-app mx-auto px-6 pt-safe-top">
      {/* Settings Header */}
      <div className="flex items-center justify-end py-2">
        <button 
          onClick={() => { hapticTap(); router.push('/settings'); }} 
          aria-label="Settings" 
          className="p-2 text-[#382A21]/70 hover:text-[#382A21] active:opacity-60 transition-opacity"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-[3/4] mb-5 rounded-[32px] overflow-hidden shadow-[0_12px_32px_rgba(45,36,30,0.1)] border border-stone-200/80">
        <ProfileImageCarousel images={user.photos ?? []} disableLightbox />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        {user.phone_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#1D3B2A]/90 border border-[#79A871]/40 backdrop-blur-md rounded-full pl-2 pr-3 py-1 shadow-md">
            <BadgeCheck className="w-3.5 h-3.5 text-[#79A871]" />
            <span className="text-[10px] font-bold text-white tracking-wider uppercase">Verified</span>
          </div>
        )}
        <button
          onClick={() => { hapticTap(); router.push('/profile/edit'); }}
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1D3B2A]/90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg hover:border-[#79A871]"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center pb-6">
        <h2 className="text-2xl font-display font-bold text-[#382A21] tracking-tight">{user.name}</h2>

        <div className="flex items-center gap-2 mt-2.5">
          {!!user.age && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#382A21]/80 bg-stone-200/60 border border-stone-200">
              <Cake className="w-3.5 h-3.5 text-[#1D3B2A]" />
              {user.age}
            </span>
          )}
          {!!user.city && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#382A21]/80 bg-stone-200/60 border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-[#1D3B2A]" />
              {user.city}
            </span>
          )}
        </div>

        <ProfileCompletion user={user} />

        {user.bio && (
          <div className="mt-2 w-full p-5 rounded-[24px] bg-white border border-stone-200/80 shadow-[0_4px_16px_rgba(45,36,30,0.04)]">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#1D3B2A] mb-1.5">About</p>
            <p className="text-[#382A21]/80 text-sm leading-relaxed font-light">
              {user.bio}
            </p>
          </div>
        )}

        {!!user.interests_have?.length && (
          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#382A21]/50 mb-2.5 text-center">Interests & Vibe</p>
            <div className="flex flex-wrap justify-center gap-2">
              {user.interests_have.map((tag: string, i: number) => {
                const tagColors = [
                  'bg-orange-100 text-orange-950 border-orange-200',
                  'bg-purple-100 text-purple-950 border-purple-200',
                  'bg-emerald-100 text-emerald-950 border-emerald-200',
                  'bg-amber-100 text-amber-950 border-amber-200',
                  'bg-cyan-100 text-cyan-950 border-cyan-200',
                  'bg-rose-100 text-rose-950 border-rose-200',
                ];
                const colorClass = tagColors[i % tagColors.length];

                return (
                  <button
                    key={tag}
                    onClick={hapticTap}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm active:scale-95 transition-all ${colorClass}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {user.teaser_prompt && user.teaser_answer && (
        <div
          className="mb-6 p-5 rounded-[28px] border border-stone-200/80 shadow-[0_4px_16px_rgba(45,36,30,0.04)] bg-white"
        >
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#1D3B2A] mb-1.5">{user.teaser_prompt}</p>
          <p className="font-display font-extrabold text-lg text-[#382A21] leading-snug">{user.teaser_answer}</p>
        </div>
      )}

      <div className="space-y-3">
        <button onClick={() => { hapticTap(); router.push('/profile/edit'); }} className="w-full h-13 bg-[#1D3B2A] hover:bg-[#2D5A3F] active:scale-95 text-white font-extrabold rounded-full flex items-center justify-center gap-2 shadow-md transition-all">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>

        <button onClick={() => { hapticTap(); router.push('/settings'); }} className="w-full h-13 bg-white border border-stone-200/80 hover:bg-stone-50 active:scale-95 text-[#382A21] font-extrabold rounded-full flex items-center justify-center gap-2 shadow-sm transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Travel Hub Card - Radiant Emerald */}
      <div className="mt-5 p-5 rounded-[32px] bg-gradient-to-r from-[#1D3B2A] via-[#2D5A3F] to-[#1D3B2A] text-white shadow-[0_8px_24px_rgba(29,59,42,0.35)] flex items-center justify-between border border-white/20">
        <div>
          <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
            <span>✈️</span>
            <span>GreenFlag Trips & Hangouts</span>
          </h3>
          <p className="text-xs text-white/80 mt-1 max-w-[210px] leading-relaxed font-medium">
            Plan weekend getaways, host hangouts, and meet companions.
          </p>
        </div>
        <button
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="px-4 py-2 rounded-full bg-[#FAF9F6] hover:bg-white text-[#1D3B2A] text-xs font-black transition-all shrink-0 shadow-md active:scale-95"
        >
          View Trips
        </button>
      </div>

      {/* Coin Balance Card - Radiant Sunburst */}
      <div className="mt-5">
        <div className="p-5 rounded-[32px] border border-amber-300 flex items-center justify-between shadow-[0_8px_24px_rgba(245,158,11,0.15)] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center shrink-0 shadow-sm">
              <Coins className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <p className="text-2xl font-display font-black text-stone-950 leading-none">{balance.toLocaleString()}</p>
              <p className="text-xs text-stone-900/80 mt-1 font-bold">Available Coins</p>
            </div>
          </div>
          <button onClick={() => { hapticTap(); router.push('/coins'); }} className="px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs shrink-0 font-black shadow-md transition-all active:scale-95">
            Get Coins
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200">
        <button
          onClick={() => { hapticTap(); setShowLogoutConfirm(true); }}
          disabled={loggingOut}
          className="w-full h-12 bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 text-red-700 font-bold rounded-full flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="dialog-card max-w-sm w-full text-center rounded-[32px] p-6 shadow-2xl bg-white border border-stone-200">
            <LogOut className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-[#382A21] mb-2">Sign out?</h3>
            <p className="text-sm text-[#382A21]/60 mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to access your matches and messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-stone-100 text-[#382A21] font-bold rounded-full text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2"
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
