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
    <div className="h-[calc(100dvh-5rem)] bg-[#FAF9F6] max-w-app mx-auto flex flex-col">
      {/* Top Header */}
      <div className="px-6 pt-safe-top shrink-0">
        <div className="pt-5 mb-4">
          <h1 className="font-display text-2xl text-[#382A21] font-extrabold tracking-tight">My Trips & Connections</h1>
          <p className="text-xs text-[#382A21]/60 mt-0.5 font-medium">Manage your travel connections and trip plans</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 bg-stone-200/60 rounded-full mb-4 border border-stone-200">
          <button
            onClick={() => {
              hapticTap();
              setActiveTab('buddies');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'buddies'
                ? 'bg-[#1D3B2A] text-white shadow-sm'
                : 'text-[#382A21]/60 hover:text-[#382A21]'
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
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trips'
                ? 'bg-[#1D3B2A] text-white shadow-sm'
                : 'text-[#382A21]/60 hover:text-[#382A21]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>My Trips ({hostedTrips.length + myRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none px-6 pb-24 flex flex-col"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out shrink-0"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-[#1D3B2A] ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        {/* TAB 1: TRAVEL CONNECTIONS */}
        {activeTab === 'buddies' && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
                <div className="w-16 h-16 rounded-full bg-[#1D3B2A]/10 border border-[#1D3B2A]/20 flex items-center justify-center mb-4 shadow-sm">
                  <Compass className="w-8 h-8 text-[#1D3B2A]" />
                </div>
                <h2 className="font-display text-lg text-[#382A21] font-bold mb-1.5">No People for Trips Yet</h2>
                <p className="text-[#382A21]/60 text-xs max-w-xs mb-6 leading-relaxed">
                  Discover travelers heading to your favorite destinations and connect with a single tap.
                </p>
                <button
                  onClick={() => {
                    hapticTap();
                    router.push('/discover');
                  }}
                  className="bg-[#1D3B2A] text-white text-xs py-3 px-6 rounded-full font-bold flex items-center gap-2 shadow-md hover:bg-[#2D5A3F] active:scale-95 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Meet People for Trips</span>
                </button>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className="w-full flex items-center gap-3.5 p-4 bg-white border border-stone-200/80 rounded-[24px] transition-all hover:border-[#1D3B2A]/30 shadow-[0_4px_16px_rgba(45,36,30,0.04)]"
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
                    <p className="font-display text-sm font-bold text-[#382A21] truncate">{m.otherName}</p>
                    <p className="text-[11px] text-[#1D3B2A] font-semibold flex items-center gap-1 mt-0.5">
                      <span>✈️</span> Travel Companion
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      hapticTap();
                      router.push('/messages');
                    }}
                    className="px-4 py-2 rounded-full bg-[#1D3B2A] hover:bg-[#2D5A3F] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#382A21]/70">Trips You&apos;re Hosting</h2>
                <button
                  onClick={() => {
                    hapticTap();
                    router.push('/trips');
                  }}
                  className="text-xs text-[#1D3B2A] font-bold hover:underline"
                >
                  + New Trip
                </button>
              </div>

              {hostedTrips.length === 0 ? (
                <div className="p-5 rounded-[24px] bg-white border border-stone-200/80 text-center shadow-sm">
                  <p className="text-xs text-[#382A21]/60">You aren&apos;t hosting any trips yet.</p>
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
                      className="p-5 rounded-[28px] bg-white border border-stone-200/80 hover:border-[#1D3B2A]/40 transition-all cursor-pointer shadow-[0_4px_16px_rgba(45,36,30,0.04)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-[#382A21] font-extrabold text-sm">
                            <MapPin className="w-3.5 h-3.5 text-[#1D3B2A] shrink-0" />
                            <span>{trip.destination}</span>
                          </div>
                          <p className="text-[11px] text-[#382A21]/60 mt-1 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-[#382A21]/40" />
                            <span>
                              {trip.start_date} → {trip.end_date}
                            </span>
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#1D3B2A]/10 text-[#1D3B2A] border border-[#1D3B2A]/20">
                          {trip.vibe}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-[11px] text-[#382A21]/70 font-medium">
                        <span>
                          {trip.spots_available} of {trip.spots_total} spots left
                        </span>
                        <span className="text-[#1D3B2A] font-bold">Manage Requests →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Requested Trips */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#382A21]/70 mb-3">Trips You Applied To</h2>

              {myRequests.length === 0 ? (
                <div className="p-5 rounded-[24px] bg-white border border-stone-200/80 text-center shadow-sm">
                  <p className="text-xs text-[#382A21]/60">No pending trip applications.</p>
                  <button
                    onClick={() => {
                      hapticTap();
                      router.push('/trips');
                    }}
                    className="mt-2 text-xs text-[#1D3B2A] font-bold hover:underline"
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
                        className="p-5 rounded-[28px] bg-white border border-stone-200/80 flex flex-col gap-2 shadow-[0_4px_16px_rgba(45,36,30,0.04)]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[#382A21] font-extrabold text-sm">
                              <MapPin className="w-3.5 h-3.5 text-[#1D3B2A] shrink-0" />
                              <span>{trip?.destination || 'Weekend Trip'}</span>
                            </div>
                            <p className="text-[11px] text-[#382A21]/60 mt-1 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-[#382A21]/40" />
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
                          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-[11px] text-[#1D3B2A] font-semibold">You are in! Chat with your host</span>
                            <button
                              onClick={() => {
                                hapticTap();
                                router.push('/messages');
                              }}
                              className="px-4 py-1.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white text-xs font-bold rounded-full transition-all shadow-sm"
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
