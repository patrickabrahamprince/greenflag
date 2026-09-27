'use client';

import { useState } from 'react';
import { 
  Check, 
  Info, 
  Shield, 
  Sparkles, 
  Star, 
  Award, 
  Users 
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

export default function PassportPage() {
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#faf8f5] flex items-center justify-center p-2 md:p-8 font-[Inter] relative overflow-hidden text-black">
      
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Main Phone Frame */}
      <div className="relative w-full max-w-[390px] h-[820px] bg-black rounded-[56px] p-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
        
        {/* Dynamic Island */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[6px] bg-[#1a1a1a] rounded-full z-20" />
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-[#1a1a1a] rounded-full translate-x-[-70px] z-20" />

        <div className="relative w-full h-full bg-[#fffefc] rounded-[44px] overflow-hidden flex flex-col">
          
          {/* Status Bar */}
          <div className="h-[44px] flex items-center justify-between px-8 text-[15px] font-semibold tracking-tight z-10 shrink-0 bg-white/80 backdrop-blur-xl">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-6 h-3 border border-black/30 rounded-[3px] p-[1px]">
                <div className="w-4 h-full bg-black rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Main Passport Content */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="px-5 pt-3 pb-24">
              
              {/* Hero Passport Card */}
              <div className="relative rounded-[24px] bg-black text-white p-5 overflow-hidden shadow-xl">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-[20px] opacity-60 pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full blur-[24px] opacity-50 pointer-events-none" />

                {/* Avatar & Badges */}
                <div className="relative flex gap-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <div className="absolute inset-[3px] rounded-full bg-black flex items-center justify-center font-bold text-[24px]">
                      A
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center border-2 border-black">
                      12
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-[800] text-[20px] leading-none truncate">
                      Aarav · Level 12 Explorer
                    </div>
                    <div className="text-[12px] opacity-70 mt-1.5 truncate">
                      Bangalore · 18 trips · Member since 2023
                    </div>
                    <div className="mt-2.5 flex gap-1.5 flex-wrap">
                      {['On-Time 10x', 'Top Host', 'Photo Pro'].map((b) => (
                        <span
                          key={b}
                          className="text-[10px] px-2 py-1 rounded-full bg-white/15 border border-white/15 font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Green Score Circular SVG Ring */}
                <div className="relative mt-5 flex items-center gap-4">
                  <div className="w-16 h-16 relative shrink-0">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        stroke="url(#g)"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray="159.74 163"
                        strokeLinecap="round"
                      />
                    </svg>

                    <defs>
                      <linearGradient id="g" x1="0" x2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-[800] text-[18px] leading-none">4.9</span>
                      <span className="text-[9px] tracking-widest opacity-60 font-bold">GREEN</span>
                    </div>
                  </div>

                  <div className="text-[12px] leading-relaxed opacity-80 flex-1">
                    Green Score reflects trust. Yours is{' '}
                    <span className="text-white font-bold">top 5% in Bangalore</span>. Keep it up!
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowScoreInfo(!showScoreInfo)}
                    className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {showScoreInfo && (
                  <div className="mt-3 p-3 rounded-2xl bg-white text-black text-[12px] leading-relaxed animate-fade-in">
                    Green Score = On-time + Verified + Positive ratings + Safety compliance. High score unlocks Getaway hosting.
                  </div>
                )}
              </div>

              {/* Verification Badges */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { k: 'Face Verified', icon: '👌' },
                  { k: 'Govt ID', icon: '🪪' },
                ].map((v) => (
                  <div
                    key={v.k}
                    className="rounded-2xl bg-white border border-black/10 p-3.5 flex items-center gap-2.5 shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[18px]">
                      {v.icon}
                    </div>
                    <div>
                      <div className="font-bold text-[12px]">{v.k}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { v: '18', l: 'Trips', grad: 'from-amber-300 to-orange-400' },
                  { v: '4.9', l: 'Avg Rating', grad: 'from-emerald-400 to-teal-500' },
                  { v: '92%', l: 'On-Time', grad: 'from-violet-400 to-fuchsia-500' },
                ].map((stat) => (
                  <div key={stat.l} className="rounded-2xl bg-white border border-black/10 p-3 text-center">
                    <div
                      className={`inline-flex w-8 h-8 rounded-full bg-gradient-to-br ${stat.grad} text-white font-bold items-center justify-center text-[13px] shadow`}
                    >
                      {stat.v}
                    </div>
                    <div className="text-[11px] font-bold mt-1.5 text-black/60">{stat.l}</div>
                  </div>
                ))}
              </div>

              {/* Women-Only Circles Card */}
              <div className="mt-4 rounded-[20px] bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 border border-rose-100 p-4 flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow text-xl shrink-0">
                  👩
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[13px]">Women-Only Circles 👩‍🦽</div>
                  <div className="text-[11px] text-black/60 mt-1 leading-relaxed">
                    Curated small groups, women hosts, extra safety layers. Join Bangalore Circle (24 members).
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Joined Bangalore Women-Only Circle!');
                    }}
                    className="mt-2 h-8 px-3 rounded-full bg-black text-white text-[11px] font-bold cursor-pointer active:scale-95 transition-transform"
                  >
                    Explore Circle
                  </button>
                </div>
              </div>

              {/* My Sparks Section */}
              <div className="mt-4 rounded-[20px] bg-white border border-black/10 p-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-[14px]">My Sparks ✨</div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
                    PRO
                  </span>
                </div>

                <div className="mt-3 flex gap-2.5">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className="w-[88px] rounded-2xl bg-[#faf8f5] border border-black/5 p-2 text-center relative overflow-hidden"
                    >
                      <div className="w-12 h-12 rounded-full mx-auto bg-gradient-to-br from-rose-300 to-pink-400 blur-[2px]" />
                      <div className="mt-2 h-2 w-10 mx-auto bg-black/10 rounded-full blur-[1px]" />
                      <div className="mt-1 h-1.5 w-6 mx-auto bg-black/10 rounded-full blur-[1px]" />
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black text-white">
                          PRO
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Center Card */}
              <div className="mt-4 rounded-[20px] bg-black text-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[13px]">Safety Center</div>
                  <div className="text-[11px] opacity-70">
                    Live location share, SOS, public meet spots
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticSuccess();
                    toast.success('Live GPS coordinates shared with emergency contact!');
                  }}
                  className="h-9 px-4 rounded-full bg-white text-black font-bold text-[12px] cursor-pointer active:scale-95 transition-transform shrink-0"
                >
                  Share Live
                </button>
              </div>

            </div>
          </div>

          {/* Home Indicator Bar */}
          <div className="h-6 flex items-center justify-center shrink-0 bg-white">
            <div className="w-32 h-1 rounded-full bg-black" />
          </div>

        </div>
      </div>
    </div>
  );
}
