'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

export default function OnboardNamePage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const setName = useOnboardingStore((s) => s.setName);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    router.prefetch('/onboard/profile');
  }, [router]);

  const handleContinue = async () => {
    hapticTap();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError('Please enter your name');
      return;
    }
    setName(trimmed);
    setContinuing(true);
    goTo('/onboard/profile', '/onboarding/age.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-between px-5 pt-safe-top pb-safe-bottom bg-white text-[#1C1C1E]">
      <OnboardingBackground image="/onboarding/name.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/onboard')}
          className="text-[#1C1C1E] bg-[#F4F4F5] hover:bg-stone-200 border border-stone-200 shadow-2xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-[#F9FAFB] border border-stone-200 rounded-3xl p-7 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-xl">
            👋
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1">
              What should we call you?
            </h1>
            <p className="text-stone-500 text-xs font-medium">
              Your first name will be shown on your profile and escapes.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
              placeholder="Your first name"
              autoFocus
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-input' : undefined}
              className={`w-full rounded-2xl px-5 py-4 text-xl font-bold text-[#1C1C1E] placeholder:text-stone-400 bg-white border transition-all duration-200 focus:outline-none focus:border-[#1C1C1E] ${
                error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={continuing}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-continue' : undefined}
        className="w-full py-4 max-w-md mx-auto rounded-full bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm mb-2"
      >
        {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
