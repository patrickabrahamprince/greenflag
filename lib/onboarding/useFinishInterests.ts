'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

// Shared "save whatever's picked across all 3 interest screens and move
// on" action -- used by both the final screen's Complete Profile button
// and every screen's Skip button (selection is entirely optional, so
// skipping from screen 1 or 2 is just as valid an end to this flow as
// finishing screen 3).
export function useFinishInterests() {
  const router = useRouter();
  const { replaceTo } = useOnboardingNav();
  const supabase = createClient();
  const { interestsHave, lookingFor } = useInterestsSelection();
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired. Please sign in again.');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        interests_have: interestsHave,
        interests_looking_for: lookingFor,
      })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success('Profile curated');
    replaceTo('/onboard/rules', '/onboarding/rules.jpg');
  };

  return { loading, finish };
}
