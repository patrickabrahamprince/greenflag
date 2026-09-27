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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/bio.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/profile/bio')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleContinue}
          className="px-3.5 py-1.5 rounded-full bg-white/80 border border-stone-200/80 shadow-xs text-xs font-bold tracking-wider uppercase text-stone-600 hover:text-[#382A21] active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={5} total={6} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-28 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 font-bold text-xl">
            💬
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">Share a fun fact</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            Optional, but it gives fellow travelers an easy conversation starter!
          </p>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-between bg-stone-50 border-2 border-stone-200 hover:border-[#1D3B2A] rounded-2xl px-5 py-4 text-left active:scale-[0.98] transition-all"
          >
            <span className="text-base font-bold text-[#382A21]">{prompt || 'Select a prompt...'}</span>
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
              className="w-full rounded-2xl p-4 text-base font-medium text-[#382A21] placeholder:text-stone-400 bg-stone-50 border-2 border-stone-200 focus:border-[#1D3B2A] focus:bg-white resize-none mt-3.5 transition-all outline-none"
            />
          )}
        </div>
      </div>
    </div>

    <div
      className={`fixed bottom-0 left-0 right-0 z-10 px-5 py-4 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/95 to-transparent transition-opacity duration-200 ${pickerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ bottom: 'calc(max(0.5rem, env(safe-area-inset-bottom)) + var(--kb-inset, 0px))' }}
    >
      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-teasers-continue' : undefined}
        className="btn-primary w-full max-w-md mx-auto py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        {prompt && answer.trim() ? 'Continue' : 'Skip for now'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
      <div className="pb-4">
        <h2 className="font-display text-xl font-bold text-[#382A21] mb-1">Pick a conversation starter</h2>
        <p className="text-xs text-stone-500 mb-4 font-medium">Choose a prompt that fits your travel style</p>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {TEASER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setPrompt(p); setPickerOpen(false); }}
              className="w-full flex items-center gap-3 bg-stone-50 hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-[#382A21] active:scale-[0.98] transition-all"
            >
              <Quote size={14} className="text-emerald-700 shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
    </>
  );
}
