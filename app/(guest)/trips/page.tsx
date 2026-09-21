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
    <div className="min-h-screen bg-black text-white pb-28 max-w-app mx-auto px-4 pt-4">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-white/5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Trips</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
          </div>
          <p className="text-xs text-white/60 font-medium">Don&apos;t just match. Go somewhere together.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-black">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              hapticTap();
              setIsCreateOpen(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold text-xs rounded-full flex items-center gap-1.5 shadow-[0_2px_12px_rgba(16,185,129,0.3)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>
      </header>

      {/* Tabs: Explore vs My Trips */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-4">
        <button
          onClick={() => {
            hapticTap();
            setActiveTab('explore');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'explore'
              ? 'bg-emerald-500 text-black shadow-sm'
              : 'text-white/60 hover:text-white'
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
              ? 'bg-emerald-500 text-black shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          My Trips & Requests
        </button>
      </div>

      {/* EXPLORE TAB CONTENT */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          
          {/* Quick Destination Filter Chips */}
          <div className="overflow-x-auto scrollbar-none flex items-center gap-2 pb-1">
            <button
              onClick={() => {
                hapticTap();
                setSelectedDestination('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedDestination === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              All Destinations
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {dest.name}
                </button>
              );
            })}
          </div>

          {/* Vibe & Safety Sub-filters */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['all', 'Trek', 'Chill', 'Roadtrip', 'Backpacking'].map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => {
                    hapticTap();
                    setSelectedVibe(vibe);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedVibe === vibe
                      ? 'bg-white/20 text-white font-semibold'
                      : 'bg-white/5 text-white/50 hover:text-white/80'
                  }`}
                >
                  {vibe === 'all' ? 'All Vibes' : vibe}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                hapticTap();
                setFemaleOnlyFilter((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-all ${
                femaleOnlyFilter
                  ? 'bg-purple-500/25 border border-purple-400/50 text-purple-300'
                  : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Female-Only</span>
            </button>
          </div>

          {/* Trips Feed Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-white/50">Finding weekend companions...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <Compass className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No trips found</h3>
              <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                No trips match your filters. Be the first to post a trip for this destination!
              </p>
              <button
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl shadow-md"
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
                    className="bg-[#121216] border border-white/10 hover:border-emerald-500/30 rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-lg group"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/50" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-black text-[10px] font-black">
                          {trip.vibe}
                        </span>
                        {trip.female_only && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> Female-Only
                          </span>
                        )}
                      </div>

                      {/* Destination Title on Hero */}
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-xl font-black text-white drop-shadow-md">
                          {trip.destination}
                        </h3>
                        <p className="text-[11px] text-white/80 font-medium">
                          {trip.start_date} • {trip.transport_type || 'Ride Split'}
                        </p>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-4 space-y-3">
                      {/* Host & Spots Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 bg-neutral-800 shrink-0">
                            {trip.host?.photos?.[0] ? (
                              <Image
                                src={trip.host.photos[0]}
                                alt={trip.host.name || 'Host'}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold text-xs">
                                {trip.host?.name?.charAt(0) || 'H'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {trip.host?.name}
                            </div>
                            <div className="text-[10px] text-white/50">
                              {trip.host?.city || 'Bangalore'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-extrabold text-emerald-400">
                            {trip.spots_available} spot{trip.spots_available !== 1 ? 's' : ''} left
                          </div>
                          <div className="text-[10px] text-white/50">₹{trip.budget_per_day}/day</div>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>

                      {/* Bottom Action */}
                      <div className="pt-1 flex items-center justify-between border-t border-white/5">
                        <span className="text-[11px] text-white/40">Safe • Approval required</span>
                        <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1">
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Trips You Host ({hostedTrips.length})
              </h2>
              <button
                onClick={() => {
                  hapticTap();
                  setIsCreateOpen(true);
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                + Post Another
              </button>
            </div>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : hostedTrips.length === 0 ? (
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-xs text-white/50">You haven&apos;t posted any trips yet.</p>
                <button
                  onClick={() => {
                    hapticTap();
                    setIsCreateOpen(true);
                  }}
                  className="mt-3 px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-lg"
                >
                  Create Your First Trip
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 bg-[#121216] border border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{trip.destination}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {trip.vibe}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        {trip.start_date} • {trip.spots_available} spots left
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenManage(trip)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Manage</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Joined / Requested Trips */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">
              Your Join Requests ({myRequests.length})
            </h2>

            {loadingMyTrips ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-xs text-white/50">You haven&apos;t requested to join any trips yet.</p>
                <button
                  onClick={() => {
                    hapticTap();
                    setActiveTab('explore');
                  }}
                  className="mt-3 px-3 py-1.5 bg-white/10 text-white font-semibold text-xs rounded-lg"
                >
                  Explore Trips
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-[#121216] border border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {req.trip?.destination || 'Trip'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : req.status === 'declined'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Host: {req.trip?.host?.name || 'Traveler'} • {req.trip?.start_date}
                      </p>
                    </div>

                    {req.status === 'accepted' ? (
                      <Link
                        href="/messages"
                        className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Chat</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-white/40 flex items-center gap-1">
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
