'use client';

import { useRouter } from 'next/navigation';
import { Crown, Compass } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';

export default function OnboardPage() {
  const router = useRouter();
  const setPersona = useOnboardingStore((s) => s.setPersona);

  const handleSelect = (persona: 'woman' | 'man') => {
    hapticTap();
    setPersona(persona);
    router.push('/onboard/name');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col justify-center px-4 bg-[#000000]">
      <div className="text-center mb-10">
        <img src="/logo.png" alt="GreenFlag" className="w-32 h-32 mx-auto mb-3" />
        <p className="text-ink/50 text-sm">Choose Your Path</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('woman')}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-woman' : undefined}
          className="w-full h-56 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 hover:border-gold transition-all duration-300 relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-gold" />
            </div>
            <span className="text-[10px] font-semibold tracking-widest text-gold uppercase">Woman</span>
            <span className="font-display text-2xl text-ink -mt-2">
              I Set The Standard
            </span>
            <span className="text-sm text-ink/60 max-w-[260px] leading-relaxed">
              Define your 3-day Standard. He earns his way to you.
            </span>
          </div>
        </button>

        <button
          onClick={() => handleSelect('man')}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'persona-man' : undefined}
          className="w-full h-56 rounded-xl bg-[#1C1C1E] border border-[#2A2A2A] hover:border-ink/30 transition-all duration-300 relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 text-black/70" />
            </div>
            <span className="text-[10px] font-semibold tracking-widest text-ink/50 uppercase">Men</span>
            <span className="font-display text-2xl text-ink -mt-2">
              I Rise To It
            </span>
            <span className="text-sm text-ink/60 max-w-[260px] leading-relaxed">
              Discover curated profiles. Show intention. Earn the conversation.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
