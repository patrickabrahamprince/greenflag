'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  Shield,
  Users,
  Bell,
  Search,
  Filter,
  Loader2,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Coffee,
  Car,
  Sunset
} from 'lucide-react';
import { Trip, TripRequest } from '@/types';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
import { CreateTripModal } from '@/components/trips/CreateTripModal';
import { JoinTripModal } from '@/components/trips/JoinTripModal';
import { ManageRequestsModal } from '@/components/trips/ManageRequestsModal';
import { TripDetailsModal } from '@/components/trips/TripDetailsModal';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

const VIBE_FILTERS = [
  { id: 'all', label: 'All Plans', icon: '✨', bg: 'bg-amber-100 text-amber-900 border-amber-300', active: 'bg-[#1D3B2A] text-white' },
  { id: 'Chill', label: 'Café & Chill', icon: '☕', bg: 'bg-orange-100 text-orange-900 border-orange-200', active: 'bg-orange-600 text-white' },
  { id: 'Foodie', label: 'Food & Drinks', icon: '🍕', bg: 'bg-rose-100 text-rose-900 border-rose-200', active: 'bg-rose-600 text-white' },
  { id: 'Daytrip', label: 'Day Drives', icon: '🌅', bg: 'bg-amber-100 text-amber-900 border-amber-200', active: 'bg-amber-600 text-white' },
  { id: 'Roadtrip', label: 'Weekend Trips', icon: '🚗', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', active: 'bg-emerald-700 text-white' },
  { id: 'Trek', label: 'Treks & Hikes', icon: '🥾', bg: 'bg-teal-100 text-teal-900 border-teal-200', active: 'bg-teal-700 text-white' },
  { id: 'Beach', label: 'Beach Days', icon: '🏖️', bg: 'bg-cyan-100 text-cyan-900 border-cyan-200', active: 'bg-cyan-700 text-white' },
];

export default function TripsPage() {
  const user = useUserStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [activeTab, setActiveTab] = useState<'explore' | 'my-trips'>('explore');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // My Trips & Requests State
  const [hostedTrips, setHostedTrips] = useState<Trip[]>([]);
  const [myRequests, setMyRequests] = useState<TripRequest[]>([]);
  const [loadingMyTrips, setLoadingMyTrips] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState<Trip | null>(null);
  const [selectedTripForJoin, setSelectedTripForJoin] = useState<Trip | null>(null);
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [manageRequestsList, setManageRequestsList] = useState<TripRequest[]>([]);

  // Fetch Trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (res.ok && data.trips) {
        setTrips(data.trips);
      }
    } catch {
      toast.error('Could not load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch My Trips & Requests
  const fetchMyTrips = useCallback(async () => {
    setLoadingMyTrips(true);
    try {
      const res = await fetch('/api/trips/my');
      const data = await res.json();
      if (res.ok) {
        setHostedTrips(data.hosted || []);
        setMyRequests(data.requests || []);
      }
    } catch {
      // Ignore background errors
    } finally {
      setLoadingMyTrips(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (activeTab === 'my-trips') {
      fetchMyTrips();
    }
  }, [activeTab, fetchMyTrips]);

  const handleTripCreated = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setHostedTrips((prev) => [newTrip, ...prev]);
  };

  const handleRequestSubmitted = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, user_request_status: 'pending' } : t))
    );
    if (selectedTripDetails?.id === tripId) {
      setSelectedTripDetails((prev) => (prev ? { ...prev, user_request_status: 'pending' } : null));
    }
  };

  const handleOpenManage = (trip: Trip) => {
    setSelectedTripForManage(trip);
    const hosted = hostedTrips.find((t) => t.id === trip.id);
    const reqs = (hosted as unknown as { requests?: TripRequest[] })?.requests || [];
    setManageRequestsList(reqs);
  };

  const handleRequestStatusUpdated = (requestId: string, status: 'accepted' | 'declined') => {
    setManageRequestsList((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    fetchMyTrips();
  };

  const filteredTrips = trips.filter((t) => {
    // Vibe category filter
    if (selectedFilter !== 'all' && t.vibe !== selectedFilter) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.destination?.toLowerCase().includes(q) ||
      t.vibe?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.host?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#382A21] pb-44 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header - Editorial Display Style from Beginner UI.fig */}
      <header className="flex items-center justify-between py-4 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#382A21] flex items-center gap-2">
              <span>What Are You Feeling Today?</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D3B2A] animate-pulse" />
            </h1>
          </div>
          <p className="text-xs text-[#382A21]/60 font-medium mt-0.5">Café hangouts, day drives, sunsets, or weekend escapes.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative w-10 h-10 rounded-full bg-white border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-[#382A21] transition-all shadow-[0_2px_8px_rgba(45,36,30,0.04)]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-[#F07A38] rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-[#1D3B2A] hover:bg-[#2D5A3F] active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-[0_4px_12px_rgba(29,59,42,0.3)] transition-all cursor-pointer touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Plan</span>
          </button>
        </div>
      </header>

      {/* Tabs: Explore vs My Trips - Floating Pill Bar */}
      <div className="flex gap-2 p-1.5 bg-stone-200/60 rounded-full mb-4 border border-stone-200 shadow-sm">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setActiveTab('explore');
          }}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-full transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5 ${
            activeTab === 'explore'
              ? 'bg-[#1D3B2A] text-white shadow-md'
              : 'text-[#382A21]/70 hover:text-[#382A21] font-semibold'
          }`}
        >
          <span>✨</span>
          <span>Explore Plans</span>
        </button>
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setActiveTab('my-trips');
          }}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-full transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5 ${
            activeTab === 'my-trips'
              ? 'bg-[#1D3B2A] text-white shadow-md'
              : 'text-[#382A21]/70 hover:text-[#382A21] font-semibold'
          }`}
        >
          <span>🚩</span>
          <span>My Plans & Requests</span>
        </button>
      </div>

      {/* EXPLORE TAB CONTENT */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          
          {/* Hero Banner: Post a Plan Card with Warm Ambient Porcelain Glow */}
          <button 
            type="button"
            onClick={() => {
              hapticTap();
              setIsCreateOpen(true);
            }}
            className="w-full text-left p-5 rounded-[32px] bg-gradient-to-br from-[#1D3B2A] via-[#244633] to-[#1D3B2A] text-white shadow-[0_12px_32px_-8px_rgba(29,59,42,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-[0_16px_40px_-8px_rgba(29,59,42,0.5)] transition-all duration-300 active:scale-[0.98] group touch-manipulation select-none relative overflow-hidden"
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#79A871]/25 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-13 h-13 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                ☕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Got a hangout in mind?
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1D3B2A] bg-[#FAF9F6] px-2.5 py-0.5 rounded-full shadow-sm">
                    Host
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  Pick a vibe, spot & time. Let like-minded people join you.
                </p>
              </div>
            </div>

            <div className="relative z-10 px-5 py-2.5 bg-[#FAF9F6] group-hover:bg-white text-[#1D3B2A] rounded-full text-xs font-extrabold shrink-0 flex items-center justify-center gap-1.5 shadow-md transition-all self-start sm:self-auto active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Post Hangout</span>
            </div>
          </button>

          {/* Quick Filter Horizontal Scrollbar with Organic Pills from Swipe Anims.fig */}
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4 scrollbar-hide">
            {VIBE_FILTERS.map((f) => {
              const isSelected = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedFilter(f.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 flex items-center gap-2 border shadow-sm ${
                    isSelected
                      ? `${f.active} shadow-md scale-105 border-transparent`
                      : `${f.bg} hover:brightness-95`
                  }`}
                >
                  <span className="text-sm">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar from Beginner UI.fig (Clean rounded-[24px], porcelain fill, warm border) */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#382A21]/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots, venues or cities (e.g. Indiranagar, Goa, Coorg)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200/80 rounded-full text-xs text-[#382A21] font-semibold placeholder-[#382A21]/40 focus:outline-none focus:border-[#1D3B2A] focus:ring-2 focus:ring-[#1D3B2A]/10 shadow-[0_2px_8px_rgba(45,36,30,0.03)]"
            />
          </div>

          {/* Trips Feed Cards - UI Cards from UI Elements.fig */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#1D3B2A] animate-spin" />
              <p className="text-xs text-[#382A21]/60 font-bold">Finding hangouts & companions...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/80 rounded-[32px] p-6 shadow-sm animate-fade-in">
              <Compass className="w-12 h-12 text-[#1D3B2A]/30 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-[#382A21]">No plans found</h3>
              <p className="text-xs text-[#382A21]/60 font-medium mt-1 max-w-xs mx-auto">
                No active hangouts match this filter. Be the first to post a hangout or trip!
              </p>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="mt-4 px-5 py-2.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-bold text-xs rounded-full shadow-md cursor-pointer transition-all"
              >
                + Post a Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTrips.map((trip) => {
                const popularDest = POPULAR_DESTINATIONS.find(
                  (d) => d.name.toLowerCase() === trip.destination.toLowerCase()
                );
                const bannerImg = popularDest?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={trip.id}
                    onClick={() => {
                      hapticTap();
                      setSelectedTripDetails(trip);
                    }}
                    className="overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(45,36,30,0.12)] active:scale-[0.98] transform-gpu shadow-[0_4px_16px_rgba(45,36,30,0.04)] group border border-stone-200/80 rounded-[32px] bg-white"
                  >
                    {/* Card Hero Image */}
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={bannerImg}
                        alt={trip.destination}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-black shadow-md border border-white/50 ${
                          trip.vibe === 'Chill' ? 'bg-orange-500 text-white shadow-orange-500/30' :
                          trip.vibe === 'Foodie' ? 'bg-rose-500 text-white shadow-rose-500/30' :
                          trip.vibe === 'Daytrip' ? 'bg-amber-500 text-white shadow-amber-500/30' :
                          trip.vibe === 'Beach' ? 'bg-cyan-500 text-white shadow-cyan-500/30' :
                          trip.vibe === 'Trek' ? 'bg-teal-600 text-white shadow-teal-600/30' :
                          trip.vibe === 'Roadtrip' ? 'bg-emerald-600 text-white shadow-emerald-600/30' :
                          'bg-[#1D3B2A] text-white'
                        }`}>
                          {trip.vibe}
                        </span>
                        {trip.female_only && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                            <Shield className="w-3 h-3" /> Female-Only
                          </span>
                        )}
                      </div>

                      {/* Destination Title on Hero */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-display text-xl font-extrabold text-white drop-shadow-md">
                          {trip.destination}
                        </h3>
                        <p className="text-[11px] text-stone-200 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#79A871]" />
                          <span>{trip.start_date} • {trip.transport_type || 'Meet at Spot'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-3 bg-white">
                      {/* Host & Spots Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-sm">
                            {trip.host?.photos?.[0] ? (
                              <Image
                                src={trip.host.photos[0]}
                                alt={trip.host.name || 'Host'}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-extrabold text-xs text-[#1D3B2A] bg-stone-100">
                                {trip.host?.name?.charAt(0) || 'H'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#382A21] leading-tight">
                              {trip.host?.name || 'Travel Host'}
                            </p>
                            <p className="text-[10px] text-[#382A21]/50 font-medium">Host</p>
                          </div>
                        </div>

                        {/* Spots Available Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1D3B2A]/10 text-[#1D3B2A] text-[10px] font-extrabold">
                          <Users className="w-3 h-3" />
                          <span>
                            {trip.spots_available} of {trip.spots_total} spots left
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {trip.description && (
                        <p className="text-xs text-[#382A21]/70 font-light line-clamp-2 leading-relaxed">
                          {trip.description}
                        </p>
                      )}

                      {/* Price & CTA Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div>
                          <span className="text-[10px] text-[#382A21]/50 block uppercase font-bold tracking-wider">
                            Estimated Budget
                          </span>
                          <span className="text-sm font-extrabold text-[#1D3B2A]">
                            {trip.budget_per_day && trip.budget_per_day > 0
                              ? `₹${trip.budget_per_day.toLocaleString()}`
                              : 'Free / Split'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            hapticTap();
                            setSelectedTripDetails(trip);
                          }}
                          className="px-4 py-2 bg-[#1D3B2A] hover:bg-[#2D5A3F] active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY TRIPS TAB CONTENT */}
      {activeTab === 'my-trips' && (
        <div className="space-y-6">
          
          {/* Hosted Trips */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#382A21]/70">
                Plans You Host ({hostedTrips.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="text-xs font-bold text-[#1D3B2A] hover:underline cursor-pointer"
              >
                + Post Another
              </button>
            </div>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-[#1D3B2A] animate-spin" />
              </div>
            ) : hostedTrips.length === 0 ? (
              <div className="p-6 bg-white border border-stone-200/80 rounded-[28px] text-center shadow-sm">
                <p className="text-xs text-[#382A21]/60 font-medium">You haven&apos;t posted any plans yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setIsCreateOpen(true);
                  }}
                  className="mt-3 px-5 py-2.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 bg-white border border-stone-200/80 rounded-[24px] flex items-center justify-between shadow-[0_2px_8px_rgba(45,36,30,0.03)] hover:border-[#1D3B2A]/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#382A21]">{trip.destination}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1D3B2A]/10 text-[#1D3B2A] font-extrabold border border-[#1D3B2A]/20">
                          {trip.vibe}
                        </span>
                      </div>
                      <p className="text-xs text-[#382A21]/60 font-medium mt-0.5">
                        {trip.start_date} • {trip.spots_available} spots left
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenManage(trip)}
                      className="px-4 py-2 bg-[#FAF9F6] hover:bg-stone-100 text-[#382A21] font-bold text-xs rounded-full flex items-center gap-1.5 border border-stone-200 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-[#1D3B2A]" />
                      <span>Manage</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Joined / Requested Trips */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#382A21]/70 mb-3">
              Your Join Requests ({myRequests.length})
            </h2>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-[#1D3B2A] animate-spin" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-6 bg-white border border-stone-200/80 rounded-[28px] text-center shadow-sm">
                <p className="text-xs text-[#382A21]/60 font-medium">You haven&apos;t requested to join any plans yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setActiveTab('explore');
                  }}
                  className="mt-3 px-5 py-2.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Explore Hangouts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white border border-stone-200/80 rounded-[24px] flex items-center justify-between shadow-[0_2px_8px_rgba(45,36,30,0.03)]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#382A21]">
                          {req.trip?.destination || 'Plan'}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            req.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : req.status === 'declined'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#382A21]/60 font-medium mt-0.5">
                        Host: {req.trip?.host?.name || 'Companion'} • {req.trip?.start_date}
                      </p>
                    </div>

                    {req.status === 'accepted' ? (
                      <Link
                        href="/messages"
                        className="px-4 py-2 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-bold text-xs rounded-full flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Chat</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-[#382A21]/50 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#1D3B2A]" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODALS */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTripCreated={handleTripCreated}
        currentUserPersona={user?.persona}
      />

      <TripDetailsModal
        trip={selectedTripDetails}
        isOpen={!!selectedTripDetails}
        onClose={() => setSelectedTripDetails(null)}
        currentUserId={user?.id}
        onRequestClick={(trip) => {
          setSelectedTripDetails(null);
          setSelectedTripForJoin(trip);
        }}
        onManageClick={(trip) => {
          setSelectedTripDetails(null);
          handleOpenManage(trip);
        }}
      />

      <JoinTripModal
        trip={selectedTripForJoin}
        isOpen={!!selectedTripForJoin}
        onClose={() => setSelectedTripForJoin(null)}
        onRequestSubmitted={handleRequestSubmitted}
      />

      <ManageRequestsModal
        trip={selectedTripForManage}
        requests={manageRequestsList}
        isOpen={!!selectedTripForManage}
        onClose={() => setSelectedTripForManage(null)}
        onRequestStatusUpdated={handleRequestStatusUpdated}
      />

    </div>
  );
}
