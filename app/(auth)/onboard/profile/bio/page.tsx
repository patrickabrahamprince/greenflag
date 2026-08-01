'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';

const BIO_MIN_CHARS = 15;

// Step 3 of the profile wizard -- About You bio, split out of the old
// single-page form (see /onboard/profile for the wizard's intent).
export default function ProfileBioPage() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const instagramHandle = useOnboardingStore((s) => s.instagramHandle);
  const bio = useOnboardingStore((s) => s.bio);
  const setBio = useOnboardingStore((s) => s.setBio);

  const [value, setValue] = useState(bio);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age || !city) { router.replace('/onboard/profile'); return; }
    if (!instagramHandle) { router.replace('/onboard/profile/instagram'); }
  }, []);

  const handleContinue = () => {
    const trimmed = value.trim();
    if (!trimmed) { setError('About you is required'); return; }
    if (trimmed.length < BIO_MIN_CHARS) { setError(`Write at least ${BIO_MIN_CHARS} characters`); return; }
    if (value.length > 200) { setError('Keep it under 200 characters'); return; }
    setBio(trimmed);
    router.push('/onboard/profile/photos');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/profile/instagram')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={3} total={4} />

        <h1 className="font-display text-2xl text-ink mb-2">A few words about you</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          This is what she&apos;ll read first — make it real.
        </p>

        <label className="block text-sm font-medium text-ink mb-1.5">
          About You <span className="text-red-400">*</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          placeholder={`A few words that define you... (at least ${BIO_MIN_CHARS} characters)`}
          maxLength={200}
          rows={5}
          autoFocus
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio' : undefined}
          className={`input resize-none ${error ? 'border-red-500' : ''}`}
        />
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${value.length < BIO_MIN_CHARS ? 'text-amber-400' : 'text-[#9DA0A6]'}`}>
            {value.length < BIO_MIN_CHARS ? `Min ${BIO_MIN_CHARS} characters` : ''}
          </span>
          <span className="text-xs text-[#9DA0A6]">{value.length}/200</span>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio-continue' : undefined}
        className="btn-primary w-full py-4 mb-6 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
