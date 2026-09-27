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
  { id: 'all', label: 'All Plans', icon: '✨' },
  { id: 'Chill', label: 'Café & Chill', icon: '☕' },
  { id: 'Foodie', label: 'Food & Drinks', icon: '🍕' },
  { id: 'Daytrip', label: 'Day Drives', icon: '🌅' },
  { id: 'Roadtrip', label: 'Weekend Getaways', icon: '🚗' },
  { id: 'Trek', label: 'Treks & Hikes', icon: '🥾' },
  { id: 'Beach', label: 'Beach Trips', icon: '🏖️' },
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
    <div className="min-h-screen screen-gradient text-slate-900 pb-44 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Plans & Hangouts</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">Evening hangouts, cafés, drives, or weekend escapes.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-emerald-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
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
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </button>
        </div>
      </header>

      {/* Tabs: Explore vs My Trips */}
      <div className="flex gap-2 p-1.5 bg-slate-200/80 rounded-2xl mb-4 shadow-sm">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setActiveTab('explore');
          }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer touch-manipulation ${
            activeTab === 'explore'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold hover:bg-slate-300/40'
          }`}
        >
          Explore Plans
        </button>
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setActiveTab('my-trips');
          }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer touch-manipulation ${
            activeTab === 'my-trips'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-bold hover:bg-slate-300/40'
          }`}
        >
          My Plans & Requests
        </button>
      </div>

      {/* EXPLORE TAB CONTENT */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          
          {/* Radiant Hero: What are you planning? (High contrast, vibrant gradients, animated sparkles) */}
          <button 
            type="button"
            onClick={() => {
              hapticTap();
              setIsCreateOpen(true);
            }}
            className="w-full text-left p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-2 border-emerald-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-emerald-500 hover:shadow-glow-emerald transition-all duration-300 active:scale-[0.98] group touch-manipulation select-none relative overflow-hidden"
          >
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-300 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    What are you planning?
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full border border-emerald-300">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Café hangout, day trip, sunrise drive, or weekend getaway.
                </p>
              </div>
            </div>

            <div className="relative z-10 px-4 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs font-black shrink-0 flex items-center justify-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto">
              <Plus className="w-3.5 h-3.5" />
              <span>Post a Plan</span>
            </div>
          </button>

          {/* Quick Filter Horizontal Scrollbar with Lively Icons */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots (e.g. Indiranagar, Nandi Hills, Goa, Coorg)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            />
          </div>

          {/* Trips Feed Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-bold">Finding hangouts & companions...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fade-in">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce-gentle" />
              <h3 className="text-base font-black text-slate-900">No plans found</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs mx-auto">
                No active hangouts match this filter. Be the first to post a hangout or trip!
              </p>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
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
                    className="card !p-0 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-emerald active:scale-[0.98] transform-gpu shadow-sm group border-slate-200/90 hover:border-emerald-500/60 bg-white"
                  >
                    {/* Card Hero Image */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={bannerImg}
                        alt={trip.destination}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 backdrop-blur-md text-white text-[10px] font-black shadow-sm">
                          {trip.vibe}
                        </span>
                        {trip.female_only && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Shield className="w-2.5 h-2.5" /> Female-Only
                          </span>
                        )}
                      </div>

                      {/* Destination Title on Hero */}
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-xl font-black text-white drop-shadow-md">
                          {trip.destination}
                        </h3>
                        <p className="text-[11px] text-slate-200 font-bold">
                          {trip.start_date} • {trip.transport_type || 'Meet at Spot'}
                        </p>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-3 bg-white">
                      {/* Host & Spots Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 bg-slate-100 shrink-0 shadow-sm">
                            {trip.host?.photos?.[0] ? (
                              <Image
                                src={trip.host.photos[0]}
                                alt={trip.host.name || 'Host'}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                                {trip.host?.name?.charAt(0) || 'H'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900 leading-tight">
                              {trip.host?.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {trip.host?.city || 'Bangalore'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-700">
                            {trip.spots_available} spot{trip.spots_available !== 1 ? 's' : ''} left
                          </div>
                          <div className="text-[10px] text-slate-600 font-bold">₹{trip.budget_per_day}/person</div>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                        {trip.description}
                      </p>

                      {/* Bottom Action */}
                      <div className="pt-2.5 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">Safe • Approval required</span>
                        <span className="text-xs font-black text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View Plan</span>
                          <span>&rarr;</span>
                        </span>
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
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                Plans You Host ({hostedTrips.length})
              </h2>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="text-xs font-black text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                + Post Another
              </button>
            </div>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            ) : hostedTrips.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">You haven&apos;t posted any plans yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setIsCreateOpen(true);
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{trip.destination}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                          {trip.vibe}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {trip.start_date} • {trip.spots_available} spots left
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenManage(trip)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manage</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Joined / Requested Trips */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3">
              Your Join Requests ({myRequests.length})
            </h2>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                <p className="text-xs text-slate-600 font-medium">You haven&apos;t requested to join any plans yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setActiveTab('explore');
                  }}
                  className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                >
                  Explore Hangouts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          {req.trip?.destination || 'Plan'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Host: {req.trip?.host?.name || 'Companion'} • {req.trip?.start_date}
                      </p>
                    </div>

                    {req.status === 'accepted' ? (
                      <Link
                        href="/messages"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Chat</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
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
