'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Flame,
  MessageCircle,
  Coins,
  Settings,
  UserCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';
import { useOnboardingStore, useUserStore } from '@/lib/store';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';

const slides = [
  {
    id: 0,
    title: 'Respect & Inclusivity',
    desc: 'Every traveler is treated with dignity. Kind, welcoming, judgment-free journeys for everyone.',
    icon: <ShieldCheck className="w-10 h-10 text-rose-600" />,
    badge: 'Core Value',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconBg: 'bg-rose-500/15 border-rose-200',
    cardBorder: 'border-rose-200/90 bg-gradient-to-br from-rose-50/95 via-white to-amber-50/70',
  },
  {
    id: 1,
    title: 'Reliability & Trust',
    desc: 'Be dependable with trip commitments, meetup points, vehicle arrangements, and shared budgets.',
    icon: <Flame className="w-10 h-10 text-emerald-700" />,
    badge: 'Commitment',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-500/15 border-emerald-200',
    cardBorder: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/70',
  },
  {
    id: 2,
    title: 'Safety First',
    desc: 'Honor personal boundaries, travel with verified members, and report any uncomfortable behavior instantly.',
    icon: <MessageCircle className="w-10 h-10 text-cyan-700" />,
    badge: 'Zero Tolerance',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconBg: 'bg-cyan-500/15 border-cyan-200',
    cardBorder: 'border-cyan-200/90 bg-gradient-to-br from-cyan-50/95 via-white to-sky-50/70',
  },
];

export default function RulesPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loopedSlides = [0, 1, 2].flatMap((loop) =>
    slides.map((slide) => ({ ...slide, loopKey: `${loop}-${slide.id}` }))
  );

  useEffect(() => {
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
    router.prefetch('/onboard/how-it-works');
  }, [supabase, router]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = slides.length * track.clientWidth;
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveSlide(((index % slides.length) + slides.length) % slides.length);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const settledIndex = Math.round(track.scrollLeft / track.clientWidth);
      if (settledIndex < slides.length || settledIndex >= slides.length * 2) {
        const mod = ((settledIndex % slides.length) + slides.length) % slides.length;
        track.scrollTo({ left: (slides.length + mod) * track.clientWidth, behavior: 'auto' });
      }
    }, 150);
  };

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    const base = current - (((current % slides.length) + slides.length) % slides.length);
    track.scrollTo({ left: (base + index) * track.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const current = Math.round(track.scrollLeft / track.clientWidth);
      const next = current + 1;
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
      setActiveSlide(((next % slides.length) + slides.length) % slides.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const persona = useOnboardingStore((s) => s.persona);
  const currentUser = useUserStore((s) => s.user);

  const handleContinue = async () => {
    hapticTap();
    goTo('/trips', '/onboarding/hero.jpg');
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
      <OnboardingBackground image="/onboarding/rules.jpg" />
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 justify-center">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-1.5">Community Code</h1>
          <p className="text-stone-600 text-sm font-medium">How we keep adventures safe and fun for everyone</p>
        </div>

        <div className="flex flex-col justify-center">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {loopedSlides.map((slide) => (
              <div key={slide.loopKey} className="w-full shrink-0 snap-center px-1">
                <div className={`flex flex-col items-center text-center px-7 py-9 rounded-[32px] min-h-[350px] justify-between border-2 shadow-sm ${slide.cardBorder}`}>
                  <div className="w-full flex justify-end">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${slide.badgeColor}`}>
                      {slide.badge}
                    </span>
                  </div>
                  <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center shadow-xs ${slide.iconBg}`}>
                    {slide.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-extrabold text-[#382A21] mb-2.5">
                      {slide.title}
                    </h2>
                    <p className="text-stone-700 text-sm leading-relaxed font-medium max-w-[280px]">
                      {slide.desc}
                    </p>
                  </div>
                  <div className="w-6 h-1 rounded-full bg-stone-300/60" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 mb-6">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => { hapticTap(); scrollToSlide(i); }}
                aria-label={`Go to rule ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'w-7 h-2 bg-[#1D3B2A] shadow-xs' : 'w-2 h-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="btn-primary w-full py-4 font-bold text-sm active:scale-95 transition-transform shadow-lg"
          >
            Agree & Enter GreenFlag
          </button>
        </div>
      </div>
    </div>
  );
}
