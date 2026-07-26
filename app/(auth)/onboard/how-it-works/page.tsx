'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ShieldCheck, Clock, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const POINTS = [
  {
    icon: <CalendarDays className="w-6 h-6 text-gold" />,
    title: '3 Days, 3 Tasks a Day',
    desc: 'Every day for 3 days, you get 3 tasks — one text, one photo, one voice note. Quick, honest, real.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-gold" />,
    title: 'Be Honest to Earn It',
    desc: 'Real answers build real connection. Half-effort or dishonest submissions get noticed — and rejected.',
  },
  {
    icon: <Clock className="w-6 h-6 text-gold" />,
    title: 'She Reviews, You Wait',
    desc: "After each day's tasks, she has a 24-hour window to review before tomorrow's tasks unlock.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-gold" />,
    title: 'Earn the Match',
    desc: 'Finish all 3 days with sincerity, and you unlock a real conversation with her.',
  },
];

export default function HowItWorksPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);
  const [persona, setPersona] = useState<'man' | 'woman' | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired');
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

  const handleContinue = () => {
    setContinuing(true);
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
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 pb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">How GreenFlag Works</h1>
          <p className="text-[#9DA0A6] text-sm">The 3-day path to a real connection</p>
        </div>

        <div className="space-y-4 flex-1">
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

        <button
          onClick={handleContinue}
          disabled={continuing}
          className="btn-primary w-full py-4 mt-8 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Got it — let's go"}
        </button>
      </div>
    </div>
  );
}
