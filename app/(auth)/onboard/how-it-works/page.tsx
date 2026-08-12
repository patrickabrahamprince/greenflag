'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ShieldCheck, Clock, Sparkles, Loader2 } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useOnboardingStore } from '@/lib/store';
import { SocialProofLine } from '@/components/shared/SocialProofLine';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

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
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Same infinite-swipe trick as the House Rules carousel: three copies of
  // the point list back to back, starting centered in the middle copy, so
  // swiping past either end always lands on real content instead of
  // stopping dead.
  const loopedPoints = [0, 1, 2].flatMap((loop) =>
    POINTS.map((point, i) => ({ ...point, loopKey: `${loop}-${i}` }))
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = POINTS.length * track.clientWidth;
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setStep(((index % POINTS.length) + POINTS.length) % POINTS.length);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const settledIndex = Math.round(track.scrollLeft / track.clientWidth);
      if (settledIndex < POINTS.length || settledIndex >= POINTS.length * 2) {
        const mod = ((settledIndex % POINTS.length) + POINTS.length) % POINTS.length;
        track.scrollTo({ left: (POINTS.length + mod) * track.clientWidth, behavior: 'auto' });
      }
    }, 150);
  };

  const scrollToStep = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    const base = current - (((current % POINTS.length) + POINTS.length) % POINTS.length);
    track.scrollTo({ left: (base + index) * track.clientWidth, behavior: 'smooth' });
  };


  const handleContinue = async () => {
    hapticTap();
    setContinuing(true);
    goTo('/discover', '/onboarding/hero.jpg');
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image="/onboarding/how-it-works.jpg" />
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center pb-safe-bottom">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">How Greenflag Works</h1>
          <p className="text-ink/50 text-sm">Three days. One real connection.</p>
        </div>

        {/* Swipeable carousel (matches the House Rules screen) instead of
            a tap-only card -- swipes forever in either direction, same
            underlying four points. */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {loopedPoints.map((point) => (
            <div key={point.loopKey} className="w-full shrink-0 snap-center px-1">
              <div className="text-left bg-black/15 backdrop-blur-sm border border-gold/20 rounded-3xl p-6 min-h-[340px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-semibold tracking-widest text-gold uppercase">{point.step}</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  {point.icon}
                </div>
                <h3 className="text-ink font-display text-xl mb-2">{point.title}</h3>
                <p className="text-ink/50 text-sm leading-relaxed font-light">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {POINTS.map((point, i) => (
            <button
              key={point.title}
              onClick={() => { hapticTap(); scrollToStep(i); }}
              aria-label={`Go to point ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-6 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-raised'
              }`}
            />
          ))}
        </div>

        <SocialProofLine className="text-center text-[11px] text-gold/70 font-medium mt-6" />

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
