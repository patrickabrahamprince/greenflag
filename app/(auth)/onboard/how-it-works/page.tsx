'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ShieldCheck, Clock, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { SocialProofLine } from '@/components/shared/SocialProofLine';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';

const POINTS = [
  {
    icon: <CalendarDays className="w-8 h-8 text-gold" />,
    step: 'Day 1-3',
    title: '3 Days, 3 Intentions',
    desc: 'Each day: one thought, one image, one voice. Simple. Honest.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-gold" />,
    step: 'Every day',
    title: 'Sincerity Is Currency',
    desc: 'Real answers open doors. Effort is seen.',
  },
  {
    icon: <Clock className="w-8 h-8 text-gold" />,
    step: 'After each day',
    title: 'She Sets The Pace',
    desc: 'After each day, she reviews. The next day unlocks after.',
  },
  {
    icon: <Sparkles className="w-8 h-8 text-gold" />,
    step: 'The payoff',
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
  const [step, setStep] = useState(0);
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
    hapticTap();
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
      <div className="min-h-dvh flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center pb-safe-bottom">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">How Greenflag Works</h1>
          <p className="text-[#9DA0A6] text-sm">Three days. One real connection.</p>
        </div>

        {/* Tap through one point at a time instead of a static wall of
            four cards -- same content, but it now asks for a tap before
            revealing the next step. */}
        <button
          type="button"
          onClick={() => { hapticTap(); setStep((s) => (s + 1) % POINTS.length); }}
          className="w-full text-left bg-[#1C1C1E] border border-gold/20 rounded-3xl p-6 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-semibold tracking-widest text-gold uppercase">{POINTS[step].step}</span>
            <span className="text-[10px] text-ink/30">{step + 1} / {POINTS.length}</span>
          </div>
          <div key={step} className="animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              {POINTS[step].icon}
            </div>
            <h3 className="text-ink font-display text-xl mb-2">{POINTS[step].title}</h3>
            <p className="text-[#9DA0A6] text-sm leading-relaxed font-light">{POINTS[step].desc}</p>
          </div>
        </button>

        <div className="flex items-center justify-center gap-2 mt-4">
          {POINTS.map((point, i) => (
            <button
              key={point.title}
              onClick={() => { hapticTap(); setStep(i); }}
              aria-label={`Go to point ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-6 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-[#3C3C3E]'
              }`}
            />
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
