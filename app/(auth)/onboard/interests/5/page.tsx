'use client';

import { useRouter } from 'next/navigation';
import { CategorizedInterestPicker } from '@/components/discovery/CategorizedInterestPicker';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { useOnboardingStore } from '@/lib/store';
import { INTEREST_CATEGORIES, INTEREST_CATEGORIES_STEPS } from '@/lib/constants/interestCategories';
import { useFinishInterests } from '@/lib/onboarding/useFinishInterests';
import { InterestsStepScreen } from '@/components/onboarding/InterestsStepScreen';

const TOTAL_STEPS = INTEREST_CATEGORIES_STEPS.length;

// Step 5 of 5 -- see app/(auth)/onboard/interests/page.tsx for why this
// is split across screens. Also where "What You Value In Him/Her" and
// the final submit live, same as the old single-page version's ending.
export default function InterestsStepFivePage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const isWoman = persona === 'woman';
  const { interestsHave, lookingFor, toggle } = useInterestsSelection();
  const { loading, finish } = useFinishInterests();

  return (
    <InterestsStepScreen
      step={5}
      total={TOTAL_STEPS}
      onBack={() => router.push('/onboard/interests/4')}
      onSkip={finish}
      skipLoading={loading}
      onNext={finish}
      nextLoading={loading}
      nextLabel="Complete Profile"
      nextTestId={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-onboarding' : undefined}
    >
      <div className="space-y-8">
        <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
          categories={INTEREST_CATEGORIES_STEPS[4]} selected={interestsHave} onToggle={(val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <CategorizedInterestPicker title={isWoman ? "What You Value In Him" : "What You Value In Her"} description="Choose as many as you like"
          categories={INTEREST_CATEGORIES} selected={lookingFor} onToggle={(val) => toggle('looking', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-looking' : undefined} />
      </div>
    </InterestsStepScreen>
  );
}
