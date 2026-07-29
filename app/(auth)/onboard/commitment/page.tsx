'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import toast from 'react-hot-toast';

const STATEMENTS = [
  "I want something real, even if it takes effort.",
  "I'm done wasting time on people who aren't serious.",
  "I'm ready to show up consistently for the right person.",
  "I want to earn this, not just swipe into it.",
];

// A stated commitment before he ever spends a coin -- Cialdini's
// commitment/consistency principle: having declared an intention out
// loud makes someone more likely to follow through on it later, which is
// exactly what "Meet Her Standard" (500 coins, 3 real days) asks of him.
// Men only -- women don't have an equivalent coin-spending moment this
// early, and get real hands-on investment via the Standard builder
// itself a few screens later.
export default function CommitmentPage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (persona && persona !== 'man') {
      router.replace('/onboard/how-it-works');
      return;
    }
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired. Please sign in again.');
        router.replace('/login');
        return;
      }
      setLoading(false);
    };
    checkSession();
  }, [persona, supabase, router]);

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Choose the one that fits');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // commitment_statement is real (20261227000000_commitment_statement.sql)
        // but not yet in the generated Supabase types.
        await supabase.from('profiles').update({ commitment_statement: selected } as any).eq('id', user.id);
      }
      router.push('/onboard/preview');
    } finally {
      setSaving(false);
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
      <button
        onClick={() => router.push('/onboard/rules')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-display text-2xl text-ink mb-2">Before you begin</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          What matters most to you in a connection right now?
        </p>

        <div className="space-y-3">
          {STATEMENTS.map((statement) => {
            const isSelected = selected === statement;
            return (
              <button
                key={statement}
                onClick={() => setSelected(statement)}
                className={`w-full py-4 px-5 rounded-xl text-left text-sm transition-all duration-200 flex items-center justify-between gap-3 border ${
                  isSelected
                    ? 'bg-gold/10 border-gold text-ink font-medium'
                    : 'bg-[#1C1C1E] border-[#2A2A2A] text-ink/70 hover:border-ink/30'
                }`}
              >
                <span>{statement}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          onClick={handleContinue}
          disabled={saving || !selected}
          className="btn-primary w-full py-4 mt-8 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Continue <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </div>
    </div>
  );
}
