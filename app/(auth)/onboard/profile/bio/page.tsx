'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';

const BIO_MIN_CHARS = 15;

// Each example pairs a quote with a photo so the intro reads as a mini
// carousel instead of a static quote card -- both cycle together.
const BIO_EXAMPLES = [
  { quote: '"Coffee snob, terrible dancer, great listener."', image: '/onboarding/name.jpg' },
  { quote: '"Will debate you on the best biryani in town."', image: '/onboarding/interests.jpg' },
  { quote: '"Currently training for a marathon I\'m dreading."', image: '/onboarding/age.jpg' },
  { quote: '"Ask me about the time I got lost in Ladakh."', image: '/onboarding/instagram.jpg' },
  { quote: '"Overly competitive at board games. No regrets."', image: '/onboarding/rules.jpg' },
  { quote: '"Homemade pasta on weekends, chaos on weekdays."', image: '/onboarding/quiz.jpg' },
];

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
  const [showIntro, setShowIntro] = useState(true);
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); return; }
    if (!instagramHandle) { router.replace('/onboard/profile/instagram'); }
  }, []);

  // A cycling example bio isn't just decorative -- it gives someone
  // staring at a blank text field an actual sense of the tone/length
  // that works, instead of a static quote icon that (per feedback) read
  // as "showing nothing".
  useEffect(() => {
    if (!showIntro) return;
    const id = setInterval(() => setExampleIdx((i) => (i + 1) % BIO_EXAMPLES.length), 2400);
    return () => clearInterval(id);
  }, [showIntro]);

  const handleContinue = () => {
    hapticTap();
    const trimmed = value.trim();
    if (!trimmed) { setError('About you is required'); return; }
    if (trimmed.length < BIO_MIN_CHARS) { setError(`Write at least ${BIO_MIN_CHARS} characters`); return; }
    if (value.length > 200) { setError('Keep it under 200 characters'); return; }
    setBio(trimmed);
    router.push('/onboard/profile/teasers');
  };

  if (showIntro) {
    return (
      <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <OnboardingBackground image="/onboarding/bio.jpg" />
        <button
          onClick={() => router.push('/onboard/profile/instagram')}
          className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full text-center">
          <StepDots current={4} total={6} />

          {/* No enclosing card anymore -- the photo+quote pair sits
              directly on the page's own background photo instead of a
              separate boxed panel. */}
          <div key={exampleIdx} className="w-20 h-20 rounded-full overflow-hidden mb-5 border border-white/20 shadow-[0_0_30px_-8px_rgba(192,38,211,0.6)] animate-slide-up">
            <img src={BIO_EXAMPLES[exampleIdx].image} alt="" className="w-full h-full object-cover" />
          </div>
          <p key={`${exampleIdx}-quote`} className="font-display text-base text-ink/90 leading-snug animate-slide-up px-6">
            {BIO_EXAMPLES[exampleIdx].quote}
          </p>
          <p className="text-ink/40 text-xs uppercase tracking-widest mt-3 mb-8">Like this, but you</p>

          <h1 className="font-display text-xl text-ink mb-3 whitespace-nowrap">Personality goes a long way</h1>
          <p className="text-ink/50 text-sm leading-relaxed">It&apos;s your time to shine.</p>
        </div>

        <button
          onClick={() => setShowIntro(false)}
          className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          Stand out
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <OnboardingBackground image="/onboarding/bio.jpg" />
      <button
        onClick={() => setShowIntro(true)}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={4} total={6} />

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
          <span className={`text-[10px] ${value.length < BIO_MIN_CHARS ? 'text-amber-400' : 'text-[#9DA0A6]'}`}>
            {value.length < BIO_MIN_CHARS ? `Min ${BIO_MIN_CHARS} characters` : ''}
          </span>
          <span className="text-xs text-[#9DA0A6]">{value.length}/200</span>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
