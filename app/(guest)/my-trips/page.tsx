'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Car, 
  Star, 
  Heart, 
  Check, 
  MapPin, 
  Clock, 
  ChevronRight, 
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
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      
      {/* 100% Frozen Fixed Top Header with Tabs */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-6 border-b border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-[800] text-[#1C1C1E] tracking-tight">My Plans</h1>
            <p className="text-[12px] font-semibold text-stone-500">Scheduled escapes & trips</p>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/trips');
            }}
            className="w-10 h-10 rounded-full bg-[#F4F4F5] border border-stone-200 shadow-2xs flex items-center justify-center text-[#1C1C1E] hover:bg-stone-200 transition cursor-pointer active:scale-95"
            aria-label="Explore more"
          >
            <Compass className="w-5 h-5 text-[#1C1C1E]" />
          </button>
        </div>

        {/* Filter Tabs (Explore Style) */}
        <div className="flex items-center gap-1.5 bg-[#F4F4F5] p-1 rounded-full border border-stone-200">
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
                className={`flex-1 py-2 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1C1E] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-[#1C1C1E]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Scrollable Content List */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-6 space-y-4 pt-3 pb-36">
        
        {/* Live Active Trip Card */}
        {activeTab === 'Upcoming' && (
          <>
            <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200 p-5 shadow-2xs space-y-3.5 animate-card-enter hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#1C1C1E] text-white font-extrabold text-[10px] tracking-wide flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  HAPPENING TODAY
                </span>
                <span className="text-[11px] font-bold text-stone-500">9:45 AM</span>
              </div>

              <div>
                <h3 className="text-[17px] font-extrabold text-[#1C1C1E] leading-tight">
                  Nandi Sunrise Cloud Convoy
                </h3>
                <p className="text-[12px] text-stone-500 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1C1C1E]" />
                  Meeting at Indiranagar 100ft Rd
                </p>
              </div>

              {/* Ride & Carpool Details */}
              <div className="bg-white rounded-2xl p-3.5 space-y-2 border border-stone-200">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#1C1C1E]" />
                    <span className="font-semibold text-stone-800">Car Lead</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-[#1C1C1E] text-[11px] font-bold border border-stone-200">
                    Aarav · Verified ✓
                  </span>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span className="font-semibold text-stone-800">Fuel & Pass Split</span>
                  </div>
                  <span className="font-bold text-[#1C1C1E]">₹350 / person</span>
                </div>
              </div>

              {/* Travelers Stack & Action */}
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
                  <div className="w-7 h-7 rounded-full bg-[#1C1C1E] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    +2
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/messages')}
                  className="px-4 py-2 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[11px] font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                >
                  Group Chat
                </button>
              </div>
            </div>

            {/* Next Scheduled Trip */}
            <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500">Sat · Oct 4</span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[#1C1C1E] font-bold text-[10px]">
                  CONFIRMED
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-extrabold text-[#1C1C1E]">
                  Coorg Coffee Estate & Waterfalls
                </h3>
                <p className="text-[12px] text-stone-500 font-medium mt-0.5">
                  Weekend Getaway · 4 Buddies
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                <span className="text-[11px] font-semibold text-stone-600">Host: Sneha R.</span>
                <span className="text-[11px] font-bold text-[#1C1C1E]">₹1,800 total</span>
              </div>
            </div>
          </>
        )}

        {/* Hosted Plans Tab */}
        {activeTab === 'Hosting' && (
          <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#1C1C1E] text-white font-extrabold text-[10px]">
                YOU ARE HOSTING
              </span>
              <span className="text-[11px] font-bold text-stone-500">3 Joined</span>
            </div>

            <div>
              <h3 className="text-[17px] font-extrabold text-[#1C1C1E]">
                Skandagiri Sunrise Trek & Chai
              </h3>
              <p className="text-[12px] text-stone-500 font-medium mt-0.5">
                Sunday 4:00 AM · Indiranagar Pickup
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3 flex items-center justify-between text-[12px] border border-stone-200">
              <span className="font-semibold text-stone-800">Pending Requests</span>
              <span className="font-bold text-[#1C1C1E]">2 to review</span>
            </div>
          </div>
        )}

        {/* Past Trips Tab & Rating Spark */}
        {activeTab === 'Past' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#1C1C1E]">Cubbon Park Morning Walk</h3>
                  <p className="text-[11px] text-stone-500">Completed Yesterday</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[#1C1C1E] text-[10px] font-bold">
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
                            ? 'fill-[#1C1C1E] text-[#1C1C1E]'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Spark Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-2xs">
                    <Heart className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div>
                    <div className="text-[12px] font-extrabold text-[#1C1C1E]">Secret Spark</div>
                    <div className="text-[10px] text-stone-500">100% private unless mutual</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSpark}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    sparked
                      ? 'bg-[#1C1C1E] text-white shadow-2xs'
                      : 'bg-[#F4F4F5] hover:bg-stone-200 text-[#1C1C1E] border border-stone-200 shadow-2xs'
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
