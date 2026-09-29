'use client';

import { useRouter } from 'next/navigation';
import { GameTheoryPhoneOnboarding } from '@/components/onboarding/GameTheoryPhoneOnboarding';

export default function PhonePage() {
  const router = useRouter();

  const handleSuccess = (phone: string) => {
    router.push('/onboard/how-it-works');
  };

  return <GameTheoryPhoneOnboarding onSuccess={handleSuccess} redirectUrl="/onboard/how-it-works" />;
}
