'use client';

import { useOnboardingStore } from '@/lib/store';

// Backed by the persisted onboarding store (not local state) -- interest
// picking now spans multiple screens (see app/(auth)/onboard/interests),
// so selections need to survive navigating between them, same as every
// other profile-wizard answer.
export function useInterestsSelection() {
  const interestsHave = useOnboardingStore((s) => s.interestsHave);
  const lookingFor = useOnboardingStore((s) => s.interestsLookingFor);
  const toggle = useOnboardingStore((s) => s.toggleInterest);

  return { interestsHave, lookingFor, toggle };
}
