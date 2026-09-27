'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

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
  const { goTo } = useOnboardingNav();
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
    router.prefetch('/onboard/profile/bio');
  }, []);

  const handleContinue = () => {
    hapticTap();
    if (!handle.trim()) { setError('Instagram handle is required'); return; }
    setInstagram(handle.trim(), false);
    goTo('/onboard/profile/bio', '/onboarding/bio.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/instagram.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/profile/location')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={3} total={6} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center mb-4 font-bold text-xl shadow-xs">
            📸
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">What&apos;s your Instagram?</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            Used only by moderators to verify you&apos;re a real person — never shown publicly on your profile.
          </p>

          <label className="block text-xs font-bold text-[#382A21]/70 uppercase tracking-wider mb-2">
            Instagram Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#382A21]/50">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => { setHandle(e.target.value.replace(/^@/, '')); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
              placeholder="your_handle"
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram' : undefined}
              className={`w-full rounded-2xl pl-10 pr-5 py-4 text-xl font-bold text-[#382A21] placeholder:text-stone-400 bg-stone-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#1D3B2A] focus:ring-4 focus:ring-emerald-500/10 ${
                error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            />
          </div>
          {error && <p className="text-red-600 text-xs font-semibold mt-2">{error}</p>}

          <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5">
            <span className="text-base">🔒</span>
            <p className="text-xs text-emerald-900 font-medium leading-tight">
              100% private. We never post, message your followers, or link your handle on trips.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-instagram-continue' : undefined}
        className="btn-primary w-full py-4 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
