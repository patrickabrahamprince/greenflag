'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Type as TypeIcon, Camera, Mic, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import toast from 'react-hot-toast';

const SAMPLE_PROMPT = "What's something you're proud of?";

// Lets him actually touch the core mechanic before committing to
// anything, instead of only being told about it (the House Rules
// carousel and How It Works list that surround this are both purely
// explanatory). This answer is never saved or sent anywhere -- it's
// just a feel for the real thing. Men only, same reasoning as
// /onboard/commitment.
export default function PreviewPage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (revealed) {
    return (
      <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center px-6 bg-[#000000] text-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-gold" />
            </div>
            <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-gold" />
            </div>
            <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Mic className="w-5 h-5 text-gold" />
            </div>
          </div>
          <h1 className="font-display text-2xl text-ink mb-3">That's the idea.</h1>
          <p className="text-ink/60 text-sm leading-relaxed mb-10">
            Every day, you'll answer three like that — one thought, one image, one voice.
            She reviews all three before the next day unlocks.
          </p>
          <button
            onClick={() => router.push('/onboard/how-it-works')}
            className="btn-primary w-full py-4 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/commitment')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <p className="text-gold text-xs uppercase tracking-widest font-medium mb-2">Try it</p>
        <h1 className="font-display text-2xl text-ink mb-2">
          Someone might ask you this on Day 1:
        </h1>
        <div className="flex items-center gap-2 mb-6 mt-2">
          <TypeIcon className="w-4 h-4 text-gold" />
          <span className="text-xs text-ink/50 uppercase tracking-wide">Thought</span>
        </div>
        <p className="text-ink text-lg font-display mb-6">"{SAMPLE_PROMPT}"</p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type a real answer — this one's just for you, nothing is saved."
          rows={4}
          className="input resize-none text-sm"
        />

        <div className="flex-1" />

        <button
          onClick={() => setRevealed(true)}
          disabled={answer.trim().length < 5}
          className="btn-primary w-full py-4 mt-8 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-40"
        >
          That felt easy enough
        </button>
      </div>
    </div>
  );
}
