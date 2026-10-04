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
    <>
    <div className="fixed inset-0 flex flex-col bg-white text-stone-900 overflow-hidden">
      <OnboardingBackground image="/onboarding/bio.jpg" />
      
      {/* Frozen Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-5 border-b border-stone-100/80">
        <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/onboard/profile/bio')}
            className="text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 shadow-xs active:scale-90 transition-all p-2.5 rounded-full cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleContinue}
            className="px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 shadow-xs text-xs font-bold tracking-wider uppercase text-stone-600 hover:text-stone-900 active:scale-90 transition-all cursor-pointer"
          >
            Skip
          </button>
        </div>

        <div className="max-w-md mx-auto w-full">
          <StepDots current={5} total={6} />
        </div>
      </header>

      {/* Fluid Scrollable Body */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col justify-between pb-safe-bottom">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-2 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-7 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mb-4 font-bold text-xl border border-stone-200">
              💬
            </div>
            <h1 className="font-display text-3xl font-extrabold text-stone-900 mb-2">Share a fun fact</h1>
            <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
              Optional, but it gives fellow travelers an easy conversation starter!
            </p>

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-between bg-stone-50 border-2 border-stone-200 hover:border-stone-900 rounded-2xl px-5 py-4 text-left active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="text-base font-bold text-stone-900">{prompt || 'Select a prompt...'}</span>
              <Plus size={20} className="text-stone-400" />
            </button>

            {prompt && (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                maxLength={120}
                rows={3}
                autoFocus
                className="w-full rounded-2xl p-4 text-base font-medium text-stone-900 placeholder:text-stone-400 bg-stone-50 border-2 border-stone-200 focus:border-stone-900 focus:bg-white resize-none mt-3.5 transition-all outline-none"
              />
            )}
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pt-2">
          <button
            onClick={handleContinue}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-teasers-continue' : undefined}
            className="w-full py-4 flex items-center justify-center gap-2 rounded-full bg-[#1C1C1E] text-white font-semibold hover:bg-black active:scale-[0.98] transition-transform shadow-lg cursor-pointer"
          >
            {prompt && answer.trim() ? 'Continue' : 'Skip for now'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>

    <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
      <div className="pb-4">
        <h2 className="font-display text-xl font-bold text-stone-900 mb-1">Pick a conversation starter</h2>
        <p className="text-xs text-stone-500 mb-4 font-medium">Choose a prompt that fits your travel style</p>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {TEASER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setPrompt(p); setPickerOpen(false); }}
              className="w-full flex items-center gap-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-stone-900 active:scale-[0.98] transition-all"
            >
              <Quote size={14} className="text-stone-700 shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
    </>
  );
}
