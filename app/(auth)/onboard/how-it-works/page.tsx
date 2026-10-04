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
    icon: <Plane className="w-8 h-8 text-stone-900" />,
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
    step: 'Discover & Host',
    title: 'Weekend Getaways & Road Trips',
    desc: 'Road trips, mountain treks, beach getaways, coffee estate homestays, and sunrise drives — browse open getaways or post your own.',
    tip: 'Choose between co-ed getaways and verified female-only travel buddy circles.',
  },
  {
    icon: <Users className="w-8 h-8 text-stone-900" />,
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
    step: 'Natural Dating & Sparks',
    title: 'Date on the Way, Not Online',
    desc: 'Sparks happen organically over scenic highway drives, beach sunsets, and cozy cafe stops. No forced small talk.',
    tip: 'Connect directly with travelers who share your exact travel pace and dating vibe.',
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-stone-900" />,
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
    step: 'Double-Blind Sparks',
    title: 'Mutual Match & Instant Chat',
    desc: 'Send a travel spark or request to join a trip. When mutual interest matches, chat unlocks immediately to plan rides and stays.',
    tip: 'Zero swipe fatigue — real sparks built around exciting travel itineraries.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-stone-900" />,
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
    step: 'Safe Community',
    title: '100% Verified & Respectful',
    desc: 'Mandatory ID verification, public daytime coffee meetups, and community ratings ensure a safe, high-trust environment.',
    tip: 'Mutual respect and safety guidelines are strictly enforced on every journey.',
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

  const currentUser = useUserStore((s) => s.user);

  const handleContinue = async () => {
    hapticTap();
    setContinuing(true);
    if (currentUser?.onboarding_completed) {
      goTo('/trips', '/onboarding/hero.jpg');
    } else {
      goTo('/onboard/name', '/onboarding/name.jpg');
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white text-stone-900 overflow-hidden">
      <OnboardingBackground image="/onboarding/how-it-works.jpg" />
      
      {/* Frozen Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-5 border-b border-stone-100/80 text-center">
        <h1 className="font-display text-2xl font-extrabold text-stone-900 mb-0.5">How GreenFlag Works</h1>
        <p className="text-stone-500 text-xs font-medium">Meet new people. Explore the world together.</p>
      </header>

      {/* Fluid Scrollable Body */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col justify-between pb-safe-bottom">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-2">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {loopedPoints.map((point) => (
              <div key={point.loopKey} className="w-full shrink-0 snap-center px-1">
                <div className={`text-left rounded-[32px] p-6 min-h-[290px] flex flex-col justify-between border shadow-sm ${point.cardBorder}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs ${point.iconBg}`}>
                        {point.icon}
                      </div>
                      <span className={`text-[11px] font-bold tracking-wider uppercase border px-3 py-1 rounded-full ${point.badgeBg}`}>
                        {point.step}
                      </span>
                    </div>
                    <h3 className="text-stone-900 font-display text-xl sm:text-2xl font-bold mb-1.5">{point.title}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">{point.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-2 text-xs font-semibold text-stone-700">
                    <Sparkles className="w-4 h-4 text-stone-900 shrink-0" />
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
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === step ? 'w-7 h-2 bg-[#1C1C1E]' : 'w-2 h-2 bg-stone-200'
                }`}
              />
            ))}
          </div>

          <SocialProofLine className="text-center text-xs text-stone-500 font-semibold mt-4 leading-relaxed max-w-[280px] mx-auto" />
        </div>

        <div className="max-w-md mx-auto w-full pt-2">
          <button
            onClick={handleContinue}
            disabled={continuing}
            className="w-full py-4 bg-[#1C1C1E] hover:bg-black text-white font-bold text-sm rounded-full active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {continuing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Let's Begin"}
          </button>
        </div>
      </main>
    </div>
  );
}
