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

// Step 1 of 5 -- "What Defines You" used to be one long scroll through
// every category at once; split across 5 screens (see interests/2..5)
// so each one is a manageable slice instead.
export default function InterestsPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const { interestsHave, toggle } = useInterestsSelection();
  const { loading, finish } = useFinishInterests();

  useEffect(() => {
    router.prefetch('/onboard/interests/2');
  }, [router]);

  const handleNext = () => {
    hapticTap();
    goTo('/onboard/interests/2');
  };

  return (
    <InterestsStepScreen
      step={1}
      total={TOTAL_STEPS}
      image="/onboarding/name.jpg"
      onBack={() => router.push('/onboard/quiz')}
      onSkip={finish}
      skipLoading={loading}
      onNext={handleNext}
      nextLoading={loading}
      nextLabel="Next"
    >
      <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
        categories={INTEREST_CATEGORIES_STEPS[0]} selected={interestsHave} onToggle={(val) => toggle('have', val)}
        dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />
    </InterestsStepScreen>
  );
}
