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
  'Books', 'Music', 'Travel', 'Fitness', 'Gastronomy', 'Art',
  'Cinema', 'Philosophy', 'Spirituality', 'Business', 'Technology',
  'Fashion', 'Nature', 'Coffee Culture', 'Nightlife', 'Yoga', 'Writing',
  'Photography', 'Dance', 'Wellness',
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
      toast.error('Session expired. Please sign in again.');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    // A partial update, not an upsert -- the row already exists by this
    // point in onboarding (created at signup, populated by the profile
    // step). Upsert was silently dangerous here: profiles.persona has a
    // stale 'guest' column DEFAULT (pre-dating the persona/man/woman
    // rename), so any upsert omitting persona -- which this one did
    // whenever the in-memory onboarding store hadn't survived a refresh --
    // got the row filled with that invalid default and rejected by
    // persona_check. update() only touches the columns given here.
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
    router.replace('/onboard/rules');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top">
      <button onClick={() => router.push('/onboard/quiz')} className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8 pb-safe-bottom">
        <InterestGrid title="What Defines You" description="Choose 5"
          options={INTEREST_TAGS} selected={interestsHave} max={5} onToggle={(_, val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <InterestGrid title={isWoman ? "What You Value In Him" : "What You Value In Her"} description="Choose 5"
          options={INTEREST_TAGS} selected={lookingFor} max={5} onToggle={(_, val) => toggle('looking', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-looking' : undefined} />

        <button onClick={handleContinue} disabled={loading}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-onboarding' : undefined}
          className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}
