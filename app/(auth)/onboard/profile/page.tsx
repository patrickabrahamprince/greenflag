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
const MAX_AGE = 60;

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
  }, [name, router]);

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
    <div className="fixed inset-0 flex flex-col bg-white text-[#1C1C1E] overflow-hidden">
      <OnboardingBackground image="/onboarding/age.jpg" />
      
      {/* Frozen Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-5 border-b border-stone-100/80">
        <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/onboard/name')}
            className="text-[#1C1C1E] bg-[#F4F4F5] hover:bg-stone-200 border border-stone-200 shadow-2xs active:scale-90 transition-all p-2.5 rounded-full cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="max-w-md mx-auto w-full">
          <StepDots current={1} total={6} />
        </div>
      </header>

      {/* Fluid Scrollable Body */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col justify-between pb-safe-bottom">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-4">
          <div className="bg-[#F9FAFB] border border-stone-200 rounded-3xl p-7 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-xl">
              🎂
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1">
                How old are you?
              </h1>
              <p className="text-stone-500 text-xs font-medium">
                Ensures you match with travel buddies in your age bracket.
              </p>
            </div>

            <div className="space-y-2 pt-2">
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
                className={`w-full rounded-2xl px-5 py-4 text-2xl font-bold text-[#1C1C1E] placeholder:text-stone-400 bg-white border transition-all duration-200 focus:outline-none focus:border-[#1C1C1E] ${
                  error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                }`}
              />
              {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
            </div>

            <div className="pt-3 border-t border-stone-200/80">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Quick Pick</span>
              <div className="flex flex-wrap gap-1.5">
                {[21, 23, 25, 27, 29, 32].map((quickAge) => (
                  <button
                    key={quickAge}
                    type="button"
                    onClick={() => { hapticTap(); setValue(String(quickAge)); setError(''); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      value === String(quickAge)
                        ? 'bg-[#1C1C1E] text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {quickAge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pt-2">
          <button
            onClick={handleContinue}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age-continue' : undefined}
            className="w-full py-4 rounded-full bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
