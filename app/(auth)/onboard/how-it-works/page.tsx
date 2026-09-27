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
    icon: <Plane className="w-8 h-8 text-orange-600" />,
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    iconBg: 'bg-orange-500/15 border-orange-200/80',
    cardBorder: 'border-orange-200/90 bg-gradient-to-br from-orange-50/95 via-white to-amber-50/70',
    step: 'Discover & Host',
    title: 'Any Trip or Adventure',
    desc: 'Road trips, mountain treks, beach getaways, cafe crawls, or camping — browse open trips or post your own with split costs.',
    tip: 'Choose between co-ed trips and verified female-only travel buddy circles.',
  },
  {
    icon: <Users className="w-8 h-8 text-emerald-700" />,
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-500/15 border-emerald-200/80',
    cardBorder: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/70',
    step: 'Meet People for Trips',
    title: 'Explore Together',
    desc: 'Connect with people who share your travel pace, dream destinations, and adventure vibes.',
    tip: 'Connect directly with travelers heading to your favorite spots.',
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-cyan-700" />,
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconBg: 'bg-cyan-500/15 border-cyan-200/80',
    cardBorder: 'border-cyan-200/90 bg-gradient-to-br from-cyan-50/95 via-white to-sky-50/70',
    step: 'Request & Coordinate',
    title: 'Direct Chat Unlocks',
    desc: 'Send a quick intro note to join an adventure. Once accepted, chat unlocks immediately to plan rides and stays.',
    tip: 'No endless swiping games — real connections around real travel plans.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-purple-700" />,
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-500/15 border-purple-200/80',
    cardBorder: 'border-purple-200/90 bg-gradient-to-br from-purple-50/95 via-white to-rose-50/70',
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
    if (bio) {
      goTo('/trips', '/onboarding/hero.jpg');
    } else {
      goTo('/onboard/name', '/onboarding/name.jpg');
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAF9F6]">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/how-it-works.jpg" />
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-1.5">How GreenFlag Works</h1>
          <p className="text-[#382A21]/70 text-sm font-medium">Meet new people. Explore the world together.</p>
        </div>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {loopedPoints.map((point) => (
            <div key={point.loopKey} className="w-full shrink-0 snap-center px-1">
              <div className={`text-left rounded-[32px] p-7 min-h-[350px] flex flex-col justify-between border-2 shadow-sm ${point.cardBorder}`}>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xs ${point.iconBg}`}>
                      {point.icon}
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase border px-3 py-1 rounded-full ${point.badgeBg}`}>
                      {point.step}
                    </span>
                  </div>
                  <h3 className="text-[#382A21] font-display text-2xl font-bold mb-2.5">{point.title}</h3>
                  <p className="text-[#382A21]/80 text-sm leading-relaxed font-normal">{point.desc}</p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-stone-200/70 flex items-center gap-2 text-xs font-semibold text-[#382A21]/90">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{point.tip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          {POINTS.map((point, i) => (
            <button
              key={point.title}
              onClick={() => { hapticTap(); scrollToStep(i); }}
              aria-label={`Go to point ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-7 h-2 bg-[#1D3B2A] shadow-xs' : 'w-2 h-2 bg-stone-300'
              }`}
            />
          ))}
        </div>

        <SocialProofLine className="text-center text-xs text-[#382A21]/70 font-semibold mt-5 leading-relaxed max-w-[280px] mx-auto" />

        <button
          onClick={handleContinue}
          disabled={continuing}
          className="btn-primary w-full py-4 mt-4 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg"
        >
          {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Let's Begin"}
        </button>
      </div>
    </div>
  );
}
