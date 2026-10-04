'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Car, 
  Star, 
  Heart, 
  Check, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Compass,
  Users,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { Trip, TripRequest } from '@/types';

export default function MyTripsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Hosting' | 'Past'>('Upcoming');
  const [rating, setRating] = useState<number>(5);
  const [sparked, setSparked] = useState<boolean>(false);
  const [hostedTrips, setHostedTrips] = useState<Trip[]>([]);
  const [joinedRequests, setJoinedRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/trips/my').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setHostedTrips(data.hosted || []);
        setJoinedRequests(data.requests || []);
      }
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(loadData);

  const handleSpark = () => {
    hapticSuccess();
    setSparked(!sparked);
    toast.success(
      !sparked
        ? '💖 Secret Spark sent! They will only know if they spark you too.'
        : 'Secret Spark cancelled'
    );
  };

  const acceptedRequests = joinedRequests.filter((r) => r.status === 'accepted');
  const pendingRequests = joinedRequests.filter((r) => r.status === 'pending');

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      
      {/* ================= APPLE DESIGN KIT FROZEN HEADER ================= */}
      <header className="shrink-0 z-30 bg-white/85 backdrop-blur-2xl backdrop-saturate-180 pt-safe-top pb-3 px-5 border-b border-black/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#000000] tracking-tight">My Plans</h1>
            <p className="text-[12px] font-medium text-[#8E8E93]">Scheduled getaways & hosted escapes</p>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              router.push('/trips?tab=create');
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#000000] text-white text-[12px] font-semibold shadow-2xs hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            aria-label="Host Escape"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Host Escape</span>
          </button>
        </div>

        {/* Apple Native Segmented Control */}
        <div className="bg-[#767680]/12 p-0.5 rounded-xl flex items-center">
          {(['Upcoming', 'Hosting', 'Past'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = 
              tab === 'Hosting' ? hostedTrips.length : 
              tab === 'Upcoming' ? joinedRequests.length : undefined;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  hapticTap();
                  setActiveTab(tab);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#000000] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                    : 'text-[#8E8E93] hover:text-[#000000]'
                }`}
              >
                <span>{tab}</span>
                {count !== undefined && count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-stone-100 text-[#000000]' : 'bg-black/[0.06] text-[#8E8E93]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ================= MAIN SCROLLABLE CONTENT ================= */}
      <main 
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-contain px-6 space-y-4 pt-4 pb-36"
      >
        {/* Pull To Refresh Spinner */}
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out shrink-0"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-[#1C1C1E] ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="rounded-3xl bg-stone-100 h-44 border border-stone-200/60" />
            <div className="rounded-3xl bg-stone-100 h-36 border border-stone-200/60" />
          </div>
        )}

        {/* ================= TAB 1: UPCOMING PLANS ================= */}
        {!loading && activeTab === 'Upcoming' && (
          <div className="space-y-4">
            {joinedRequests.length === 0 ? (
              /* Luxury Empty State */
              <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200/90 p-7 text-center space-y-4 animate-fade-in shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-white border border-stone-200 mx-auto flex items-center justify-center text-[#1C1C1E] shadow-2xs">
                  <Compass className="w-6 h-6 text-[#1C1C1E]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-[800] text-[#1C1C1E] tracking-tight">No Escapes Scheduled Yet</h3>
                  <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
                    Join an upcoming sunrise drive, weekend coffee tour, or road trip with verified travel buddies.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      router.push('/trips');
                    }}
                    className="w-full py-3 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[13px] font-bold active:scale-[0.98] transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explore Road Trips & Escapes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      router.push('/trips?tab=create');
                    }}
                    className="w-full py-3 rounded-full bg-white hover:bg-stone-50 text-[#1C1C1E] text-[13px] font-bold border border-stone-200 active:scale-[0.98] transition shadow-2xs cursor-pointer"
                  >
                    Host Your Own Escape
                  </button>
                </div>
              </div>
            ) : (
              joinedRequests.map((req) => {
                const trip = (req as any).trip;
                if (!trip) return null;
                const isAccepted = req.status === 'accepted';
                return (
                  <div key={req.id} className="rounded-3xl bg-[#F9FAFB] border border-stone-200/90 p-5.5 sm:p-6 shadow-2xs space-y-4 animate-card-enter hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-2xs ${
                        isAccepted ? 'bg-[#1C1C1E]' : 'bg-amber-600'
                      }`}>
                        {isAccepted ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-white" />}
                        {isAccepted ? 'CONFIRMED' : 'APPLICATION UNDER REVIEW'}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500">{trip.start_date || 'Upcoming'}</span>
                    </div>

                    <div>
                      <h3 className="text-[18px] font-extrabold text-[#1C1C1E] leading-tight">
                        {trip.destination}
                      </h3>
                      <p className="text-[12px] text-stone-500 font-medium mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1C1C1E]" />
                        {trip.state || 'Bangalore'} · {trip.vibe || 'Road Trip'}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 border border-stone-200 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-stone-800">Host: {trip.host?.name || 'Verified Explorer'}</span>
                      </div>
                      <span className="font-bold text-[#1C1C1E]">
                        {trip.budget_per_day ? `₹${trip.budget_per_day}/day` : 'Shared Fuel'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => router.push(`/trips/${trip.id}`)}
                        className="text-[12px] font-bold text-stone-600 hover:text-stone-900 transition"
                      >
                        View Itinerary
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/messages')}
                        className="px-5 py-2 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[12px] font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                      >
                        Trip Chat
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= TAB 2: HOSTED PLANS ================= */}
        {!loading && activeTab === 'Hosting' && (
          <div className="space-y-4">
            {hostedTrips.length === 0 ? (
              /* Luxury Empty State */
              <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200/90 p-7 text-center space-y-4 animate-fade-in shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-white border border-stone-200 mx-auto flex items-center justify-center text-[#1C1C1E] shadow-2xs">
                  <Car className="w-6 h-6 text-[#1C1C1E]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-[800] text-[#1C1C1E] tracking-tight">You Haven't Hosted Yet</h3>
                  <p className="text-[13px] text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
                    Take the lead on a weekend drive or trek. Verified members can apply to join your convoy.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      router.push('/trips?tab=create');
                    }}
                    className="w-full py-3 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[13px] font-bold active:scale-[0.98] transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create an Escape</span>
                  </button>
                </div>
              </div>
            ) : (
              hostedTrips.map((trip) => {
                const reqCount = (trip as any).requests?.length || 0;
                return (
                  <div key={trip.id} className="rounded-3xl bg-[#F9FAFB] border border-stone-200/90 p-5.5 sm:p-6 shadow-2xs space-y-4 animate-card-enter hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#1C1C1E] text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        YOU ARE HOSTING
                      </span>
                      <span className="text-[11px] font-bold text-stone-500">{trip.start_date || 'Upcoming'}</span>
                    </div>

                    <div>
                      <h3 className="text-[18px] font-extrabold text-[#1C1C1E] leading-tight">
                        {trip.destination}
                      </h3>
                      <p className="text-[12px] text-stone-500 font-medium mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1C1C1E]" />
                        {trip.state || 'Bangalore'} · {trip.spots_available ?? 3} spots available
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 flex items-center justify-between text-[12px] border border-stone-200">
                      <span className="font-semibold text-stone-800">Applicant Requests</span>
                      <span className="font-bold text-[#1C1C1E] px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200">
                        {reqCount} received
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => router.push('/my-connections')}
                        className="flex-1 py-2.5 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-[12px] font-bold active:scale-95 transition shadow-2xs text-center cursor-pointer"
                      >
                        Review Applicants
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/trips/${trip.id}`)}
                        className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#1C1C1E] text-[12px] font-bold border border-stone-200 active:scale-95 transition shadow-2xs text-center cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {hostedTrips.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/trips?tab=create')}
                className="w-full py-3.5 rounded-full border-2 border-dashed border-stone-300 hover:border-[#1C1C1E] hover:bg-stone-50 text-[#1C1C1E] text-[13px] font-bold active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Another Escape</span>
              </button>
            )}
          </div>
        )}

        {/* ================= TAB 3: PAST TRIPS & REVIEWS ================= */}
        {!loading && activeTab === 'Past' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#F9FAFB] border border-stone-200/90 p-5.5 sm:p-6 shadow-2xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#1C1C1E]">Cubbon Park Morning Walk</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">Completed recently</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-[#1C1C1E] text-[10px] font-bold">
                  Completed
                </span>
              </div>

              {/* Star Rating */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2">
                <div className="text-[12px] font-bold text-stone-700">How was the vibe?</div>
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
                      aria-label={`Rate ${star} stars`}
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
