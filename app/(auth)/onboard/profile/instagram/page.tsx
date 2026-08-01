'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';

// Step 2 of the profile wizard -- Instagram handle, split out of the old
// single-page form (see /onboard/profile for the wizard's intent).
//
// This used to fake a client-side "Verify" spin-and-checkmark with no
// real Instagram API behind it -- a UI element that claims to verify
// something but doesn't is exactly the kind of misleading functionality
// App Review flags. The handle is just collected here; real identity
// review happens on the backend during admin approval, same as it
// already did for the "verified" case.
export default function ProfileInstagramPage() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const instagramHandle = useOnboardingStore((s) => s.instagramHandle);
  const setInstagram = useOnboardingStore((s) => s.setInstagram);

  const [handle, setHandle] = useState(instagramHandle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); }
  }, []);

  const handleContinue = () => {
    if (!handle.trim()) { setError('Instagram handle is required'); return; }
    setInstagram(handle.trim(), false);
    router.push('/onboard/profile/bio');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/profile/location')}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={3} total={6} />

        <h1 className="font-display text-2xl text-ink mb-2">What&apos;s your Instagram?</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Used only to verify you — never shown on your profile.
        </p>

        <label className="block text-sm font-medium text-ink mb-1.5">
          Instagram Handle <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => { setHandle(e.target.value.replace(/^@/, '')); setError(''); }}
            placeholder="username"
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram' : undefined}
            className={`input pl-8 ${error ? 'border-red-500' : ''}`}
          />
        </div>
        <p className="text-[#9DA0A6] text-xs mt-1">
          This will be sent with your profile for identity approval.
        </p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
