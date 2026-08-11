'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CategorizedInterestPicker } from '@/components/discovery/CategorizedInterestPicker';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { useOnboardingStore } from '@/lib/store';
import { INTEREST_CATEGORIES, INTEREST_CATEGORIES_STEPS } from '@/lib/constants/interestCategories';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useFinishInterests } from '@/lib/onboarding/useFinishInterests';
import { StepDots } from '@/components/shared/StepDots';

// Step 3 of 3 -- see app/(auth)/onboard/interests/page.tsx for why this
// is split across screens. Also where "What You Value In Him/Her" and
// the final submit live, same as the old single-page version's ending.
export default function InterestsStepThreePage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const isWoman = persona === 'woman';
  const { interestsHave, lookingFor, toggle } = useInterestsSelection();
  const { loading, finish } = useFinishInterests();

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image="/onboarding/interests.jpg" />
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/onboard/interests/2')} className="text-ink/40 hover:text-ink active:scale-90 transition-all">
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={finish}
          disabled={loading}
          className="text-xs font-semibold tracking-widest uppercase text-gold/80 hover:text-gold active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8 pb-safe-bottom">
        <StepDots current={3} total={3} />

        <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
          categories={INTEREST_CATEGORIES_STEPS[2]} selected={interestsHave} onToggle={(val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <CategorizedInterestPicker title={isWoman ? "What You Value In Him" : "What You Value In Her"} description="Choose as many as you like"
          categories={INTEREST_CATEGORIES} selected={lookingFor} onToggle={(val) => toggle('looking', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-looking' : undefined} />

        <button onClick={finish} disabled={loading}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-onboarding' : undefined}
          className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}
