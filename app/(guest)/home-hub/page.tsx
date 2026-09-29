'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home as HomeIcon,
  Calendar,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  Shield,
  Clock,
  Dumbbell,
  Waves,
  Trophy,
  Flame,
  Check,
  Lock,
  ArrowRight,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import { AppFeatureTour, DEFAULT_TOUR_STEPS } from '@/components/tour/AppFeatureTour';
import toast from 'react-hot-toast';

export default function HomeHubPage() {
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'coaching' | 'academy'>('home');

  useEffect(() => {
    // Check if user has already seen tour, else show it automatically after 600ms
    const hasSeen = localStorage.getItem('has_seen_app_tour');
    if (!hasSeen) {
      const timer = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0B0D0E] text-white flex flex-col font-sans select-none max-w-md mx-auto relative overflow-x-hidden pb-28 antialiased">
      
      {/* Ambient Top Glow */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* ================= HEADER SECTION (IMG_1087) ================= */}
      <header className="px-5 pt-[max(16px,env(safe-area-inset-top,16px))] pb-3 flex items-center justify-between z-10">
        <div>
          <span className="text-[12px] font-medium text-white/50 block">Hello,</span>
          <h1 className="text-[22px] font-[900] tracking-tight text-white mt-0.5">
            Patrick!
          </h1>
        </div>

        {/* Profile Avatar with Red Notification Pill (IMG_1087) */}
        <div id="tour-target-profile" className="relative cursor-pointer" onClick={() => setShowTour(true)}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full bg-[#1E2124] flex items-center justify-center overflow-hidden">
              <span className="text-[20px]">👨‍🎤</span>
            </div>
          </div>
          {/* Notification Dot */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0B0D0E] animate-pulse" />
        </div>
      </header>

      {/* ================= PROMOTIONAL TICKER BANNER (IMG_1087) ================= */}
      <div className="px-5 my-2">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-black/80 to-black/60 border border-red-500/20 flex items-center justify-between group active:scale-[0.99] transition cursor-pointer"
        >
          <div className="text-left">
            <span className="text-[9px] font-[900] tracking-[0.2em] text-white uppercase block">
              INTRODUCING THE FIRST EVER
            </span>
            <span className="text-[11px] font-[900] tracking-widest text-red-400 uppercase mt-0.5 block">
              GREENFLAG CURATED ESCAPES
            </span>
          </div>
          <div className="flex items-center text-red-400 font-bold tracking-tighter text-sm group-hover:translate-x-1 transition-transform">
            <span>&gt;&gt;&gt;</span>
          </div>
        </button>
      </div>

      {/* ================= 6-CARD ACTIVITY GRID (IMG_1087) ================= */}
      <section className="px-5 my-2 grid grid-cols-2 gap-3">
        
        {/* Card 1: JOIN A GAME / TRIP */}
        <div
          id="tour-target-join-game"
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="bg-[#1C1F22] rounded-[24px] p-4 border border-white/10 flex flex-col justify-between h-[155px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg"
        >
          <div className="z-10">
            <h3 className="text-[14px] font-[900] tracking-tight text-white uppercase leading-tight">
              JOIN A GAME
            </h3>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">
              Skill-Based Games
            </p>
          </div>
          <div className="absolute right-1 bottom-1 text-[54px] filter drop-shadow-md select-none pointer-events-none">
            🏸
          </div>
        </div>

        {/* Card 2: KIDS ACADEMY / FREE TRIAL */}
        <div
          id="tour-target-academy-card"
          onClick={() => {
            hapticTap();
            router.push('/membership');
          }}
          className="bg-gradient-to-br from-[#541B82] via-[#3C135E] to-[#250B3B] rounded-[24px] p-4 border border-purple-400/20 flex flex-col justify-between h-[72px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg"
        >
          <div className="z-10">
            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/20 text-white inline-block mb-1">
              FREE TRIAL
            </span>
            <h3 className="text-[13px] font-[900] tracking-tight text-white uppercase leading-none">
              EXPERIENCE WITH A
            </h3>
          </div>
        </div>

        {/* Card 3: GO SWIMMING / EXPEDITION */}
        <div
          id="tour-target-swimming-card"
          onClick={() => {
            hapticTap();
            router.push('/schedule');
          }}
          className="bg-[#1C1F22] rounded-[24px] p-4 border border-white/10 flex flex-col justify-between h-[72px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg -mt-[70px]"
        >
          <div className="z-10">
            <h3 className="text-[13px] font-[900] tracking-tight text-white uppercase leading-none">
              GO SWIMMING
            </h3>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">
              Lap Sessions
            </p>
          </div>
          <div className="absolute right-2 bottom-1 text-[36px] filter drop-shadow-md pointer-events-none">
            🏊‍♂️
          </div>
        </div>

        {/* Card 4: BOOK COACHING */}
        <div
          id="tour-target-coaching-card"
          onClick={() => {
            hapticTap();
            router.push('/schedule');
          }}
          className="bg-[#1C1F22] rounded-[24px] p-4 border border-white/10 flex flex-col justify-between h-[155px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg"
        >
          <div className="z-10">
            <h3 className="text-[14px] font-[900] tracking-tight text-white uppercase leading-tight">
              BOOK COACHING
            </h3>
            <p className="text-[10px] text-white/50 font-medium mt-0.5 leading-tight">
              Learn & Improve your Game
            </p>
          </div>
          <div className="absolute right-2 bottom-1 text-[54px] filter drop-shadow-md pointer-events-none">
            ⛺
          </div>
        </div>

        {/* Card 5: BOOK COURT / TURF */}
        <div
          id="tour-target-turf-card"
          onClick={() => {
            hapticTap();
            router.push('/schedule');
          }}
          className="bg-[#1C1F22] rounded-[24px] p-4 border border-white/10 flex flex-col justify-between h-[72px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg"
        >
          <div className="z-10">
            <h3 className="text-[13px] font-[900] tracking-tight text-white uppercase leading-none">
              BOOK COURT/TURF
            </h3>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">
              Play with Friends
            </p>
          </div>
          <div className="absolute right-2 bottom-1 text-[32px] pointer-events-none">
            🏟️
          </div>
        </div>

        {/* Card 6: BOOK WORKOUT */}
        <div
          id="tour-target-workout-card"
          onClick={() => {
            hapticTap();
            router.push('/schedule');
          }}
          className="bg-[#1C1F22] rounded-[24px] p-4 border border-white/10 flex flex-col justify-between h-[72px] relative overflow-hidden active:scale-[0.98] transition cursor-pointer shadow-lg -mt-[70px]"
        >
          <div className="z-10">
            <h3 className="text-[13px] font-[900] tracking-tight text-white uppercase leading-none">
              BOOK WORKOUT
            </h3>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">
              New Group Classes
            </p>
          </div>
          <div className="absolute right-2 bottom-1 text-[32px] pointer-events-none">
            🏋️
          </div>
        </div>
      </section>

      {/* ================= ALL-ACCESS PROMO CAROUSEL (IMG_1087, IMG_1096) ================= */}
      <section className="px-5 my-3">
        <div className="rounded-[26px] bg-gradient-to-br from-[#4A1010] via-[#2A0808] to-[#120505] border border-red-500/20 p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-[900] text-[8px] flex flex-col items-center justify-center leading-[0.85] tracking-tighter">
              <span>GREEN</span>
              <span>FLAG</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/40 text-[10px] font-bold tracking-wider text-red-200">
              all access
            </span>
          </div>

          <h4 className="text-[16px] font-[900] text-white tracking-tight leading-snug">
            Launching New GreenFlag Gym in HSR Layout on October 9!
          </h4>
          <p className="text-[11px] text-white/60 font-normal mt-1 leading-relaxed">
            Get unbelievable discounts for early sign ups! Access all sports & pool sessions.
          </p>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/membership');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#E2F84F] text-[#111315] font-[800] text-xs shadow-md active:scale-95 transition cursor-pointer"
          >
            Explore Pass
          </button>
        </div>
      </section>

      {/* ================= YOUR STANDARD BENEFITS (IMG_1096, IMG_1097, IMG_1098) ================= */}
      <section className="px-5 my-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-[900] tracking-[0.2em] text-white/40 uppercase">
            YOUR STANDARD BENEFITS
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        <div className="bg-[#16181A] rounded-[26px] p-5 border border-white/10 shadow-xl space-y-3.5">
          {[
            { label: 'Join Games (Pay and play)', unlocked: true },
            { label: 'Access to Pools (Pay and swim)', unlocked: true },
            { label: 'Coaching for Adults', unlocked: false },
            { label: 'Free shuttles and balls', unlocked: false },
            { label: 'Access to exclusive sport events', unlocked: false },
            { label: 'Gym Access', unlocked: false },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {item.unlocked ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-white/5 text-white/40 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
              <span className={`text-[13px] font-medium ${item.unlocked ? 'text-white' : 'text-white/50'}`}>
                {item.label}
              </span>
            </div>
          ))}

          {/* Upgrade Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                hapticTap();
                router.push('/membership');
              }}
              className="w-full h-12 rounded-xl bg-[#2A2D30] hover:bg-[#34383D] text-[#E2F84F] font-[800] text-[13px] flex items-center justify-between px-4 transition active:scale-[0.98] cursor-pointer"
            >
              <span>Want to upgrade? Get All Access</span>
              <ChevronRight className="w-4 h-4 text-[#E2F84F]" />
            </button>
          </div>
        </div>
      </section>

      {/* Trigger Tour Help Icon */}
      <div className="px-5 mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setShowTour(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E2F84F]" />
          <span>Launch Interactive Tour</span>
        </button>
      </div>

      {/* ================= BOTTOM NAVIGATION BAR (IMG_1087, IMG_1096-1099) ================= */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#16181A]/95 backdrop-blur-2xl border-t border-white/10 z-30 max-w-md mx-auto px-4 pt-2.5 pb-[max(12px,env(safe-area-inset-bottom,12px))]">
        <div className="grid grid-cols-4 gap-1">
          
          {/* Tab 1: Home */}
          <button
            id="tour-target-nav-home"
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab('home');
            }}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <HomeIcon className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#E2F84F]' : 'text-white/40'}`} />
            <span className={`text-[10px] font-bold ${activeTab === 'home' ? 'text-[#E2F84F]' : 'text-white/40'}`}>
              Home
            </span>
          </button>

          {/* Tab 2: Book / Schedule */}
          <button
            id="tour-target-nav-book"
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab('book');
              router.push('/schedule');
            }}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'book' ? 'text-[#E2F84F]' : 'text-white/40'}`} />
            <span className={`text-[10px] font-bold ${activeTab === 'book' ? 'text-[#E2F84F]' : 'text-white/40'}`}>
              Book
            </span>
          </button>

          {/* Tab 3: Coaching */}
          <button
            id="tour-target-nav-coaching"
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab('coaching');
              router.push('/schedule');
            }}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Users className={`w-5 h-5 ${activeTab === 'coaching' ? 'text-[#E2F84F]' : 'text-white/40'}`} />
            <span className={`text-[10px] font-bold ${activeTab === 'coaching' ? 'text-[#E2F84F]' : 'text-white/40'}`}>
              Coaching
            </span>
          </button>

          {/* Tab 4: Kids Academy / Membership */}
          <button
            id="tour-target-nav-academy"
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab('academy');
              router.push('/membership');
            }}
            className="flex flex-col items-center justify-center gap-1 cursor-pointer py-1"
          >
            <Trophy className={`w-5 h-5 ${activeTab === 'academy' ? 'text-[#E2F84F]' : 'text-white/40'}`} />
            <span className={`text-[10px] font-bold ${activeTab === 'academy' ? 'text-[#E2F84F]' : 'text-white/40'}`}>
              Academy
            </span>
          </button>
        </div>
      </nav>

      {/* ================= INTERACTIVE SPOTLIGHT TOUR ================= */}
      <AppFeatureTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={() => toast.success('Tour completed! Enjoy exploring.', {
          icon: '✨',
          style: { background: '#16181A', color: '#FAF8F5' },
        })}
      />
    </div>
  );
}
