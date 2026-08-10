'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { CategorizedInterestPicker } from '@/components/discovery/CategorizedInterestPicker';
import { useInterestsSelection } from '@/components/discovery/useInterestsSelection';
import { INTEREST_CATEGORIES } from '@/lib/constants/interestCategories';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

export default function InterestsPage() {
  const router = useRouter();
  const { replaceTo } = useOnboardingNav();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);
  const isWoman = persona === 'woman';

  const { interestsHave, lookingFor, toggle } = useInterestsSelection();

  useEffect(() => {
    router.prefetch('/onboard/rules');
  }, [router]);
  const [loading, setLoading] = useState(false);

  // Selection is uncapped and entirely optional now (see the Skip button
  // below), so this is just "save whatever's picked, including nothing"
  // -- there's no validation left to gate it.
  const handleContinue = async () => {
    hapticTap();
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
    replaceTo('/onboard/rules', '/onboarding/rules.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image="/onboarding/interests.jpg" />
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/onboard/quiz')} className="text-ink/40 hover:text-ink active:scale-90 transition-all">
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="text-xs font-semibold tracking-widest uppercase text-gold/80 hover:text-gold active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8 pb-safe-bottom">
        <CategorizedInterestPicker title="What Defines You" description="Choose as many as you like"
          categories={INTEREST_CATEGORIES} selected={interestsHave} onToggle={(val) => toggle('have', val)}
          dataTestIdPrefix={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'interest-have' : undefined} />

        <CategorizedInterestPicker title={isWoman ? "What You Value In Him" : "What You Value In Her"} description="Choose as many as you like"
          categories={INTEREST_CATEGORIES} selected={lookingFor} onToggle={(val) => toggle('looking', val)}
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
