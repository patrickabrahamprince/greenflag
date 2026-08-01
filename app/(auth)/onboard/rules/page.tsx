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

// Define each slide with an icon, title, and description.
const slides = [
  {
    id: 0,
    title: 'Respect Is Standard',
    desc: 'Every profile is treated with regard. No exceptions.',
    icon: <ShieldCheck className="w-10 h-10 text-gold" />,
  },
  {
    id: 1,
    title: 'No Noise',
    desc: 'Keep it intentional. No spam, no mass messages.',
    icon: <Flame className="w-10 h-10 text-gold" />,
  },
  {
    id: 2,
    title: 'Discretion First',
    desc: 'Share personal details only when you feel safe to.',
    icon: <MessageCircle className="w-10 h-10 text-gold" />,
  },
  {
    id: 3,
    title: 'Intention Has Value',
    desc: 'Show up genuinely. Effort is seen and valued.',
    icon: <Coins className="w-10 h-10 text-gold" />,
  },
  {
    id: 4,
    title: 'Your Circle, Your Rules',
    desc: 'Manage privacy and preferences in Settings.',
    icon: <Settings className="w-10 h-10 text-gold" />,
  },
  {
    id: 5,
    title: 'Verified Profiles',
    desc: 'Verified profiles are prioritized and distinguished.',
    icon: <UserCheck className="w-10 h-10 text-gold" />,
  },
];

export default function RulesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

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
  }, [supabase, router]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveSlide(Math.min(slides.length - 1, Math.max(0, index)));
  };

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  // Auto-advances so the rules actually get seen instead of sitting on
  // slide 1 waiting for a swipe -- still fully swipeable manually at any
  // point, this just keeps things moving on their own too.
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % slides.length;
        scrollToSlide(next);
        return next;
      });
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const handleContinue = () => {
    hapticTap();
    router.push('/onboard/how-it-works');
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
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
            {slides.map((slide) => (
              <div key={slide.id} className="w-full shrink-0 snap-center px-1">
                <div
                  className="flex flex-col items-center text-center px-6 py-10 border border-gold/20 rounded-[2rem] min-h-[380px] justify-center shadow-[0_0_40px_-16px_rgba(192,38,211,0.35)]"
                  style={{ background: 'linear-gradient(160deg, rgba(192,38,211,0.1) 0%, rgba(28,28,30,0.9) 55%)' }}
                >
                  <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-7 shadow-[0_0_24px_-6px_rgba(192,38,211,0.5)]">
                    {slide.icon}
                  </div>
                  <h2 className="text-3xl font-display font-semibold text-ink mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-[#9DA0A6] text-base leading-relaxed max-w-[300px] font-light">
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
                  i === activeSlide ? 'w-6 h-1.5 bg-gold shadow-[0_0_10px_-1px_rgba(192,38,211,0.8)]' : 'w-1.5 h-1.5 bg-[#3C3C3E]'
                }`}
              />
            ))}
          </div>

          {/* Single button -- swipe through as many or as few rules as you
              like, one tap moves on regardless of which slide you're on. */}
          <button
            onClick={handleContinue}
            className="btn-primary w-full py-4 font-semibold text-sm active:scale-95 transition-transform shadow-[0_0_30px_-10px_rgba(192,38,211,0.6)]"
          >
            Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
