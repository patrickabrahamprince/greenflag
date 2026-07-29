'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ShieldCheck, Clock, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { SocialProofLine } from '@/components/shared/SocialProofLine';
import toast from 'react-hot-toast';

const POINTS = [
  {
    icon: <CalendarDays className="w-6 h-6 text-gold" />,
    title: '3 Days, 3 Intentions',
    desc: 'Each day: one thought, one image, one voice. Simple. Honest.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-gold" />,
    title: 'Sincerity Is Currency',
    desc: 'Real answers open doors. Effort is seen.',
  },
  {
    icon: <Clock className="w-6 h-6 text-gold" />,
    title: 'She Sets The Pace',
    desc: 'After each day, she reviews. The next day unlocks after.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-gold" />,
    title: 'Earn The Conversation',
    desc: 'Complete all three days with intention, and the conversation begins.',
  },
];

export default function HowItWorksPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);
  const [persona, setPersona] = useState<'man' | 'woman' | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const setGlobalUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired. Please sign in again.');
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('persona, approval_status')
        .eq('id', user.id)
        .single();
      setPersona(profile?.persona as 'man' | 'woman' | null);
      setApprovalStatus((profile as { approval_status?: string })?.approval_status ?? null);
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  const handleContinue = async () => {
    setContinuing(true);

    // The 90s review countdown (shown on /onboard/pending for women, and
    // as a top banner via BottomNav for men browsing Discover while
    // pending) needs its own start time -- anchoring it to account
    // creation meant it was already expired for anyone who took more than
    // 90s to get through the rest of onboarding (phone OTP, profile,
    // quiz, interests, rules), which is most real users.
    if (approvalStatus === 'pending') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ review_started_at: new Date().toISOString() }).eq('id', user.id);
        const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (freshProfile) setGlobalUser(freshProfile as any);
      }
    }

    // Pending women wait for admin review on a dedicated screen; pending men
    // go straight into Discover, where browsing while pending is allowed.
    if (approvalStatus === 'pending' && persona !== 'man') {
      router.push('/onboard/pending');
      return;
    }
    if (persona === 'woman') {
      router.push('/standard/builder');
    } else {
      router.push('/discover');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center pb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">How Greenflag Works</h1>
          <p className="text-[#9DA0A6] text-sm">Three days. One real connection.</p>
        </div>

        <div className="space-y-4">
          {POINTS.map((point) => (
            <div key={point.title} className="flex gap-4 bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gold/10 flex items-center justify-center">
                {point.icon}
              </div>
              <div>
                <h3 className="text-ink font-semibold text-sm mb-1">{point.title}</h3>
                <p className="text-[#9DA0A6] text-xs leading-relaxed font-light">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <SocialProofLine className="text-center text-xs text-gold/70 font-medium mt-6" />

        <button
          onClick={handleContinue}
          disabled={continuing}
          className="btn-primary w-full py-4 mt-3 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Let's Begin"}
        </button>
      </div>
    </div>
  );
}
