'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import { createClient } from '@/lib/supabase/client';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

// Its own screen, not folded into the big profile form -- a standalone
// name-collection step is a well-documented conversion lever on its own
// (one case study measured 3% -> 12-15% just from splitting this out),
// and it lets every later screen greet the person by name instead of
// staying generic.
export default function OnboardNamePage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const persona = useOnboardingStore((s) => s.persona);
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
    // Both men and women go straight to profile (age) after entering name
    goTo('/onboard/profile', '/onboarding/age.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/name.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/onboard')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 font-bold text-xl">
            👋
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">What should we call you?</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            Just your first name for now — everything else comes next.
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
              placeholder="Your first name"
              autoFocus
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-input' : undefined}
              className={`w-full rounded-2xl px-5 py-4 text-xl font-bold text-[#382A21] placeholder:text-stone-400 bg-stone-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#1D3B2A] focus:ring-4 focus:ring-emerald-500/10 ${
                error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
            {error && <p className="text-red-600 text-xs font-semibold mt-1.5">{error}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={continuing}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-continue' : undefined}
        className="btn-primary w-full py-4 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
