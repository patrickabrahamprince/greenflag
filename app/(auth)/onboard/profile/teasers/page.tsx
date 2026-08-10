'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Quote, Plus } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';
import { TEASER_PROMPTS } from '@/lib/constants/profileDetails';

// Step 5 of 6 in the profile wizard -- an optional icebreaker prompt,
// shown on the profile as a highlighted quote card (see PromptCard).
// Skippable: unlike name/age/city, a missing teaser doesn't block a
// usable profile, it just means one less thing for a match to react to.
export default function ProfileTeasersPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const bio = useOnboardingStore((s) => s.bio);
  const teaserPrompt = useOnboardingStore((s) => s.teaserPrompt);
  const teaserAnswer = useOnboardingStore((s) => s.teaserAnswer);
  const setTeaser = useOnboardingStore((s) => s.setTeaser);

  const [prompt, setPrompt] = useState(teaserPrompt);
  const [answer, setAnswer] = useState(teaserAnswer);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); return; }
    if (!bio) { router.replace('/onboard/profile/bio'); }
    router.prefetch('/onboard/profile/photos');
  }, []);

  const handleContinue = () => {
    hapticTap();
    setTeaser(prompt.trim(), answer.trim());
    goTo('/onboard/profile/photos');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image="/onboarding/teasers.jpg" />
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/onboard/profile/bio')}
          className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleContinue}
          className="text-xs font-semibold tracking-widest uppercase text-gold/80 hover:text-gold active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={5} total={6} />

        <h1 className="font-display text-2xl text-ink mb-2">Share a fun fact</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Optional, but it&apos;s a great way to give matches something to react to.
        </p>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-ink font-medium">{prompt || 'Select a prompt'}</span>
          <Plus size={18} className="text-ink/50" />
        </button>

        {prompt && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            maxLength={120}
            rows={3}
            autoFocus
            className="input resize-none mt-3"
          />
        )}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-teasers-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        {prompt && answer.trim() ? 'Continue' : 'Skip for now'}
        <ArrowRight className="w-4 h-4" />
      </button>

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <h2 className="font-display text-xl text-ink mb-4">Pick a prompt</h2>
        <div className="space-y-2 pb-6">
          {TEASER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setPrompt(p); setPickerOpen(false); }}
              className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-left text-ink/90 text-sm hover:border-gold/50 active:scale-[0.98] transition-all"
            >
              <Quote size={14} className="text-gold shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
