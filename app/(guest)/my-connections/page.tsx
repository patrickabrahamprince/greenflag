'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Users,
  Plane,
  Compass,
  MessageSquare,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { getCached, setCached } from '@/lib/pageCache';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticTap } from '@/lib/haptics';
import { Trip, TripRequest } from '@/types';

const MATCHES_CACHE_KEY = 'my-connections:matches';

interface MatchListItem {
  id: string;
  current_day?: number;
  status: string;
  chat_unlocked: boolean;
  otherName: string;
  otherPhoto: string | null;
}

export default function MyConnectionsPage() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'buddies' | 'trips'>('buddies');
  const [matches, setMatches] = useState<MatchListItem[]>(() => getCached(MATCHES_CACHE_KEY) ?? []);
  const [hostedTrips, setHostedTrips] = useState<Trip[]>([]);
  const [myRequests, setMyRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [matchesRes, tripsRes] = await Promise.all([
        fetch('/api/matches').catch(() => null),
        fetch('/api/trips/my').catch(() => null),
      ]);

      if (matchesRes && matchesRes.ok) {
        const mData = await matchesRes.json();
        setMatches(mData.matches || []);
        setCached(MATCHES_CACHE_KEY, mData.matches || []);
      }

      if (tripsRes && tripsRes.ok) {
        const tData = await tripsRes.json();
        setHostedTrips(tData.hosted || []);
        setMyRequests(tData.requests || []);
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

  if (loading && matches.length === 0 && hostedTrips.length === 0 && myRequests.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      {/* 100% Frozen Fixed Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md px-6 pt-safe-top border-b border-stone-100 pb-2">
        <div className="pt-2 mb-3">
          <h1 className="font-display text-2xl text-stone-900 font-extrabold tracking-tight">My Trips & Connections</h1>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Manage your travel connections and trip plans</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 bg-stone-100 rounded-full mb-2 border border-stone-200">
          <button
            onClick={() => {
              hapticTap();
              setActiveTab('buddies');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'buddies'
                ? 'bg-[#1C1C1E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People for Trips ({matches.length})</span>
          </button>
          <button
            onClick={() => {
              hapticTap();
              setActiveTab('trips');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-[#1C1C1E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>My Trips ({hostedTrips.length + myRequests.length})</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-contain px-6 pb-36 flex flex-col"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out shrink-0"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-stone-900 ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        {/* TAB 1: TRAVEL CONNECTIONS */}
        {activeTab === 'buddies' && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
                <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
                  <Compass className="w-8 h-8 text-stone-900" />
                </div>
                <h2 className="font-display text-lg text-stone-900 font-bold mb-1.5">No People for Trips Yet</h2>
                <p className="text-stone-500 text-xs max-w-xs mb-6 leading-relaxed">
                  Discover travelers heading to your favorite destinations and connect with a single tap.
                </p>
                <button
                  onClick={() => {
                    hapticTap();
                    router.push('/discover');
                  }}
                  className="bg-[#1C1C1E] text-white text-xs py-3 px-6 rounded-full font-bold flex items-center gap-2 shadow-md hover:bg-black active:scale-95 transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Meet People for Trips</span>
                </button>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className="w-full flex items-center gap-3.5 p-4 bg-white border border-stone-200 rounded-[24px] transition-all shadow-xs"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200">
                    {m.otherPhoto ? (
                      <Image
                        src={m.otherPhoto}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">?</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold text-stone-900 truncate">{m.otherName}</p>
                    <p className="text-[11px] text-stone-500 font-semibold flex items-center gap-1 mt-0.5">
                      <span>✈️</span> Travel Companion
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      hapticTap();
                      router.push('/messages');
                    }}
                    className="px-4 py-2 rounded-full bg-[#1C1C1E] hover:bg-black active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MY TRIPS & REQUESTS */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Hosted Trips */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">Trips You&apos;re Hosting</h2>
                <button
                  onClick={() => {
                    hapticTap();
                    router.push('/trips');
                  }}
                  className="text-xs text-stone-900 font-bold hover:underline cursor-pointer"
                >
                  + New Trip
                </button>
              </div>

              {hostedTrips.length === 0 ? (
                <div className="p-5 rounded-[24px] bg-stone-50 border border-stone-200 text-center shadow-xs">
                  <p className="text-xs text-stone-500">You aren&apos;t hosting any trips yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hostedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => {
                        hapticTap();
                        router.push('/trips');
                      }}
                      className="p-5 rounded-[28px] bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-sm">
                            <MapPin className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                            <span>{trip.destination}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>
                              {trip.start_date} → {trip.end_date}
                            </span>
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800 border border-stone-300">
                          {trip.vibe}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-200/80 text-[11px] text-stone-600 font-medium">
                        <span>
                          {trip.spots_available} of {trip.spots_total} spots left
                        </span>
                        <span className="text-stone-900 font-bold">Manage Requests →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Requested Trips */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">Trips You Applied To</h2>

              {myRequests.length === 0 ? (
                <div className="p-5 rounded-[24px] bg-stone-50 border border-stone-200 text-center shadow-xs">
                  <p className="text-xs text-stone-500">No pending trip applications.</p>
                  <button
                    onClick={() => {
                      hapticTap();
                      router.push('/trips');
                    }}
                    className="mt-2 text-xs text-stone-900 font-bold hover:underline cursor-pointer"
                  >
                    Browse Weekend Trips →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => {
                    const trip = req.trip;
                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-[28px] bg-stone-50 border border-stone-200 flex flex-col gap-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-sm">
                              <MapPin className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                              <span>{trip?.destination || 'Weekend Trip'}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              <span>
                                {trip?.start_date} → {trip?.end_date}
                              </span>
                            </p>
                          </div>

                          {/* Status Badge */}
                          {req.status === 'accepted' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                          ) : req.status === 'declined' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3" />
                              <span>Declined</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>

                        {req.status === 'accepted' && (
                          <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between">
                            <span className="text-[11px] text-stone-800 font-semibold">You are in! Chat with your host</span>
                            <button
                              onClick={() => {
                                hapticTap();
                                router.push('/messages');
                              }}
                              className="px-4 py-1.5 bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold rounded-full transition-all shadow-sm cursor-pointer"
                            >
                              Open Chat
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
