'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { CategorizedInterestPicker } from '@/components/discovery/CategorizedInterestPicker';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { INTEREST_CATEGORIES_STEPS } from '@/lib/constants/interestCategories';
import { hapticTap } from '@/lib/haptics';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';
import { useFinishInterests } from '@/lib/onboarding/useFinishInterests';
import { StepDots } from '@/components/shared/StepDots';

// Step 2 of 3 -- see app/(auth)/onboard/interests/page.tsx for why this
// is split across screens.
export default function InterestsStepTwoPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const { interestsHave, toggle } = useInterestsSelection();
  const { loading, finish } = useFinishInterests();

  useEffect(() => {
    router.prefetch('/onboard/interests/3');
  }, [router]);

  const handleNext = () => {
    hapticTap();
    goTo('/onboard/interests/3');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image="/onboarding/interests.jpg" />
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/onboard/interests')} className="text-ink/40 hover:text-ink active:scale-90 transition-all">
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
        <StepDots current={2} total={3} />

        <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
          categories={INTEREST_CATEGORIES_STEPS[1]} selected={interestsHave} onToggle={(val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <button onClick={handleNext} disabled={loading}
          className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
