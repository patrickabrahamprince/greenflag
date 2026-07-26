'use client';

import { useEffect, useState } from 'react';
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
import toast from 'react-hot-toast';

// Define each slide with an icon, title, and description.
const slides = [
  {
    id: 0,
    title: 'Be Respectful',
    desc: 'Treat every member with kindness and respect. Harassment or hateful language is not allowed.',
    icon: <ShieldCheck className="w-8 h-8 text-gold" />,
  },
  {
    id: 1,
    title: 'No Spam',
    desc: 'Avoid sending unsolicited messages or repetitive content. Keep conversations meaningful.',
    icon: <Flame className="w-8 h-8 text-gold" />,
  },
  {
    id: 2,
    title: 'Stay Safe',
    desc: 'Never share personal information like phone numbers or addresses until you trust the other party.',
    icon: <MessageCircle className="w-8 h-8 text-gold" />,
  },
  {
    id: 3,
    title: 'Earn Coins',
    desc: 'Engage with the community to earn coins. Use them for boosts, profile upgrades, and more.',
    icon: <Coins className="w-8 h-8 text-gold" />,
  },
  {
    id: 4,
    title: 'Customize Settings',
    desc: 'Visit the Settings page to adjust privacy, notifications, and discover preferences.',
    icon: <Settings className="w-8 h-8 text-gold" />,
  },
  {
    id: 5,
    title: 'Verified Users',
    desc: 'Verified profiles get a special badge and higher visibility in matches.',
    icon: <UserCheck className="w-8 h-8 text-gold" />,
  },
];

export default function RulesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Persona/approval routing now lives in the how-it-works screen this
  // leads to -- this just confirms there's still a live session.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired');
        router.replace('/login');
        return;
      }
      setLoading(false);
    };
    checkSession();
  }, [supabase, router]);

  const handleBackSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Persona/approval routing now happens after the how-it-works screen
      // -- see app/(auth)/onboard/how-it-works/page.tsx.
      router.push('/onboard/how-it-works');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const slide = slides[currentSlide];
  const progressPercent = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <div className="max-w-md mx-auto w-full flex flex-col pb-8">
        {/* Header with back button and slide count */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackSlide}
            className="text-ink/40 hover:text-ink transition-colors p-1 -ml-1"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-xs font-semibold text-[#9DA0A6]">
            Rule {currentSlide + 1} of {slides.length}
          </span>
          <div className="invisible p-1 -mr-1" aria-hidden="true">
            <ArrowLeft size={24} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1C1C1E] h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-gold h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Slide content */}
        <div className="flex flex-col items-center text-center px-4 py-8 bg-[#1C1C1E] border border-[#2A2A2A] rounded-3xl min-h-[320px] justify-center transition-all duration-300">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
            {slide.icon}
          </div>
          <h2 className="text-2xl font-display font-semibold text-ink mb-4">
            {slide.title}
          </h2>
          <p className="text-[#9DA0A6] text-sm leading-relaxed max-w-[280px] font-light">
            {slide.desc}
          </p>
        </div>

        {/* Next rule button -- always advances (to the next rule, or into
            the how-it-works screen after the last one), so it always reads
            "Next Rule" rather than implying this is the final step. */}
        <button
          onClick={handleNextSlide}
          className="btn-primary w-full py-4 mt-6 font-semibold text-sm active:scale-95 transition-transform"
        >
          Next Rule
        </button>
      </div>
    </div>
  );
}
