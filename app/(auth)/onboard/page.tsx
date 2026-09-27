'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Crown, Compass, Loader2 } from 'lucide-react';
import { useOnboardingStore, useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

export default function OnboardPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const setPersona = useOnboardingStore((s) => s.setPersona);
  const setGlobalUser = useUserStore((s) => s.setUser);
  const [selecting, setSelecting] = useState<'woman' | 'man' | null>(null);

  useEffect(() => {
    router.prefetch('/onboard/how-it-works');
  }, [router]);

  const handleSelect = async (selectedPersona: 'woman' | 'man') => {
    hapticTap();
    setSelecting(selectedPersona);
    setPersona(selectedPersona);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ persona: selectedPersona }).eq('id', user.id);
        const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (freshProfile) setGlobalUser(freshProfile as any);
      }
    } catch {}

    goTo('/onboard/how-it-works', '/onboarding/how-it-works.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/hero.jpg" />
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-3 bg-white p-2.5 rounded-3xl shadow-md border border-stone-200/80 flex items-center justify-center">
            <Image src="/logo.png" alt="GreenFlag" width={64} height={64} className="w-full h-full object-contain" priority />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21]">Welcome to GreenFlag</h1>
          <p className="text-emerald-800 text-xs font-bold tracking-widest uppercase mt-1.5 bg-emerald-100/90 inline-block px-3 py-1 rounded-full">
            Choose your travel profile
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect('woman')}
            disabled={selecting !== null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-woman' : undefined}
            className="w-full min-h-[190px] rounded-[28px] bg-gradient-to-br from-rose-50/95 via-white/90 to-amber-50/80 border-2 border-rose-200/90 hover:border-rose-400 transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60 text-left p-6 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            {selecting === 'woman' ? (
              <div className="h-full flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display text-2xl font-bold text-[#382A21] block">Woman Traveler</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Verified Circle</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shadow-xs">
                    <Crown className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#382A21]/80 leading-relaxed font-medium">
                  Host and join co-ed adventures + get access to verified female-only travel buddy circles and road trips.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full w-fit">
                  <span>🛡️ Safe female travel community</span>
                </div>
              </div>
            )}
          </button>

          <button
            onClick={() => handleSelect('man')}
            disabled={selecting !== null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-man' : undefined}
            className="w-full min-h-[190px] rounded-[28px] bg-gradient-to-br from-emerald-50/95 via-white/90 to-teal-50/80 border-2 border-emerald-200/90 hover:border-emerald-400 transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60 text-left p-6 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            {selecting === 'man' ? (
              <div className="h-full flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display text-2xl font-bold text-[#382A21] block">Man Traveler</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Explorer Profile</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Compass className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-[#382A21]/80 leading-relaxed font-medium">
                  Explore upcoming trips, connect with fellow travel buddies, organize weekend treks, and split stays safely.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full w-fit">
                  <span>🎒 Weekend getaways & road trips</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
