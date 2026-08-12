'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFinishInterests } from '@/lib/onboarding/useFinishInterests';

// Skip interests/5 entirely - go straight to rules
export default function InterestsStepFivePage() {
  const router = useRouter();
  const { finish } = useFinishInterests();

  useEffect(() => {
    finish();
  }, []);

  return null;
}
