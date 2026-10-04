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
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      {/* 100% Frozen Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md px-6 pt-safe-top pb-3 flex items-center justify-between border-b border-stone-100">
        <h1 className="font-display text-xl font-bold text-stone-900 tracking-tight">Passport & Profile</h1>
        <button 
          onClick={() => { hapticTap(); router.push('/settings'); }} 
          aria-label="Settings" 
          className="p-2 text-stone-600 hover:text-stone-900 active:opacity-60 transition-opacity cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 pb-36">

      <div className="relative w-full aspect-[3/4] mb-5 rounded-[32px] overflow-hidden shadow-sm border border-stone-200">
        <ProfileImageCarousel images={user.photos ?? []} disableLightbox />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        {user.phone_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#1C1C1E]/90 border border-white/20 backdrop-blur-md rounded-full pl-2.5 pr-3 py-1 shadow-md">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-white tracking-wider uppercase">Verified</span>
          </div>
        )}
        <button
          onClick={() => { hapticTap(); router.push('/profile/edit'); }}
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center pb-6">
        <h2 className="text-2xl font-display font-bold text-stone-900 tracking-tight">{user.name}</h2>

        <div className="flex items-center gap-2 mt-2.5">
          {!!user.age && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200">
              <Cake className="w-3.5 h-3.5 text-stone-900" />
              {user.age}
            </span>
          )}
          {!!user.city && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-stone-900" />
              {user.city}
            </span>
          )}
        </div>

        <ProfileCompletion user={user} />

        {user.bio && (
          <div className="mt-4 w-full p-5 rounded-[24px] bg-stone-50 border border-stone-200 shadow-xs">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1.5">About</p>
            <p className="text-stone-800 text-sm leading-relaxed font-normal">
              {user.bio}
            </p>
          </div>
        )}

        {!!user.interests_have?.length && (
          <div className="mt-5 w-full">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2.5 text-center">Interests & Vibe</p>
            <div className="flex flex-wrap justify-center gap-2">
              {user.interests_have.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-stone-200 bg-stone-50 text-stone-800 shadow-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {user.teaser_prompt && user.teaser_answer && (
        <div
          className="mb-6 p-5 rounded-[28px] border border-stone-200 bg-stone-50 shadow-xs"
        >
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-stone-500 mb-1.5">{user.teaser_prompt}</p>
          <p className="font-display font-extrabold text-base text-stone-900 leading-snug">{user.teaser_answer}</p>
        </div>
      )}

      <div className="space-y-3">
        <button onClick={() => { hapticTap(); router.push('/profile/edit'); }} className="w-full h-13 bg-[#1C1C1E] hover:bg-black active:scale-95 text-white font-extrabold rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>

        <button onClick={() => { hapticTap(); router.push('/settings'); }} className="w-full h-13 bg-stone-100 hover:bg-stone-200 border border-stone-200 active:scale-95 text-stone-900 font-extrabold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Travel Hub Card */}
      <div className="mt-5 p-5 rounded-[32px] bg-[#1C1C1E] text-white shadow-md flex items-center justify-between border border-stone-800">
        <div>
          <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-stone-300" />
            <span>GreenFlag Travel Dating & Convoys</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-[210px] leading-relaxed font-medium">
            Plan weekend getaways, host travel dates, and meet singles.
          </p>
        </div>
        <button
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-[#1C1C1E] text-xs font-bold transition-all shrink-0 shadow-md active:scale-95 cursor-pointer"
        >
          View Trips
        </button>
      </div>

      {/* Coin Balance Card */}
      <div className="mt-4">
        <div className="p-5 rounded-[32px] border border-stone-200 flex items-center justify-between shadow-xs bg-stone-50 text-stone-900">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <p className="text-2xl font-display font-black text-stone-900 leading-none">{balance.toLocaleString()}</p>
              <p className="text-xs text-stone-500 mt-1 font-bold">Available Coins</p>
            </div>
          </div>
          <button onClick={() => { hapticTap(); router.push('/coins'); }} className="px-5 py-2.5 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-xs shrink-0 font-bold shadow-md transition-all active:scale-95 cursor-pointer">
            Get Coins
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200">
        <button
          onClick={() => { hapticTap(); setShowLogoutConfirm(true); }}
          disabled={loggingOut}
          className="w-full h-12 bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 text-red-700 font-bold rounded-full flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          Sign Out
        </button>
      </div>
      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="dialog-card max-w-sm w-full text-center rounded-[32px] p-6 shadow-2xl bg-white border border-stone-200">
            <LogOut className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-stone-900 mb-2">Sign out?</h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to access your matches and messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-full text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 cursor-pointer"
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
