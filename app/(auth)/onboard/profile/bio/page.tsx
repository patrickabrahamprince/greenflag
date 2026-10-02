'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const BIO_MIN_CHARS = 15;

// Step 3 of the profile wizard -- About You bio, split out of the old
// single-page form (see /onboard/profile for the wizard's intent).
export default function ProfileBioPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
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
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); return; }
    if (!instagramHandle) { router.replace('/onboard/profile/instagram'); }
    router.prefetch('/onboard/profile/teasers');
  }, []);

  const handleContinue = () => {
    hapticTap();
    const trimmed = value.trim();
    if (!trimmed) { setError('About you is required'); return; }
    if (trimmed.length < BIO_MIN_CHARS) { setError(`Write at least ${BIO_MIN_CHARS} characters`); return; }
    if (value.length > 200) { setError('Keep it under 200 characters'); return; }
    setBio(trimmed);
    goTo('/onboard/profile/teasers', '/onboarding/teasers.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/bio.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/profile/instagram')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={4} total={6} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center mb-4 font-bold text-xl">
            ✍️
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">Your Travel & Dating Vibe</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            This is what fellow travelers and dates read first — your dream getaways and what sparks your connection.
          </p>

          <label className="block text-xs font-bold text-[#382A21]/70 uppercase tracking-wider mb-2">
            Bio <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder={`Always ready for a weekend road trip to Coorg or Gokarna. Love mountain treks, cozy cafe dates, stargazing, and deep talks on the road...`}
            maxLength={200}
            rows={4}
            autoFocus
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio' : undefined}
            className={`w-full rounded-2xl p-4 text-base font-medium text-[#382A21] placeholder:text-stone-400 bg-stone-50 border-2 transition-all duration-200 resize-none focus:outline-none focus:bg-white focus:border-[#1D3B2A] focus:ring-4 focus:ring-emerald-500/10 ${
              error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className={`text-[11px] font-bold ${value.length < BIO_MIN_CHARS ? 'text-amber-700' : 'text-emerald-700'}`}>
              {value.length < BIO_MIN_CHARS ? `Min ${BIO_MIN_CHARS} characters (${value.length}/${BIO_MIN_CHARS})` : '✓ Looks good!'}
            </span>
            <span className="text-xs text-stone-400 font-semibold">{value.length}/200</span>
          </div>
          {error && <p className="text-red-600 text-xs font-semibold mt-1">{error}</p>}

          <div className="mt-5 pt-4 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Tap to Add Vibe</span>
            <div className="flex flex-wrap gap-1.5">
              {['Weekend roadtrips 🚗', 'Cafe dates ☕', 'Beach sunsets 🌅', 'Mountain treks 🏔️', 'Travel romance ✨', 'Bonfires & music 🎸', 'Deep talks 🌙'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    const next = value ? `${value.trim()} ${tag}` : tag;
                    if (next.length <= 200) {
                      setValue(next);
                      setError('');
                    }
                  }}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-[#382A21] transition-all active:scale-95"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio-continue' : undefined}
        className="btn-primary w-full py-4 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
