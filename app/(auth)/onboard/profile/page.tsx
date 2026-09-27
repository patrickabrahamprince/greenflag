'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const MIN_AGE = 18;
// Matches the live DB check constraint on profiles.age (age >= 18 AND
// age <= 60) -- validating a wider range client-side would just let
// someone hit a raw constraint-violation error on submit instead of a
// friendly inline message.
const MAX_AGE = 60;

// Step 1 of 5 in the profile wizard -- age on its own, styled the same
// big-single-question way as /onboard/name, rather than sharing a screen
// with location. One question per screen throughout.
export default function ProfileAgePage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const setAge = useOnboardingStore((s) => s.setAge);
  const [value, setValue] = useState(age ? String(age) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) router.replace('/onboard/name');
    router.prefetch('/onboard/profile/location');
  }, []);

  const handleContinue = () => {
    hapticTap();
    const ageNum = Number(value);
    if (!value.trim() || !Number.isInteger(ageNum)) { setError('How old are you?'); return; }
    if (ageNum < MIN_AGE) { setError('You must be 18+'); return; }
    if (ageNum > MAX_AGE) { setError('Please enter a valid age'); return; }
    setAge(ageNum);
    goTo('/onboard/profile/location', '/onboarding/location.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/age.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/name')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={1} total={6} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 font-bold text-xl">
            🎂
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">How old are you?</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            Identity is verified separately — this ensures you match with travel buddies in your age bracket.
          </p>

          <input
            type="number"
            inputMode="numeric"
            min={MIN_AGE}
            max={MAX_AGE}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
            placeholder="e.g. 25"
            autoFocus
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age' : undefined}
            className={`w-full rounded-2xl px-5 py-4 text-2xl font-bold text-[#382A21] placeholder:text-stone-400 bg-stone-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#1D3B2A] focus:ring-4 focus:ring-emerald-500/10 ${
              error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
            }`}
          />
          {error && <p className="text-red-600 text-xs font-semibold mt-2">{error}</p>}

          <div className="mt-5 pt-4 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Quick Pick</span>
            <div className="flex flex-wrap gap-2">
              {[21, 23, 25, 27, 29, 32].map((quickAge) => (
                <button
                  key={quickAge}
                  type="button"
                  onClick={() => { hapticTap(); setValue(String(quickAge)); setError(''); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    value === String(quickAge)
                      ? 'bg-[#1D3B2A] text-white shadow-xs'
                      : 'bg-stone-100 text-[#382A21] hover:bg-stone-200'
                  }`}
                >
                  {quickAge}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age-continue' : undefined}
        className="btn-primary w-full py-4 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
