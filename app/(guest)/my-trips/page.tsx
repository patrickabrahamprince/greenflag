'use client';

import { useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Car, 
  Star, 
  Heart, 
  Sparkles, 
  Check, 
  Users 
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<'Hosting' | 'Joining' | 'Past'>('Hosting');
  const [rating, setRating] = useState<number>(4);
  const [sparked, setSparked] = useState<boolean>(false);

  const handleSpark = () => {
    hapticSuccess();
    setSparked(!sparked);
    toast.success(
      !sparked
        ? '💖 Secret Spark recorded! Double-blind until they tap too.'
        : 'Secret Spark cancelled'
    );
  };

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

      {/* Main Phone Container */}
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

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="px-5 pt-3 pb-24">
              <h2 className="text-[26px] font-[800] tracking-tight">My Trips</h2>

              {/* Live Activity Banner */}
              <div className="mt-4 rounded-[18px] bg-black text-white p-4 flex items-center gap-3 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)]">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center relative shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                  <div className="w-2 h-2 bg-white rounded-full relative" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] flex items-center gap-2 truncate">
                    <span>Nandi Hills Trip Live</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                  </div>
                  <div className="text-[11px] opacity-70 truncate">
                    2 buddies en route · ETA 18 min
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
              </div>

              {/* Sub-Tabs: Hosting / Joining / Past */}
              <div className="mt-5 flex gap-2">
                {(['Hosting', 'Joining', 'Past'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setActiveTab(tab);
                    }}
                    className={`h-9 px-4 rounded-full text-[13px] font-semibold border relative cursor-pointer transition-all ${
                      activeTab === tab
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white border-black/10 text-black/60 hover:bg-stone-50'
                    }`}
                  >
                    <span>{tab}</span>
                    {tab === 'Hosting' && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        3
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active Trip & Cards */}
              <div className="mt-4 space-y-3">
                
                {/* Active Trip Checklist & Co-Builder Map */}
                <div className="rounded-[20px] border border-black/10 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-[15px]">Nandi Hills Sunrise ⛰️</div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <div className="w-6 h-6 rounded-full bg-[#f5f3f0] flex items-center justify-center">
                        <Car className="w-3.5 h-3.5 text-stone-700" />
                      </div>
                      <span className="font-medium">Who brings car?</span>
                      <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
                        Aarav ✓
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[12px]">
                      <div className="w-6 h-6 rounded-full bg-[#f5f3f0] flex items-center justify-center text-xs">
                        💸
                      </div>
                      <span className="font-medium">UPI split</span>
                      <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                        Paid
                      </span>
                    </div>

                    {/* Co-Builder Map Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#faf8f5] border border-black/5">
                      <div className="text-[11px] font-bold tracking-widest text-black/40">
                        CO-BUILDER MAP
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex items-center">
                          {[32, 58, 72].map((val, idx) => (
                            <div
                              key={val}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ marginLeft: idx === 0 ? 0 : -6 }}
                            >
                              •
                            </div>
                          ))}
                        </div>
                        <div className="ml-auto text-[10px] text-black/50 self-center font-medium">
                          3 en route
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post-Trip Rating & Secret Spark Card */}
                <div className="rounded-[20px] border border-black/10 bg-gradient-to-br from-white to-orange-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[14px]">Post-Trip Rating</div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-black text-white font-medium">
                      Cubbon Park · Yesterday
                    </span>
                  </div>

                  {/* 5-Star Rating Selector */}
                  <div className="mt-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setRating(star);
                        }}
                        className="cursor-pointer active:scale-95 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-black/10'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Secret Spark Box */}
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-black/10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white blur-[0.5px] text-lg shadow-sm">
                      💖
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[12px]">Secret Spark?</div>
                      <div className="text-[11px] text-black/50">
                        Only they know if you tap. No pressure.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSpark}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        sparked
                          ? 'bg-rose-500 text-white shadow-md scale-105'
                          : 'bg-black text-white hover:bg-stone-800'
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Past Trips Archive Summary */}
                <div className="rounded-[20px] border border-dashed border-black/15 p-4 text-center">
                  <div className="text-[13px] font-semibold">Past trips archive</div>
                  <div className="text-[11px] text-black/50 mt-1">
                    12 trips · 9 buddies · 2 sparks ✨
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="h-6 flex items-center justify-center shrink-0 bg-white">
            <div className="w-32 h-1 rounded-full bg-black" />
          </div>

        </div>
      </div>
    </div>
  );
}
