'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';

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
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const setAge = useOnboardingStore((s) => s.setAge);
  const [value, setValue] = useState(age ? String(age) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) router.replace('/onboard/name');
  }, []);

  const handleContinue = () => {
    hapticTap();
    const ageNum = Number(value);
    if (!value.trim() || !Number.isInteger(ageNum)) { setError('How old are you?'); return; }
    if (ageNum < MIN_AGE) { setError('You must be 18+'); return; }
    if (ageNum > MAX_AGE) { setError('Please enter a valid age'); return; }
    setAge(ageNum);
    router.push('/onboard/profile/location');
  };

  return (
    <div className="relative w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <OnboardingBackground image="/onboarding/age.jpg" />
      <button
        onClick={() => router.push('/onboard/name')}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <StepDots current={1} total={6} />

        <h1 className="font-display text-3xl text-ink mb-3">How old are you?</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Identity is verified separately — this just needs to be accurate.
        </p>

        <input
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
          placeholder="Your age"
          autoFocus
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age' : undefined}
          className={`input w-full text-lg ${error ? 'border-red-500' : ''}`}
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
