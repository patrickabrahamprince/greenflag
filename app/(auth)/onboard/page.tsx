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
      <div className="text-center mb-10">
        <Image src="/logo.png" alt="GreenFlag" width={128} height={128} className="w-32 h-32 mx-auto mb-3" />
        <p className="text-ink/50 text-sm">Choose Your Path</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('woman')}
          disabled={selecting !== null}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-woman' : undefined}
          className="w-full h-56 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 hover:border-gold transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60"
        >
          {selecting === 'woman' ? (
            <div className="relative z-10 h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                Woman
              </span>
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <span className="text-sm text-ink/60 max-w-[260px] leading-relaxed">
                Define your 3-day Standard. He earns his way to you.
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelect('man')}
          disabled={selecting !== null}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-man' : undefined}
          className="w-full h-56 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 hover:border-gold transition-all duration-300 relative overflow-hidden group active:scale-[0.98] disabled:opacity-60"
        >
          {selecting === 'man' ? (
            <div className="relative z-10 h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                Man
              </span>
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-gold" />
              </div>
              <span className="text-sm text-ink/60 max-w-[260px] leading-relaxed">
                Discover curated profiles. Show intention. Earn the conversation.
              </span>
            </div>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
