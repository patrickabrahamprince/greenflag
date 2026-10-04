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
    icon: <ShieldCheck className="w-10 h-10 text-stone-900" />,
    badge: 'Core Value',
    badgeColor: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
  },
  {
    id: 1,
    title: 'Reliability & Trust',
    desc: 'Be dependable with trip commitments, meetup points, vehicle arrangements, and shared budgets.',
    icon: <Flame className="w-10 h-10 text-stone-900" />,
    badge: 'Commitment',
    badgeColor: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
  },
  {
    id: 2,
    title: 'Safety First',
    desc: 'Honor personal boundaries, travel with verified members, and report any uncomfortable behavior instantly.',
    icon: <MessageCircle className="w-10 h-10 text-stone-900" />,
    badge: 'Zero Tolerance',
    badgeColor: 'bg-stone-100 text-stone-900 border-stone-200',
    iconBg: 'bg-stone-100 border-stone-200',
    cardBorder: 'border-stone-200 bg-white',
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
  const setGlobalUser = useUserStore((s) => s.setUser);

  const handleContinue = async () => {
    hapticTap();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          onboarding_completed: true,
          approval_status: 'approved',
          review_started_at: new Date().toISOString(),
        }).eq('id', user.id);

        const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (freshProfile) setGlobalUser(freshProfile as any);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Error completing onboarding:', err);
    }
    setLoading(false);
    toast.success('Welcome to GreenFlag!');
    goTo('/trips', '/onboarding/hero.jpg');
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
      <OnboardingBackground image="/onboarding/rules.jpg" />
      
      {/* Frozen Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-5 border-b border-stone-100/80 text-center">
        <h1 className="font-display text-2xl font-extrabold text-stone-900 mb-0.5">Community Code</h1>
        <p className="text-stone-500 text-xs font-medium">How we keep adventures safe and fun for everyone</p>
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
            {loopedSlides.map((slide) => (
              <div key={slide.loopKey} className="w-full shrink-0 snap-center px-1">
                <div className={`flex flex-col items-center text-center px-6 py-6 rounded-[32px] min-h-[290px] justify-between border shadow-sm ${slide.cardBorder}`}>
                  <div className="w-full flex justify-end">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${slide.badgeColor}`}>
                      {slide.badge}
                    </span>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-xs my-2 ${slide.iconBg}`}>
                    {slide.icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-stone-900 mb-1.5">
                      {slide.title}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal max-w-[280px]">
                      {slide.desc}
                    </p>
                  </div>
                  <div className="w-6 h-1 rounded-full bg-stone-200 mt-2" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 mb-3">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => { hapticTap(); scrollToSlide(i); }}
                aria-label={`Go to rule ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeSlide ? 'w-7 h-2 bg-[#1C1C1E]' : 'w-2 h-2 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pt-2">
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-[#1C1C1E] hover:bg-black text-white font-bold text-sm rounded-full active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            Agree & Enter GreenFlag
          </button>
        </div>
      </main>
    </div>
  );
}
