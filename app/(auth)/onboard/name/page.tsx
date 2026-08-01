'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';

// Its own screen, not folded into the big profile form -- a standalone
// name-collection step is a well-documented conversion lever on its own
// (one case study measured 3% -> 12-15% just from splitting this out),
// and it lets every later screen greet the person by name instead of
// staying generic.
export default function OnboardNamePage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const setName = useOnboardingStore((s) => s.setName);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError('Please enter your name');
      return;
    }
    setName(trimmed);
    router.push(persona === 'woman' ? '/onboard/profile' : '/onboard/phone');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <button
        onClick={() => router.push('/onboard')}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="font-display text-3xl text-ink mb-3">What should we call you?</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Just your first name for now — everything else comes next.
        </p>

        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
          placeholder="Your first name"
          autoFocus
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-input' : undefined}
          className={`input w-full text-lg ${error ? 'border-red-500' : ''}`}
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'onboard-name-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
