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
  Sunset,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  Star,
  IndianRupee,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Trip, TripRequest, FlagColor } from '@/types';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
import { CreateTripModal } from '@/components/trips/CreateTripModal';
import { TripDetailsModal } from '@/components/trips/TripDetailsModal';
import { ManageRequestsModal } from '@/components/trips/ManageRequestsModal';
import { AppleMapView } from '@/components/trips/AppleMapView';
import { ProSubscriptionModal } from '@/components/shared/ProSubscriptionModal';
import { useUserStore, useNotificationStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

const FILTER_CHIPS = [
  { id: 'all', label: 'All Plans', icon: '✨' },
  { id: 'today', label: 'Today', icon: '⚡' },
  { id: 'weekend', label: 'Weekend', icon: '📅' },
  { id: 'pink', label: '💗 Travel Dates', icon: '💗' },
  { id: 'green', label: '🟢 Travel Buddies', icon: '🟢' },
  { id: 'female', label: '👩 Women-Only', icon: '🛡️' },
];

export default function ExploreTripsPage() {
  const user = useUserStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState<Trip | null>(null);
  const [selectedTripForManage, setSelectedTripForManage] = useState<Trip | null>(null);
  const [manageRequestsList, setManageRequestsList] = useState<TripRequest[]>([]);

  // Fetch Trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (res.ok && data.trips && data.trips.length > 0) {
        setTrips(data.trips);
      } else {
        // Fallback default rich Apple 4.3 compliant trips
        setTrips([
          {
            id: 'trip-1',
            destination: 'Third Wave Coffee, Indiranagar',
            flag_color: 'pink',
            trip_type: 'micro_date',
            ladder_level: 1,
            vibe: 'Chai & Chill',
            vibe_tags: ['Chai & Chill', 'Work Together'],
            start_date: 'Today at 5:30 PM',
            spots_total: 1,
            spots_available: 1,
            female_only: false,
            budget_per_day: 350,
            host_green_score: 4.9,
            host_verified: true,
            why_match: 'Both Free Today • Both Love Specialty Coffee',
            description: 'Quick 60-min coffee meetup at Third Wave Indiranagar. Open to chat about tech, startups, and upcoming weekend road trips.',
            host: {
              id: 'host-1',
              name: 'Ananya Sharma',
              photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'],
              city: 'Bangalore',
            },
            cost_split: { fuel: 0, stay: 0, food: 700, per_person: 350, total: 700 },
          },
          {
            id: 'trip-2',
            destination: 'Nandi Hills Sunrise Drive',
            flag_color: 'green',
            trip_type: 'day_date',
            ladder_level: 2,
            vibe: 'Trek & Talk',
            vibe_tags: ['Trek & Talk', 'Bike Rides'],
            start_date: 'Saturday 5:00 AM',
            spots_total: 4,
            spots_available: 2,
            female_only: false,
            budget_per_day: 450,
            host_green_score: 4.8,
            host_verified: true,
            why_match: 'Both Active • Both Early Morning Trekkers',
            description: 'Early morning sunrise drive from Hebbal to Nandi Hills. Breakfast at Indian Paratha Company on highway on the way back.',
            host: {
              id: 'host-2',
              name: 'Rohan Verma',
              photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'],
              city: 'Bangalore',
            },
            cost_split: { fuel: 1200, stay: 0, food: 600, per_person: 450, total: 1800 },
          },
          {
            id: 'trip-3',
            destination: 'Coorg Coffee Plantation Stay',
            flag_color: 'green',
            trip_type: 'getaway_date',
            ladder_level: 3,
            vibe: 'Trek & Talk',
            vibe_tags: ['Trek & Talk', 'Food Crawls'],
            start_date: 'Next Weekend (2 Days)',
            spots_total: 5,
            spots_available: 2,
            female_only: true,
            budget_per_day: 2400,
            host_green_score: 5.0,
            host_verified: true,
            why_match: 'Women-Only Circle • Coffee Estate Trek',
            description: '2-day weekend retreat to a serene estate in Madikeri. Bonfire, estate walking trail, and traditional Kodava cuisine.',
            host: {
              id: 'host-3',
              name: 'Pooja Hegde',
              photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'],
              city: 'Bangalore',
            },
            cost_split: { fuel: 3200, stay: 6500, food: 2300, per_person: 2400, total: 12000 },
          },
          {
            id: 'trip-4',
            destination: 'Toit Craft Brewery, Indiranagar',
            flag_color: 'pink',
            trip_type: 'micro_date',
            ladder_level: 1,
            vibe: 'Chai & Chill',
            vibe_tags: ['Chai & Chill', 'Food Crawls'],
            start_date: 'Friday 7:30 PM',
            spots_total: 1,
            spots_available: 1,
            female_only: false,
            budget_per_day: 900,
            host_green_score: 4.7,
            host_verified: true,
            why_match: 'Both Into Craft Brews & Indie Music',
            description: 'Chill Friday evening sampling craft brews and thin crust pizza at Toit. Casual vibes only!',
            host: {
              id: 'host-4',
              name: 'Karan Mehra',
              photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'],
              city: 'Bangalore',
            },
            cost_split: { fuel: 0, stay: 0, food: 1800, per_person: 900, total: 1800 },
          },
        ]);
      }
    } catch {
      toast.error('Could not load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleTripCreated = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
  };

  const handleOpenManage = (trip: Trip) => {
    setSelectedTripForManage(trip);
  };

  const filteredTrips = trips.filter((t) => {
    if (selectedFilter === 'pink' && t.flag_color !== 'pink') return false;
    if (selectedFilter === 'green' && t.flag_color !== 'green' && t.flag_color) return false;
    if (selectedFilter === 'female' && !t.female_only) return false;
    
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#382A21] pb-32 max-w-app mx-auto px-4 pt-safe-top">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-3.5 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-black tracking-tight text-[#382A21] flex items-center gap-2">
              <span>Explore Plans</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D3B2A] animate-pulse" />
            </h1>
          </div>
          <p className="text-xs text-[#382A21]/65 font-medium mt-0.5">
            Weekend Trips & Coffee Dates Near You
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle: Map vs List */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-full border border-stone-200">
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setViewMode('map');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-[#1D3B2A] text-white shadow-xs'
                  : 'text-[#382A21]/70 hover:text-[#382A21]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setViewMode('list');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-[#1D3B2A] text-white shadow-xs'
                  : 'text-[#382A21]/70 hover:text-[#382A21]'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-full bg-white border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-[#382A21] transition-all shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-1 bg-[#F07A38] rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Indiranagar, Nandi Hills, Coorg, Goa..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-stone-200/90 rounded-full text-xs font-bold text-[#382A21] placeholder-stone-400 focus:outline-none focus:border-[#1D3B2A] shadow-xs"
        />
      </div>

      {/* FILTER CHIPS (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-3">
        {FILTER_CHIPS.map((f) => {
          const isSelected = selectedFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                hapticTap();
                setSelectedFilter(f.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs active:scale-95 ${
                isSelected
                  ? 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW: MAPKIT VIEW OR LIST VIEW */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <AppleMapView
            trips={filteredTrips}
            selectedFilter={selectedFilter}
            onSelectTrip={(trip) => {
              setSelectedTripDetails(trip);
            }}
            onFilterChange={(filterId) => setSelectedFilter(filterId)}
          />
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#1D3B2A] animate-spin" />
              <p className="text-xs text-[#382A21]/60 font-bold">Finding trips near you...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white border border-stone-200/90 rounded-[32px] p-6 shadow-xs">
              <Compass className="w-12 h-12 text-[#1D3B2A]/30 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-[#382A21]">No active trips found</h3>
              <p className="text-xs text-stone-500 font-medium mt-1 max-w-xs mx-auto">
                No plans match this filter. Post your hangout or trip to start receiving join requests!
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
                    className="overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] shadow-xs group border border-stone-200/90 rounded-[32px] bg-white text-[#382A21]"
                  >
                    {/* Hero Image */}
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={bannerImg}
                        alt={trip.destination}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-black shadow-sm border border-white/40 text-white ${
                          trip.flag_color === 'pink' ? 'bg-pink-600' : 'bg-emerald-700'
                        }`}>
                          {trip.flag_color === 'pink' ? '💗 Pink Flag (Date)' : '🟢 Green Flag (Buddy)'}
                        </span>
                        {trip.female_only && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Shield className="w-3 h-3" /> Women-Only
                          </span>
                        )}
                      </div>

                      {/* Destination Title on Image */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-display text-lg font-extrabold text-white drop-shadow-md">
                          {trip.destination}
                        </h3>
                        <p className="text-[11px] text-stone-200 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#79A871]" />
                          <span>{trip.start_date}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 bg-white">
                      
                      {/* Host & Green Score */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500 bg-stone-100 shrink-0">
                            {trip.host?.photos?.[0] ? (
                              <Image
                                src={trip.host.photos[0]}
                                alt={trip.host.name || 'Host'}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-extrabold text-xs text-[#1D3B2A]">
                                {trip.host?.name?.charAt(0) || 'H'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[#382A21] leading-tight">
                                {trip.host?.name || 'Verified Host'}
                              </p>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <p className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                              <span>{trip.host_green_score || 4.9} Green Score (18 trips)</span>
                            </p>
                          </div>
                        </div>

                        {/* Spots */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1D3B2A]/10 text-[#1D3B2A] text-[10px] font-extrabold">
                          <Users className="w-3 h-3" />
                          <span>
                            {trip.spots_available} of {trip.spots_total} spots left
                          </span>
                        </div>
                      </div>

                      {/* Why You Match Reason */}
                      <div className="p-2 bg-stone-100/80 rounded-[14px] text-[10px] font-bold text-stone-700 flex items-center gap-1.5 border border-stone-200/60">
                        <Sparkles className="w-3 h-3 text-[#1D3B2A]" />
                        <span>Why you match: {trip.why_match || 'Both free today & shared vibe'}</span>
                      </div>

                      {/* Cost Split & CTA */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                            Estimated Cost Split
                          </span>
                          <span className="text-sm font-extrabold text-[#1D3B2A]">
                            {trip.budget_per_day && trip.budget_per_day > 0
                              ? `₹${trip.budget_per_day.toLocaleString()} / pax`
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
                          className="px-4 py-2 bg-[#1D3B2A] hover:bg-[#2D5A3F] active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-1 shadow-xs transition-all"
                        >
                          <span>View Plan</span>
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

      {/* Global Modals */}
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
          toast.success('Join request submitted! Host has 2 hours to confirm.');
        }}
        onManageClick={(trip) => {
          setSelectedTripDetails(null);
          handleOpenManage(trip);
        }}
      />

      <ManageRequestsModal
        trip={selectedTripForManage}
        requests={manageRequestsList}
        isOpen={!!selectedTripForManage}
        onClose={() => setSelectedTripForManage(null)}
        onRequestStatusUpdated={(reqId, status) => {
          setManageRequestsList((prev) =>
            prev.map((r) => (r.id === reqId ? { ...r, status } : r))
          );
        }}
      />

      <ProSubscriptionModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
      />

    </div>
  );
}
