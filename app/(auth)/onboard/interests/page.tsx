'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { InterestGrid } from '../../../components/discovery/InterestGrid';
import { WhyMePrompts } from '@/components/discovery/WhyMePrompts';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import toast from 'react-hot-toast';

const INTEREST_TAGS = [
  'Books', 'Music', 'Travel', 'Fitness', 'Cooking', 'Art', 'Gaming',
  'Cinema', 'Philosophy', 'Spirituality', 'Entrepreneurship', 'Tech',
  'Fashion', 'Nature', 'Coffee', 'Nightlife', 'Yoga', 'Writing',
  'Photography', 'Dance',
];

export default function InterestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);
  const isWoman = persona === 'woman';

  const { interestsHave, lookingFor, toggle, validate } = useInterestsSelection();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!validate(isWoman)) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      persona: persona ?? undefined,
      interests_have: interestsHave,
      interests_looking_for: lookingFor,
    });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success('Profile completed!');
    router.replace('/onboard/rules');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6">
      <button onClick={() => router.push('/onboard/quiz')} className="text-[#8E8E93] hover:text-white transition-colors mb-6 w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8 pb-8">
        <InterestGrid title="5 things about you" description="Pick exactly 5"
          options={INTEREST_TAGS} selected={interestsHave} max={5} onToggle={(_, val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <InterestGrid title={isWoman ? "5 things you're looking for in him" : "5 things you're looking for in her"} description="Pick exactly 5"
          options={INTEREST_TAGS} selected={lookingFor} max={5} onToggle={(_, val) => toggle('looking', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-looking' : undefined} />

        <button onClick={handleContinue} disabled={loading}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-onboarding' : undefined}
          className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete'}
        </button>
      </div>
    </div>
  );
}
