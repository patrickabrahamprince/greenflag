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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center px-4 pt-safe-top pb-safe-bottom bg-base">
      <OnboardingBackground image="/onboarding/hero.jpg" />
      <div className="-mt-2">
      <div className="text-center mb-8">
        <Image src="/logo.png" alt="GreenFlag" width={112} height={112} className="w-24 h-24 mx-auto mb-2" />
        <h1 className="font-display text-2xl font-bold text-ink">Welcome to GreenFlag</h1>
        <p className="text-emerald-400 text-xs font-semibold tracking-wider uppercase mt-1">Set up your travel profile</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('woman')}
          disabled={selecting !== null}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-woman' : undefined}
          className="w-full h-52 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-white/[0.04] to-transparent border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60 text-left p-6 flex flex-col justify-between"
        >
          {selecting === 'woman' ? (
            <div className="relative z-10 h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-ink">Woman Traveler</span>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed max-w-[280px]">
                Host and join co-ed adventures + get access to verified female-only travel buddy circles and road trips.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span>🛡️ Safe travel community verified</span>
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelect('man')}
          disabled={selecting !== null}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-man' : undefined}
          className="w-full h-52 rounded-2xl bg-gradient-to-br from-sky-500/15 via-white/[0.04] to-transparent border border-sky-500/30 hover:border-sky-400 transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60 text-left p-6 flex flex-col justify-between"
        >
          {selecting === 'man' ? (
            <div className="relative z-10 h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold text-ink">Man Traveler</span>
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed max-w-[280px]">
                Explore upcoming trips, connect with fellow travel buddies, organize weekend treks, and split stays safely.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-400">
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
