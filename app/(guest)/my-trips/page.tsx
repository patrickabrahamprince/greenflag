'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Car, 
  Star, 
  Heart, 
  Check, 
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function MyTripsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Hosting' | 'Past'>('Upcoming');
  const [rating, setRating] = useState<number>(5);
  const [sparked, setSparked] = useState<boolean>(false);

  const handleSpark = () => {
    hapticSuccess();
    setSparked(!sparked);
    toast.success(
      !sparked
        ? '💖 Secret Spark sent! They will only know if they spark you too.'
        : 'Secret Spark cancelled'
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E3F2FD] via-[#F0F7FF] to-[#F7F6EB] text-stone-900 font-sans max-w-md mx-auto relative overflow-hidden flex flex-col pb-28">
      
      {/* Top Ambient Glow Background */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-200/50 via-indigo-100/30 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-[max(20px,env(safe-area-inset-top,20px))] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-purple-500 to-sky-400">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00E5A3] rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-[800] text-[#18181B] tracking-tight">My Plans</h1>
            <p className="text-[12px] font-semibold text-stone-500">Scheduled escapes & trips</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            router.push('/trips');
          }}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-white transition cursor-pointer active:scale-95"
          aria-label="Explore more"
        >
          <Compass className="w-5 h-5 text-stone-700" />
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="px-6 py-2">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-[22px] border border-white/80 shadow-xs">
          {(['Upcoming', 'Hosting', 'Past'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  hapticTap();
                  setActiveTab(tab);
                }}
                className={`flex-1 py-2 rounded-[18px] text-[12px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9D54FF] text-white shadow-md shadow-[#9D54FF]/25'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content List */}
      <main className="px-6 space-y-4 pt-2">
        
        {/* Live Active Trip Card (Mint Green) */}
        {activeTab === 'Upcoming' && (
          <>
            <div className="rounded-[28px] bg-[#D7F5E8] border border-emerald-200/60 p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-[800] text-[10px] tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  HAPPENING TODAY
                </span>
                <span className="text-[11px] font-bold text-emerald-950">9:45 AM</span>
              </div>

              <div>
                <h3 className="text-[18px] font-[800] text-emerald-950 leading-tight">
                  Nandi Sunrise Cloud Convoy
                </h3>
                <p className="text-[12px] text-emerald-900/70 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  Meeting at Indiranagar 100ft Rd
                </p>
              </div>

              {/* Ride & Carpool Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 space-y-2 border border-white">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-800" />
                    <span className="font-semibold text-stone-800">Car Lead</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                    Aarav · Verified ✓
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span className="font-semibold text-stone-800">Fuel & Pass Split</span>
                  </div>
                  <span className="font-bold text-emerald-950">₹350 / person</span>
                </div>
              </div>

              {/* Travelers Stack */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="Traveler 1"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    alt="Traveler 2"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                    alt="Traveler 3"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    +2
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/messages')}
                  className="px-3.5 py-1.5 rounded-full bg-[#18181B] text-white text-[11px] font-bold active:scale-95 transition"
                >
                  Group Chat
                </button>
              </div>
            </div>

            {/* Next Scheduled Trip (Ice Blue) */}
            <div className="rounded-[28px] bg-[#DDF0FE] border border-sky-200/60 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-900/70">Sat · Oct 4</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-900 font-bold text-[10px]">
                  CONFIRMED
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-[800] text-sky-950">
                  Coorg Coffee Estate & Waterfalls
                </h3>
                <p className="text-[12px] text-sky-900/70 font-medium mt-0.5">
                  Weekend Getaway · 4 Buddies
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-sky-900">Host: Sneha R.</span>
                <span className="text-[11px] font-bold text-sky-950">₹1,800 total</span>
              </div>
            </div>
          </>
        )}

        {/* Hosted Plans Tab */}
        {activeTab === 'Hosting' && (
          <div className="rounded-[28px] bg-[#F2E8FD] border border-purple-200/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-[800] text-[10px]">
                YOU ARE HOSTING
              </span>
              <span className="text-[11px] font-bold text-purple-950">3 Joined</span>
            </div>

            <div>
              <h3 className="text-[17px] font-[800] text-purple-950">
                Skandagiri Sunrise Trek & Chai
              </h3>
              <p className="text-[12px] text-purple-900/70 font-medium mt-0.5">
                Sunday 4:00 AM · Indiranagar Pickup
              </p>
            </div>

            <div className="bg-white/80 rounded-2xl p-3 flex items-center justify-between text-[12px]">
              <span className="font-semibold text-stone-800">Pending Requests</span>
              <span className="font-bold text-purple-700">2 to review</span>
            </div>
          </div>
        )}

        {/* Past Trips Tab & Rating Spark (Lavender & Peach) */}
        {activeTab === 'Past' && (
          <div className="space-y-4">
            <div className="rounded-[28px] bg-white border border-stone-200/70 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-[800] text-[#18181B]">Cubbon Park Morning Walk</h3>
                  <p className="text-[11px] text-stone-500">Completed Yesterday</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                  Finished
                </span>
              </div>

              {/* Star Rating */}
              <div>
                <div className="text-[12px] font-bold text-stone-700 mb-1.5">How was the vibe?</div>
                <div className="flex gap-2">
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
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Spark Box */}
              <div className="p-3.5 rounded-2xl bg-[#FFEBF2] border border-rose-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <div className="text-[12px] font-[800] text-rose-950">Secret Spark</div>
                    <div className="text-[10px] text-rose-900/70">100% private unless mutual</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSpark}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    sparked
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-stone-800 border border-stone-200 shadow-xs'
                  }`}
                >
                  {sparked ? 'Sparked 💖' : 'Send Spark'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
