'use client';

import { useRouter } from 'next/navigation';
import { Crown, Compass } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';

export default function OnboardPage() {
  const router = useRouter();
  const setPersona = useOnboardingStore((s) => s.setPersona);

  const handleSelect = (persona: 'woman' | 'man') => {
    setPersona(persona);
    router.push('/onboard/phone');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-semibold text-white mb-3">
          Welcome to GreenFlag
        </h1>
        <p className="text-[#8E8E93] text-sm">Choose your path</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('woman')}
          className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <span className="text-2xl font-display text-[#EDEADE]">
              I set the Standard
            </span>
            <span className="text-sm text-[#EDEADE]/60 max-w-[260px] leading-relaxed">
              Build your 8-day Standard. Men earn their way to you.
            </span>
          </div>
        </button>

        <button
          onClick={() => handleSelect('man')}
          className="w-full h-56 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 text-white/80" />
            </div>
            <span className="text-2xl font-display text-[#EDEADE]">
              I rise to it
            </span>
            <span className="text-sm text-[#EDEADE]/60 max-w-[260px] leading-relaxed">
              Discover women. Prove your worth. Earn the chat.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
