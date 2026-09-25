'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Users, MessageCircle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
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
    icon: <Plane className="w-8 h-8 text-emerald-400" />,
    step: 'Discover & Host',
    title: 'Any Trip or Adventure',
    desc: 'Road trips, mountain treks, beach getaways, cafe crawls, or camping — browse open trips or post your own with split costs.',
    tip: 'Choose between co-ed trips and verified female-only travel buddy circles.',
  },
  {
    icon: <Users className="w-8 h-8 text-emerald-400" />,
    step: 'Meet People for Trips',
    title: 'Explore Together',
    desc: 'Connect with people who share your travel pace, dream destinations, and adventure vibes.',
    tip: 'Connect directly with travelers heading to your favorite spots.',
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-emerald-400" />,
    step: 'Request & Coordinate',
    title: 'Direct Chat Unlocks',
    desc: 'Send a quick intro note to join an adventure. Once accepted, chat unlocks immediately to plan rides and stays.',
    tip: 'No endless swiping games — real connections around real travel plans.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
    step: 'Safe Community',
    title: 'Verified & Accountable',
    desc: 'Host approval gates, profile verifications, and community reporting keep every road trip safe and respectful.',
    tip: 'Mutual confirmation ensures trust and accountability on every trip.',
  },
];

export default function HowItWorksPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const bio = useOnboardingStore((s) => s.bio);
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
    // If bio is set, we're past onboarding flow - go to discover
    if (bio) {
      goTo('/trips', '/onboarding/hero.jpg');
    } else {
      // Otherwise, go to name entry
      goTo('/onboard/name', '/onboarding/name.jpg');
    }
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
          <p className="text-ink/50 text-sm">Meet new people. Explore the world together.</p>
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
              <div className="text-left bg-base rounded-3xl p-6 min-h-[360px] flex flex-col justify-between border border-gold/15 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                      {point.icon}
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                      {point.step}
                    </span>
                  </div>
                  <h3 className="text-ink font-display text-xl mb-2">{point.title}</h3>
                  <p className="text-ink/60 text-sm leading-relaxed font-light">{point.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-raised/50 flex items-center gap-2 text-xs text-ink/70">
                  <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{point.tip}</span>
                </div>
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

        <SocialProofLine className="text-center text-xs text-ink font-medium mt-6 leading-relaxed max-w-[280px] mx-auto" />

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
