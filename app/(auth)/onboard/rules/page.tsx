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
import { LoadingLogo } from '@/components/shared/LoadingLogo';

// Streamlined to 3 key rules (was 6)
const slides = [
  {
    id: 0,
    title: 'Respect Is Standard',
    desc: 'Every profile is treated with regard. No exceptions.',
    icon: <ShieldCheck className="w-10 h-10 text-gold" />,
  },
  {
    id: 1,
    title: 'Keep It Intentional',
    desc: 'Show up genuinely. No spam, no mass messages.',
    icon: <Flame className="w-10 h-10 text-gold" />,
  },
  {
    id: 2,
    title: 'Discretion First',
    desc: 'Share personal details only when you feel safe to.',
    icon: <MessageCircle className="w-10 h-10 text-gold" />,
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

  // Renders 3 copies of the slide list back to back and starts scrolled
  // into the middle copy, so swiping either direction always has real
  // content to land on instead of stopping dead at slide 0 or the last
  // slide. Once a swipe settles, handleScroll snaps (instantly, no
  // animation) back into the middle copy at the equivalent slide -- the
  // user never sees the seam, and the buffer never runs out no matter how
  // many times they keep swiping the same direction.
  const loopedSlides = [0, 1, 2].flatMap((loop) =>
    slides.map((slide) => ({ ...slide, loopKey: `${loop}-${slide.id}` }))
  );

  // Persona/approval routing now lives in the how-it-works screen this
  // leads to -- this just confirms there's still a live session.
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

  // Start centered in the middle copy so the first swipe in either
  // direction already has a neighboring copy to land on.
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

  // Auto-advances so the rules actually get seen instead of sitting on
  // slide 1 waiting for a swipe -- still fully swipeable manually at any
  // point, this just keeps things moving on their own too. Always steps
  // forward by one real slide (never wraps backward visually) so it stays
  // consistent with the infinite-swipe behavior above.
  useEffect(() => {
    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const current = Math.round(track.scrollLeft / track.clientWidth);
      const next = current + 1;
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
      setActiveSlide(((next % slides.length) + slides.length) % slides.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const handleContinue = () => {
    hapticTap();
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
      <div className="max-w-md mx-auto w-full flex flex-col pb-safe-bottom flex-1">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-ink/40 hover:text-ink active:scale-90 transition-all p-1 -ml-1 w-fit"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Carousel + dots + CTA center as one group instead of the
            button being pinned flush to the bottom edge. */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {loopedSlides.map((slide) => (
              <div key={slide.loopKey} className="w-full shrink-0 snap-center px-1">
                <div
                  className="flex flex-col items-center text-center px-6 py-10 border border-gold/20 rounded-[2rem] min-h-[380px] justify-center shadow-[0_0_40px_-16px_rgba(210,4,45,0.35)]"
                  style={{ background: 'linear-gradient(160deg, rgba(210,4,45,0.08) 0%, rgba(15,10,10,0.5) 55%)' }}
                >
                  <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-7 shadow-[0_0_24px_-6px_rgba(210,4,45,0.5)]">
                    {slide.icon}
                  </div>
                  <h2 className="text-2xl font-display font-semibold text-ink mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-ink/50 text-sm italic leading-relaxed max-w-[300px] font-light">
                    {slide.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dot pagination -- tap a dot to jump, or swipe the carousel */}
          <div className="flex items-center justify-center gap-2 mt-5 mb-8">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => scrollToSlide(i)}
                aria-label={`Go to rule ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'w-6 h-1.5 bg-gold shadow-[0_0_10px_-1px_rgba(210,4,45,0.8)]' : 'w-1.5 h-1.5 bg-raised'
                }`}
              />
            ))}
          </div>

          {/* Single button -- swipe through as many or as few rules as you
              like, one tap moves on regardless of which slide you're on. */}
          <button
            onClick={handleContinue}
            className="btn-primary w-full py-4 font-semibold text-sm active:scale-95 transition-transform shadow-[0_0_30px_-10px_rgba(210,4,45,0.6)]"
          >
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
