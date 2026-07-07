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
  const [persona, setPersona] = useState<'man' | 'woman' | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch persona on mount.
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired');
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('persona, approval_status')
        .eq('id', user.id)
        .single();
      setPersona(profile?.persona as 'man' | 'woman' | null);
      setApprovalStatus((profile as any)?.approval_status ?? null);
      setLoading(false);
    };
    fetchProfile();
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
      // Finished all slides – pending applicants wait for admin review.
      if (approvalStatus === 'pending') {
        router.push('/onboard/pending');
        return;
      }
      if (persona === 'woman') {
        router.push('/my-connections');
      } else {
        router.push('/discover');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const slide = slides[currentSlide];
  const progressPercent = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#FAF9F7]">
      <div className="max-w-md mx-auto w-full flex flex-col justify-between flex-1 pb-8">
        {/* Header with back button and slide count */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackSlide}
            className="text-ink/40 hover:text-ink transition-colors p-1 -ml-1"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-xs font-semibold text-[#8E8E93]">
            Rule {currentSlide + 1} of {slides.length}
          </span>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#F0EDE9] h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-gold h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Slide content */}
        <div className="flex flex-col items-center text-center px-4 py-8 bg-[#F0EDE9] border border-[#E8E6E1] rounded-3xl min-h-[320px] justify-center transition-all duration-300">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
            {slide.icon}
          </div>
          <h2 className="text-2xl font-display font-semibold text-ink mb-4">
            {slide.title}
          </h2>
          <p className="text-[#8E8E93] text-sm leading-relaxed max-w-[280px] font-light">
            {slide.desc}
          </p>
        </div>

        {/* Next/Start button */}
        <button
          onClick={handleNextSlide}
          className="btn-primary w-full py-4 mt-8 font-semibold text-sm active:scale-95 transition-transform"
        >
          {currentSlide === slides.length - 1 ? (
            persona === 'woman' ? 'View Connections' : 'Start Exploring'
          ) : (
            'Next Rule'
          )}
        </button>
      </div>
    </div>
  );
}
