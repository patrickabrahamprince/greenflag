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
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col font-[Inter] relative overflow-x-hidden text-black max-w-md mx-auto">
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 px-5 pt-[max(16px,env(safe-area-inset-top,16px))] pb-36">
        <h2 className="text-[24px] font-[800] tracking-tight">My Trips</h2>

        {/* Live Activity Banner */}
        <div className="mt-4 rounded-[22px] bg-black text-white p-4 flex items-center gap-3 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]">
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
                  : 'bg-white border-black/10 text-black/60 hover:border-black/20'
              }`}
            >
              {tab}
              {tab === 'Hosting' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow">
                  3
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Cards Content */}
        <div className="mt-4 space-y-4">
          
          {/* Active Trip Checklist Card */}
          <div className="rounded-[22px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="font-bold text-[15px]">Nandi Hills Sunrise ⛰️</div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                LIVE
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-6 h-6 rounded-full bg-[#f5f3f0] flex items-center justify-center shrink-0">
                  <Car className="w-3.5 h-3.5 text-black/70" />
                </div>
                <span className="font-medium text-black/80">Who brings car?</span>
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
                  Aarav ✓
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[12px]">
                <div className="w-6 h-6 rounded-full bg-[#f5f3f0] flex items-center justify-center shrink-0">
                  <span>💸</span>
                </div>
                <span className="font-medium text-black/80">UPI split</span>
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                  Paid
                </span>
              </div>

              {/* Co-Builder Live Drops */}
              <div className="mt-3 p-3 rounded-xl bg-[#faf8f5] border border-black/5">
                <div className="text-[10px] font-bold tracking-widest text-black/40">
                  CO-BUILDER MAP
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {[
                      { id: 1, init: 'A' },
                      { id: 2, init: 'M' },
                      { id: 3, init: 'R' },
                    ].map((b, i) => (
                      <div
                        key={b.id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ marginLeft: i === 0 ? 0 : -8 }}
                      >
                        {b.init}
                      </div>
                    ))}
                  </div>
                  <div className="ml-auto text-[11px] text-black/50 font-medium">
                    3 en route
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post-Trip Rating & Secret Spark Card */}
          <div className="rounded-[22px] border border-black/10 bg-gradient-to-br from-white to-orange-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[14px]">Post-Trip Rating</div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black text-white font-medium">
                Cubbon Park · Yesterday
              </span>
            </div>

            {/* 5 Stars Rating Selector */}
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setRating(star);
                  }}
                  className="cursor-pointer active:scale-90 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-black/10'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Secret Spark Double-Blind Toggle */}
            <div className="mt-3 p-3 rounded-2xl bg-white border border-black/10 flex items-center gap-3 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[12px]">Secret Spark?</div>
                <div className="text-[11px] text-black/50">
                  Only they know if you tap too. 100% double-blind.
                </div>
              </div>
              <button
                type="button"
                onClick={handleSpark}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  sparked ? 'bg-rose-500 text-white shadow' : 'bg-black text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${sparked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Past Trips Archive Footer */}
          <div className="rounded-[22px] border border-dashed border-black/15 p-4 text-center">
            <div className="text-[13px] font-semibold text-black/80">Past trips archive</div>
            <div className="text-[11px] text-black/50 mt-1">
              12 trips completed · 9 buddies · 2 sparks ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
