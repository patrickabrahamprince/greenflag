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
  Bike,
  CheckCircle2,
  Clock,
  Compass,
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

export default function TripsPage() {
  const user = useUserStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [activeTab, setActiveTab] = useState<'explore' | 'my-trips'>('explore');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [femaleOnlyFilter, setFemaleOnlyFilter] = useState(false);

  // My Trips state
  const [hostedTrips, setHostedTrips] = useState<Trip[]>([]);
  const [myRequests, setMyRequests] = useState<TripRequest[]>([]);
  const [loadingMyTrips, setLoadingMyTrips] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState<Trip | null>(null);
  const [selectedTripForJoin, setSelectedTripForJoin] = useState<Trip | null>(null);
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [manageRequestsList, setManageRequestsList] = useState<TripRequest[]>([]);

  // Fetch Trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDestination !== 'all') params.append('destination', selectedDestination);
      if (selectedVibe !== 'all') params.append('vibe', selectedVibe);
      if (femaleOnlyFilter) params.append('female_only', 'true');

      const res = await fetch(`/api/trips?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.trips) {
        setTrips(data.trips);
      }
    } catch {
      toast.error('Could not load trips');
    } finally {
      setLoading(false);
    }
  }, [selectedDestination, selectedVibe, femaleOnlyFilter]);

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
    // Find requests for this trip from hostedTrips
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

  return (
    <div className="min-h-screen screen-gradient text-ink pb-44 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-ink flex items-center gap-1.5">
              <span>Trips</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
          </div>
          <p className="text-xs text-ink/60 font-medium">Meet new people for any trip. Never travel alone.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full bg-well hover:bg-black/5 flex items-center justify-center text-ink/70 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              hapticTap();
              setIsCreateOpen(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>
      </header>

      {/* Tabs: Explore vs My Trips */}
      <div className="flex gap-2 p-1 bg-well rounded-2xl mb-4">
        <button
          onClick={() => {
            hapticTap();
            setActiveTab('explore');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'explore'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-ink/60 hover:text-ink'
          }`}
        >
          Explore Trips
        </button>
        <button
          onClick={() => {
            hapticTap();
            setActiveTab('my-trips');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'my-trips'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-ink/60 hover:text-ink'
          }`}
        >
          My Trips & Requests
        </button>
      </div>

      {/* EXPLORE TAB CONTENT */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          
          {/* Travel Hero Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1">
              <span>✈️</span>
              <span>Any Trip • Any Vibe</span>
            </div>
            <h2 className="text-base font-display font-bold text-ink mb-1">
              Meet New People for Any Adventure
            </h2>
            <p className="text-xs text-ink/70 leading-relaxed">
              Road trips, beach escapes, mountain treks, cafe crawls, or camping — connect with verified travelers and go together.
            </p>
          </div>

          {/* Quick Destination Filter Chips */}
          <div className="overflow-x-auto scrollbar-none flex items-center gap-2 pb-1.5">
            <button
              onClick={() => {
                hapticTap();
                setSelectedDestination('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedDestination === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-ink/70 hover:bg-slate-50'
              }`}
            >
              ✨ All Escapes
            </button>
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = selectedDestination.toLowerCase() === dest.name.toLowerCase();
              return (
                <button
                  key={dest.name}
                  onClick={() => {
                    hapticTap();
                    setSelectedDestination(isSelected ? 'all' : dest.name.toLowerCase());
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-ink/70 hover:bg-slate-50'
                  }`}
                >
                  <span>📍</span>
                  <span>{dest.name}</span>
                </button>
              );
            })}
          </div>

          {/* Vibe & Safety Sub-filters */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { name: 'all', label: 'All Vibes', icon: '✨' },
                { name: 'Roadtrip', label: 'Road Trip', icon: '🚗' },
                { name: 'Trek', label: 'Trek', icon: '🏔' },
                { name: 'Beach', label: 'Beach', icon: '🏖' },
                { name: 'Foodie', label: 'Foodie', icon: '🍸' },
                { name: 'Camping', label: 'Camping', icon: '🏕' },
                { name: 'Chill', label: 'Chill', icon: '🌿' },
                { name: 'Adventure', label: 'Adventure', icon: '⚡️' },
              ].map((vibe) => (
                <button
                  key={vibe.name}
                  onClick={() => {
                    hapticTap();
                    setSelectedVibe(vibe.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                    selectedVibe === vibe.name
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-ink/70 hover:text-ink hover:bg-slate-50'
                  }`}
                >
                  <span>{vibe.icon}</span>
                  <span>{vibe.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                hapticTap();
                setFemaleOnlyFilter((prev) => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                femaleOnlyFilter
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Women Only</span>
            </button>
          </div>

          {/* Trips Feed Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-ink/50">Finding weekend companions...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-16 bg-white border border-black/[0.08] rounded-3xl p-6 shadow-sm">
              <Compass className="w-12 h-12 text-ink/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No trips found</h3>
              <p className="text-xs text-ink/50 mt-1 max-w-xs mx-auto">
                No trips match your filters. Be the first to post a trip for this destination!
              </p>
              <button
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-500"
              >
                + Create Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map((trip) => {
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
                    className="card !p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] transform-gpu shadow-sm group border-black/[0.08] hover:border-emerald/40 bg-white"
                  >
                    {/* Card Hero Image */}
                    <div className="relative h-36 w-full overflow-hidden">
                      <Image
                        src={bannerImg}
                        alt={trip.destination}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 backdrop-blur-sm text-white text-[10px] font-black">
                          {trip.vibe}
                        </span>
                        {trip.female_only && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> Female-Only
                          </span>
                        )}
                      </div>

                      {/* Destination Title on Hero */}
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-xl font-black text-white drop-shadow-md">
                          {trip.destination}
                        </h3>
                        <p className="text-[11px] text-white/90 font-medium">
                          {trip.start_date} • {trip.transport_type || 'Ride Split'}
                        </p>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-3 bg-white">
                      {/* Host & Spots Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 bg-well shrink-0">
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
                            <div className="text-xs font-bold text-ink leading-tight">
                              {trip.host?.name}
                            </div>
                            <div className="text-[10px] text-ink/50">
                              {trip.host?.city || 'Bangalore'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-700">
                            {trip.spots_available} spot{trip.spots_available !== 1 ? 's' : ''} left
                          </div>
                          <div className="text-[10px] text-ink/50">₹{trip.budget_per_day}/day</div>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-ink/70 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>

                      {/* Bottom Action */}
                      <div className="pt-2 flex items-center justify-between border-t border-black/[0.06]">
                        <span className="text-[11px] text-ink/50">Safe • Approval required</span>
                        <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Trips You Host ({hostedTrips.length})
              </h2>
              <button
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
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
                <p className="text-xs text-ink/60">You haven&apos;t posted any trips yet.</p>
                <button
                  onClick={() => {
                    hapticTap();
                    setIsCreateOpen(true);
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Create Your First Trip
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">{trip.destination}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          {trip.vibe}
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 mt-0.5">
                        {trip.start_date} • {trip.spots_available} spots left
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenManage(trip)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-ink font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all"
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/70 mb-3">
              Your Join Requests ({myRequests.length})
            </h2>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                <p className="text-xs text-ink/60">You haven&apos;t requested to join any trips yet.</p>
                <button
                  onClick={() => {
                    hapticTap();
                    setActiveTab('explore');
                  }}
                  className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink font-bold text-xs rounded-xl border border-slate-200"
                >
                  Explore Trips
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
                        <span className="text-sm font-bold text-ink">
                          {req.trip?.destination || 'Trip'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                      <p className="text-xs text-ink/60 mt-0.5">
                        Host: {req.trip?.host?.name || 'Traveler'} • {req.trip?.start_date}
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
                      <span className="text-xs text-ink/50 flex items-center gap-1">
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
