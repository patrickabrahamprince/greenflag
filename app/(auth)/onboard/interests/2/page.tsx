'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategorizedInterestPicker } from '@/components/discovery/CategorizedInterestPicker';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { INTEREST_CATEGORIES_STEPS } from '@/lib/constants/interestCategories';
import { hapticTap } from '@/lib/haptics';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';
import { useFinishInterests } from '@/lib/onboarding/useFinishInterests';
import { InterestsStepScreen } from '@/components/onboarding/InterestsStepScreen';

const TOTAL_STEPS = INTEREST_CATEGORIES_STEPS.length;

// Step 2 of 5 -- see app/(auth)/onboard/interests/page.tsx for why this
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
    <InterestsStepScreen
      step={2}
      total={TOTAL_STEPS}
      onBack={() => router.push('/onboard/interests')}
      onSkip={finish}
      skipLoading={loading}
      onNext={handleNext}
      nextLoading={loading}
      nextLabel="Next"
    >
      <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
        categories={INTEREST_CATEGORIES_STEPS[1]} selected={interestsHave} onToggle={(val) => toggle('have', val)}
        dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />
    </InterestsStepScreen>
  );
}
