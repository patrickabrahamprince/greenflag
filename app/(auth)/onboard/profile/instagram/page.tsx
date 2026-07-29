'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';

const VERIFY_DURATION_MS = 3000;

// Step 2 of the profile wizard -- Instagram handle + verify, split out of
// the old single-page form (see /onboard/profile for the wizard's intent).
export default function ProfileInstagramPage() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);
  const dob = useOnboardingStore((s) => s.dob);
  const city = useOnboardingStore((s) => s.city);
  const instagramHandle = useOnboardingStore((s) => s.instagramHandle);
  const instagramVerified = useOnboardingStore((s) => s.instagramVerified);
  const setInstagram = useOnboardingStore((s) => s.setInstagram);

  const [handle, setHandle] = useState(instagramHandle);
  const [verified, setVerified] = useState(instagramVerified);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!dob || !city) { router.replace('/onboard/profile'); }
  }, []);

  const handleVerify = () => {
    if (!handle.trim() || verifying || verified) return;
    setVerifying(true);
    // Mimic only -- there's no real Instagram API integration here. The
    // handle still gets sent to admins for manual identity review; this
    // just gives the applicant a moment of "checking" before confirming.
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, VERIFY_DURATION_MS);
  };

  const handleContinue = () => {
    if (!handle.trim()) { setError('Instagram is required to verify you'); return; }
    if (!verified) { setError('Please verify your Instagram to continue'); return; }
    setInstagram(handle, verified);
    router.push('/onboard/profile/bio');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/profile')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={2} total={4} />

        <h1 className="font-display text-2xl text-ink mb-2">Verify it&apos;s really you</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Used only to verify you — never shown on your profile.
        </p>

        <label className="block text-sm font-medium text-ink mb-1.5">
          Instagram Handle <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value.replace(/^@/, ''));
                if (verified) setVerified(false);
                setError('');
              }}
              placeholder="username"
              disabled={verifying}
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram' : undefined}
              className={`input pl-8 ${error ? 'border-red-500' : ''}`}
            />
          </div>
          <button
            type="button"
            onClick={handleVerify}
            disabled={!handle.trim() || verifying || verified}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram-verify' : undefined}
            className={`shrink-0 px-4 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              verified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20 disabled:opacity-40'
            }`}
          >
            {verifying ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Verifying</>
            ) : verified ? (
              <><BadgeCheck className="w-3.5 h-3.5" />Verified</>
            ) : (
              <><ShieldCheck className="w-3.5 h-3.5" />Verify</>
            )}
          </button>
        </div>
        <p className="text-[#9DA0A6] text-xs mt-1">
          {verified
            ? 'Verified — this will be sent with your profile for identity approval.'
            : 'We just need to confirm you’re a real person.'}
        </p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram-continue' : undefined}
        className="btn-primary w-full py-4 mb-6 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
