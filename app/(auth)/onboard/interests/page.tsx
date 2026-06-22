'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { InterestTagGrid } from '@/components/discovery/InterestTagGrid';
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
  const [whyMePrompts, setWhyMePrompts] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePromptChange = (index: number, value: string) => {
    setWhyMePrompts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const validateMan = (): boolean => {
    if (!validate(isWoman)) return false;
    if (!isWoman) {
      const allFilled = whyMePrompts.every((p) => p.trim().length >= 50);
      if (!allFilled) { toast.error('Each reason must be at least 50 characters'); return false; }
      const allValid = whyMePrompts.every((p) => p.trim().length <= 150);
      if (!allValid) { toast.error('Each reason must be 150 characters or fewer'); return false; }
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateMan()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    if (isWoman) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, interests_have: interestsHave, interests_looking_for: lookingFor,
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, interests_have: interestsHave,
        why_me_prompts: whyMePrompts.map((p) => p.trim()),
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
    }
    setLoading(false);
    toast.success('Profile completed!');
    router.replace('/discover');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6">
      <button onClick={() => router.push('/onboard/profile')} className="text-[#8E8E93] hover:text-white transition-colors mb-6 w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 max-w-md mx-auto w-full space-y-8 pb-8">
        <InterestTagGrid title="5 things about you" description="Pick exactly 5"
          options={INTEREST_TAGS} selected={interestsHave} max={5} onToggle={(i) => toggle('have', i)} />

        {isWoman ? (
          <InterestTagGrid title="5 things you&apos;re looking for in him" description="Pick exactly 5"
            options={INTEREST_TAGS} selected={lookingFor} max={5} onToggle={(i) => toggle('looking', i)} />
        ) : (
          <WhyMePrompts prompts={whyMePrompts} onPromptChange={handlePromptChange} />
        )}

        <button onClick={handleContinue} disabled={loading}
          className="btn-primary w-full active:scale-[0.98] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete'}
        </button>
      </div>
    </div>
  );
}
