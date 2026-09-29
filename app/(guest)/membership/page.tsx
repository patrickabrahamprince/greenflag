'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home as HomeIcon,
  Calendar,
  Users,
  Trophy,
  Check,
  Sparkles,
  ArrowRight,
  Infinity as InfinityIcon,
  MapPin,
  Flame,
  Shield,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

export default function MembershipAcademyPage() {
  const router = useRouter();
  const [trialBooked, setTrialBooked] = useState(false);

  const handleBookTrial = () => {
    hapticSuccess();
    setTrialBooked(true);
    toast.success('Free Trial Booked! Check your confirmation message.', {
      icon: '🎉',
      style: { background: '#16181A', color: '#FAF8F5' },
    });
  };

  const handleBuyAcademy = () => {
    hapticSuccess();
    toast.success('Opening Academy Membership checkout...', {
      icon: '💳',
      style: { background: '#16181A', color: '#FAF8F5' },
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col font-sans select-none max-w-md mx-auto relative overflow-x-hidden pb-28 antialiased">
      
      {/* ================= HERO MEDIA WITH GRADIENT FADE (IMG_1102) ================= */}
      <div className="relative h-[320px] w-full shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-95"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1000&auto=format&fit=crop')`,
          }}
        />
        {/* Cinematic smooth gradient into pure black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/60 to-[#000000]" />
      </div>

      {/* ================= PUNCHY EDITORIAL HEADLINE & SUBTITLE (IMG_1102) ================= */}
      <div className="px-6 -mt-10 relative z-10 text-center">
        <h1 className="text-[26px] font-[900] tracking-tight text-white leading-tight">
          Don't pick the perfect sport.
        </h1>
        <h2 className="text-[24px] font-[900] tracking-tight text-[#E2F84F] leading-tight mt-0.5">
          Let your child discover it.
        </h2>
        <p className="text-[13px] text-white/70 font-normal mt-3 leading-relaxed max-w-[320px] mx-auto">
          One subscription to learn any sport we offer. Show up to whatever your child is feeling that week.
        </p>
      </div>

      {/* ================= 3 FEATURE BENEFIT CARDS (IMG_1102) ================= */}
      <div className="px-5 mt-6">
        <div className="bg-[#16181A] rounded-[28px] p-5 border border-white/10 shadow-2xl divide-y divide-white/10">
          
          {/* Benefit 1: All Sports, Zero Decisions */}
          <div className="flex items-start gap-4 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-[20px]">
              🏃
            </div>
            <div>
              <h3 className="text-[15px] font-[800] text-white tracking-tight">
                All Sports, Zero Decisions
              </h3>
              <p className="text-[12px] text-white/60 font-medium mt-0.5 leading-snug">
                Access every sport we offer under one plan.
              </p>
            </div>
          </div>

          {/* Benefit 2: Access to All Venues */}
          <div className="flex items-start gap-4 py-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 text-[20px]">
              🏛️
            </div>
            <div>
              <h3 className="text-[15px] font-[800] text-white tracking-tight">
                Access to All Game Theory Venues
              </h3>
              <p className="text-[12px] text-white/60 font-medium mt-0.5 leading-snug">
                Book classes and walk into any of our venues.
              </p>
            </div>
          </div>

          {/* Benefit 3: Unlimited Classes */}
          <div className="flex items-start gap-4 pt-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-[20px]">
              ♾️
            </div>
            <div>
              <h3 className="text-[15px] font-[800] text-white tracking-tight">
                Unlimited Classes
              </h3>
              <p className="text-[12px] text-white/60 font-medium mt-0.5 leading-snug">
                No counting sessions, just show up.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DUAL ACTION BUTTONS (IMG_1102) ================= */}
      <div className="px-5 mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          
          {/* Secondary Buy Button */}
          <button
            type="button"
            onClick={handleBuyAcademy}
            className="h-14 rounded-2xl bg-[#22262A] text-white font-[800] text-[15px] active:scale-95 transition cursor-pointer hover:bg-[#2C3136] shadow-md flex items-center justify-center"
          >
            Buy Academy
          </button>

          {/* Primary Free Trial Button */}
          <button
            type="button"
            onClick={handleBookTrial}
            className="h-14 rounded-2xl bg-[#E2F84F] text-[#111315] font-[800] text-[15px] active:scale-95 transition cursor-pointer hover:bg-[#D4EA40] shadow-[0_4px_16px_rgba(226,248,79,0.3)] flex items-center justify-center"
          >
            Book Free Trial
          </button>
        </div>

        {/* Disclaimer Notice */}
        <p className="text-center text-[11px] text-white/45 font-medium">
          This plan is strictly for kids 17 years and below.
        </p>
      </div>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#16181A]/95 backdrop-blur-2xl border-t border-white/10 z-30 max-w-md mx-auto px-4 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => router.push('/home-hub')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <HomeIcon className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Home</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/schedule')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Calendar className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Book</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/schedule')}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Users className="w-5 h-5 text-white/40" />
            <span className="text-[10px] font-bold text-white/40">Coaching</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Trophy className="w-5 h-5 text-[#E2F84F]" />
            <span className="text-[10px] font-bold text-[#E2F84F]">Academy</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
