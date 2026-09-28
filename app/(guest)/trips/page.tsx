'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Zap,
  Info,
  Users,
  Shield,
  MessageCircle,
  Calendar,
  Fuel,
  Home as HomeIcon,
  Utensils,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface Trip {
  id: number;
  destination: string;
  time: string;
  spots: number;
  totalSpots: number;
  cost: number;
  type: 'green' | 'pink';
  score: number;
  match: string;
  host: {
    name: string;
    avatar: string;
    level: number;
  };
  vibe: string[];
  gradient: string;
  pin: { x: number; y: number };
}

const TRIPS_DATA: Trip[] = [
  {
    id: 1,
    destination: 'Nandi Hills Sunrise',
    time: 'Today · 5:30 AM',
    spots: 2,
    totalSpots: 4,
    cost: 800,
    type: 'green',
    score: 4.9,
    match: 'You both love sunrise treks',
    host: { name: 'Aarav', avatar: 'A', level: 12 },
    vibe: ['Chai & Chill', 'Trek & Talk'],
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    pin: { x: 32, y: 28 },
  },
  {
    id: 2,
    destination: 'Coorg Coffee Trails',
    time: 'Weekend · Sat 7AM',
    spots: 1,
    totalSpots: 3,
    cost: 2400,
    type: 'pink',
    score: 4.8,
    match: 'Coffee lover + photographer',
    host: { name: 'Meera', avatar: 'M', level: 8 },
    vibe: ['Slow Travel', 'Photo Walks'],
    gradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    pin: { x: 68, y: 62 },
  },
  {
    id: 3,
    destination: 'Cubbon Park Walk',
    time: 'Today · 6 PM',
    spots: 3,
    totalSpots: 5,
    cost: 0,
    type: 'green',
    score: 4.7,
    match: 'Both new to Bangalore',
    host: { name: 'Rohan', avatar: 'R', level: 5 },
    vibe: ['City Walks', 'Deep Talks'],
    gradient: 'from-amber-300 via-orange-400 to-rose-400',
    pin: { x: 52, y: 40 },
  },
  {
    id: 4,
    destination: 'Skandagiri Night Trek',
    time: 'Tomorrow · 11 PM',
    spots: 2,
    totalSpots: 6,
    cost: 1200,
    type: 'green',
    score: 4.9,
    match: 'Your trek count matches!',
    host: { name: 'Sanya', avatar: 'S', level: 15 },
    vibe: ['Night Trek', 'Adrenaline'],
    gradient: 'from-violet-400 via-indigo-400 to-blue-400',
    pin: { x: 42, y: 18 },
  },
];

function TripsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'explore' | 'create'>('explore');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create 5-Step Form State
  const [createStep, setCreateStep] = useState<number>(1);
  const [createLadder, setCreateLadder] = useState<'micro' | 'day' | 'getaway' | 'crawl'>('day');
  const [createDestination, setCreateDestination] = useState('Nandi Hills');
  const [createPickup, setCreatePickup] = useState('Indiranagar');
  const [createDate, setCreateDate] = useState('This Saturday');
  const [createTimeSlot, setCreateTimeSlot] = useState('🌅 Early Sunrise · 5:30 AM');
  const [createType, setCreateType] = useState<'green' | 'pink' | 'women'>('green');
  const [createGroupSize, setCreateGroupSize] = useState('2-4');
  const [createRide, setCreateRide] = useState('🚗 Driving my car');
  const [createCost, setCreateCost] = useState<number>(800);
  const [createVibes, setCreateVibes] = useState<string[]>(['Chai & Chill', 'Trek & Talk']);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'create') {
      setActiveTab('create');
    } else {
      setActiveTab('explore');
    }
  }, [searchParams]);

  const filteredTrips = TRIPS_DATA.filter((trip) => {
    if (selectedFilter === '💗 Dates' && trip.type !== 'pink') return false;
    if (selectedFilter === '🟢 Buddies' && trip.type !== 'green') return false;
    if (selectedFilter === '👩 Women-Only' && trip.id !== 2) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      trip.destination.toLowerCase().includes(q) ||
      trip.host.name.toLowerCase().includes(q) ||
      trip.vibe.some((v) => v.toLowerCase().includes(q))
    );
  });

  const toggleVibe = (tag: string) => {
    hapticTap();
    setCreateVibes((prev) =>
      prev.includes(tag) ? prev.filter((v) => v !== tag) : [...prev, tag]
    );
  };

  const handlePublish = () => {
    hapticSuccess();
    setIsPublished(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col font-[Inter] relative overflow-x-hidden text-black max-w-md mx-auto">
      {/* Background Dots & Glow */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col pb-36">
        
        {/* ================= VIEW 1: EXPLORE (MAP + FEED) ================= */}
        {activeTab === 'explore' && (
          <div className="h-full flex flex-col">
            
            {/* Search & City Header with Safe Area Inset */}
            <div className="px-5 pt-[max(16px,env(safe-area-inset-top,16px))] pb-3 bg-white/90 backdrop-blur-xl sticky top-0 z-20 border-b border-black/5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-black/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>BANGALORE</span>
                  </div>
                  <div className="font-[800] text-[22px] tracking-tight leading-none mt-1">
                    Where to next?
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                  A
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Nandi, Coorg, Cubbon..."
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f3f0] border border-black/[0.06] text-[14px] placeholder:text-black/40 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                />
              </div>

              {/* Filter Chips Bar */}
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1">
                {['All', 'Today', 'Weekend', '💗 Dates', '🟢 Buddies', '👩 Women-Only'].map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedFilter(filter);
                      }}
                      className={`shrink-0 h-8 px-4 rounded-full text-[13px] font-semibold border transition-all cursor-pointer ${
                        selectedFilter === filter
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Interactive Vector Map Canvas */}
            <div className="relative h-[260px] sm:h-[300px] bg-[#eef4ee] overflow-hidden mx-4 my-3 rounded-[28px] border border-black/[0.06] shadow-inner shrink-0">
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Vector Roads & Topo Polygons */}
              <div className="absolute inset-0 p-6 pointer-events-none">
                <div className="w-full h-full relative">
                  <div className="absolute left-[20%] top-0 bottom-0 w-[6px] bg-white/80 rounded-full" />
                  <div className="absolute top-[38%] left-0 right-0 h-[5px] bg-white/80 rounded-full" />
                  <div className="absolute top-[68%] left-0 right-0 h-[4px] bg-white/60 rounded-full rotate-[-8deg]" />
                  <div className="absolute left-[10%] top-[55%] w-[32%] h-[22%] bg-emerald-200/40 rounded-[18px]" />
                  <div className="absolute right-[18%] top-[12%] w-[26%] h-[18%] bg-emerald-200/30 rounded-[16px]" />
                </div>
              </div>

              {/* Live Map Pins */}
              {TRIPS_DATA.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedTrip(trip);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer active:scale-90 transition-transform z-10"
                  style={{ left: `${trip.pin.x}%`, top: `${trip.pin.y}%` }}
                >
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-full blur-[8px] opacity-40 ${
                        trip.type === 'pink' ? 'bg-rose-400' : 'bg-emerald-400'
                      } animate-ping`}
                    />
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${trip.gradient} shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] border-[2.5px] border-white flex items-center justify-center text-[15px]`}
                    >
                      {trip.type === 'pink' ? '💗' : '🟢'}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 shadow" />
                  </div>
                </button>
              ))}

              {/* Cluster Badge */}
              <div className="absolute left-[58%] top-[30%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                  3 trips
                </div>
              </div>

              {/* Navigation Center Button */}
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  toast('Current Location: Indiranagar, Bangalore', { icon: '📍' });
                }}
                className="absolute right-3 bottom-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-black/10 cursor-pointer active:scale-90 transition z-10"
              >
                <Navigation className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Bottom Swipeable Cards Carousel Header & List */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[16px] font-bold tracking-tight">Available Trips</h3>
                <span className="text-[12px] font-medium text-black/50">{filteredTrips.length} nearby</span>
              </div>

              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
              >
                {filteredTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSelectedTrip(trip);
                    }}
                    className="snap-start shrink-0 w-[290px] text-left bg-white rounded-[22px] border border-black/[0.06] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden group active:scale-[0.98] transition cursor-pointer"
                  >
                    <div className="flex">
                      <div className={`w-1.5 self-stretch bg-gradient-to-b ${trip.gradient}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full bg-gradient-to-br ${trip.gradient} flex items-center justify-center text-white font-bold text-[14px] shadow`}
                            >
                              {trip.host.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-[13px]">
                                  {trip.host.name}
                                </span>
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                              <div className="text-[11px] text-black/50 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {trip.time}
                              </div>
                            </div>
                          </div>

                          {/* Green Score Circular Ring */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-[#f5f3f0] flex items-center justify-center text-[11px] font-bold relative">
                              {trip.score}
                              <svg className="absolute inset-0 w-8 h-8 -rotate-90">
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="13"
                                  stroke="#10b981"
                                  strokeWidth="2.5"
                                  fill="none"
                                  strokeDasharray={`${(trip.score / 5) * 81.6} 81.6`}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="font-[750] text-[16px] leading-tight tracking-tight">
                            {trip.destination}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                              {trip.match}
                            </span>
                            {trip.vibe.map((v) => (
                              <span
                                key={v}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/60 font-medium"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                              {trip.totalSpots - trip.spots} left
                            </span>
                            <span className="text-[12px] font-medium text-black/60">
                              ₹{trip.cost}/person
                            </span>
                          </div>
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-br ${trip.gradient} flex items-center justify-center text-white shadow`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: CREATE TRIP (5-QUESTION INTERACTIVE WIZARD) ================= */}
        {activeTab === 'create' && (
          <div className="h-full px-5 pt-[max(16px,env(safe-area-inset-top,16px))] pb-28 flex flex-col justify-between min-h-[calc(100vh-140px)]">
            <div>
              {/* Header with Progress Steps */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {createStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setCreateStep((s) => Math.max(1, s - 1));
                      }}
                      className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black font-bold transition active:scale-90"
                    >
                      ←
                    </button>
                  )}
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Question {createStep} of 5
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScoreInfo(!showScoreInfo)}
                  className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/10 transition"
                >
                  <Info className="w-4 h-4 text-black/70" />
                </button>
              </div>

              {/* 5-Step Segmented Progress Bar */}
              <div className="grid grid-cols-5 gap-1.5 mb-5 mt-2">
                {[1, 2, 3, 4, 5].map((st) => (
                  <div key={st} className="h-1.5 rounded-full overflow-hidden bg-black/10">
                    <div
                      className={`h-full transition-all duration-300 ${
                        st <= createStep
                          ? 'bg-black w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {showScoreInfo && (
                <div className="mb-4 p-3.5 rounded-2xl bg-black text-white text-[12px] leading-relaxed animate-fade-in shadow-lg">
                  <strong>Green Score</strong> = your trust rating. Higher score = more visibility. Verified on-time hosts get 5x more requests.
                </div>
              )}

              {/* ---------------- QUESTION 1: TRIP FORMAT ---------------- */}
              {createStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[22px] font-[800] tracking-tight leading-tight">
                      What kind of plan is this?
                    </h2>
                    <p className="text-xs text-black/60 mt-1">
                      Pick the experience format. Trust is built in layers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      {
                        id: 'micro',
                        label: 'Micro Date',
                        sub: '60 min coffee & chat',
                        icon: '☕',
                        grad: 'from-amber-300 to-orange-400',
                        badge: 'Public Cafe Only',
                      },
                      {
                        id: 'day',
                        label: 'Day Date / Roadtrip',
                        sub: '1-day sunrise or trek',
                        icon: '⛰️',
                        grad: 'from-emerald-400 to-teal-500',
                        badge: 'Most Popular',
                      },
                      {
                        id: 'getaway',
                        label: 'Weekend Getaway',
                        sub: '2-3 days scenic hills & stay',
                        icon: '🏕️',
                        grad: 'from-violet-400 to-fuchsia-500',
                        badge: 'Lvl 5+ Verified',
                      },
                      {
                        id: 'crawl',
                        label: 'Cafe & Food Crawl',
                        sub: '2-3 hours food hunt',
                        icon: '🥐',
                        grad: 'from-rose-400 to-pink-500',
                        badge: 'Casual & Fun',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setCreateLadder(item.id as any);
                        }}
                        className={`p-4 rounded-[22px] border-2 text-left transition-all relative flex items-start gap-3.5 cursor-pointer active:scale-[0.98] ${
                          createLadder === item.id
                            ? 'border-black bg-white shadow-md'
                            : 'border-black/10 bg-white/70 hover:border-black/30'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-[22px] shadow-sm shrink-0`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[14px] text-black">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-black/60 mt-0.5">
                            {item.sub}
                          </div>
                          <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/70 mt-2">
                            {item.badge}
                          </span>
                        </div>
                        {createLadder === item.id && (
                          <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 2: DESTINATION & PICKUP ---------------- */}
              {createStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[22px] font-[800] tracking-tight leading-tight">
                      Where are you heading?
                    </h2>
                    <p className="text-xs text-black/60 mt-1">
                      Choose a destination and a convenient public pickup point.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      DESTINATION
                    </label>
                    <div className="mt-1.5 relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                      <input
                        type="text"
                        value={createDestination}
                        onChange={(e) => setCreateDestination(e.target.value)}
                        placeholder="e.g. Nandi Hills, Coorg, Cubbon Park..."
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white border border-black/10 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Quick Pick Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                      Popular Spots
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        'Nandi Hills ⛰️',
                        'Coorg Trails ☕',
                        'Cubbon Park 🌳',
                        'Skandagiri Trek 🌌',
                        'Chikmagalur 🏞️',
                        'Avalabetta ⛰️',
                        'Mysore Palace 🏰',
                      ].map((spot) => (
                        <button
                          key={spot}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateDestination(spot.replace(/ [^ ]+$/, ''));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            createDestination === spot.replace(/ [^ ]+$/, '')
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          {spot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Public Pickup Landmark */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      PUBLIC PICKUP SPOT
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        'Indiranagar',
                        'Koramangala',
                        'HSR Layout',
                        'MG Road Metro',
                        'Whitefield',
                        'Hebbal Flyover',
                      ].map((spot) => (
                        <button
                          key={spot}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreatePickup(spot);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            createPickup === spot
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          📍 {spot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 3: DATE & SCHEDULE ---------------- */}
              {createStep === 3 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[22px] font-[800] tracking-tight leading-tight">
                      When are you planning to go?
                    </h2>
                    <p className="text-xs text-black/60 mt-1">
                      Pick the date and ideal time of day for the plan.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      DAY / TIMEFRAME
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {[
                        'Today',
                        'Tomorrow',
                        'This Saturday',
                        'This Sunday',
                        'Next Weekend',
                        'Flexible',
                      ].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateDate(d);
                          }}
                          className={`h-11 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                            createDate === d
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      STARTING TIME SLOT
                    </label>
                    <div className="space-y-2 mt-1.5">
                      {[
                        { id: '🌅 Early Sunrise · 5:30 AM', sub: 'Best for Nandi / Skandagiri sunrise views' },
                        { id: '☀️ Morning Explorer · 8:30 AM', sub: 'Day roadtrips and breakfast stops' },
                        { id: '🌆 Sunset & Golden Hour · 4:30 PM', sub: 'Evening chai, viewpoints & walks' },
                        { id: '🌌 Night Trek / Stargazing · 10:00 PM', sub: 'Skandagiri / night trails' },
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateTimeSlot(slot.id);
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            createTimeSlot === slot.id
                              ? 'bg-white border-black shadow-sm ring-1 ring-black'
                              : 'bg-white/70 border-black/10 hover:border-black/20'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[13px] text-black">{slot.id}</div>
                            <div className="text-[11px] text-black/50">{slot.sub}</div>
                          </div>
                          {createTimeSlot === slot.id && (
                            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 4: GROUP & COMPATIBILITY ---------------- */}
              {createStep === 4 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[22px] font-[800] tracking-tight leading-tight">
                      Who are you looking to travel with?
                    </h2>
                    <p className="text-xs text-black/60 mt-1">
                      Define the vibe, group dynamics, and transport arrangement.
                    </p>
                  </div>

                  {/* Trip Type Selector */}
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      CONNECTION INTENT
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {[
                        { id: 'green', label: '🟢 Buddies', desc: 'Adventure & Friends' },
                        { id: 'pink', label: '💗 Travel Date', desc: '1-on-1 Chemistry' },
                        { id: 'women', label: '👩 Women-Only', desc: 'Curated Circle' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateType(t.id as any);
                          }}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                            createType === t.id
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          <div className="font-bold text-[12px]">{t.label}</div>
                          <div className={`text-[10px] ${createType === t.id ? 'text-white/70' : 'text-black/50'}`}>
                            {t.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Size */}
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      GROUP SIZE
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {[
                        { id: '1-on-1', label: '1-on-1 (Just 2)' },
                        { id: '2-4', label: 'Small Squad (2-4)' },
                        { id: '5+', label: 'Group (5+)' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateGroupSize(sz.id);
                          }}
                          className={`h-11 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                            createGroupSize === sz.id
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle / Ride */}
                  <div className="pt-1">
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      RIDE / TRANSPORT
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {[
                        '🚗 Driving my car',
                        '🏍️ Riding bike (1 pillion)',
                        '🚕 Cabs / Split ride',
                        '🚙 Looking for a ride',
                      ].map((ride) => (
                        <button
                          key={ride}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateRide(ride);
                          }}
                          className={`p-3 rounded-2xl border text-xs font-semibold text-left transition cursor-pointer flex items-center justify-between ${
                            createRide === ride
                              ? 'bg-white border-black shadow-sm ring-1 ring-black'
                              : 'bg-white/70 border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          <span>{ride}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 5: VIBES & SPLIT COST + PREVIEW ---------------- */}
              {createStep === 5 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[22px] font-[800] tracking-tight leading-tight">
                      What's the vibe & estimated split cost?
                    </h2>
                    <p className="text-xs text-black/60 mt-1">
                      Set expectations on atmosphere and fair shared expenses.
                    </p>
                  </div>

                  {/* Vibe Tags */}
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-black/40">
                      SELECT VIBE TAGS
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        'Chai & Chill',
                        'Trek & Talk',
                        'Slow Travel',
                        'Photo Walks',
                        'City Walks',
                        'Deep Talks',
                        'Sunset Views',
                        'Food Crawl',
                        'Roadtrip Playlists',
                        'Night Trek',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleVibe(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            createVibes.includes(tag)
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Cost Split */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold tracking-widest text-black/40">
                        ESTIMATED COST SPLIT / PERSON
                      </label>
                      <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ₹{createCost}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {[
                        { v: 0, l: 'Free' },
                        { v: 400, l: '₹400' },
                        { v: 800, l: '₹800' },
                        { v: 1500, l: '₹1.5k' },
                        { v: 2800, l: '₹2.8k' },
                      ].map((c) => (
                        <button
                          key={c.v}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateCost(c.v);
                          }}
                          className={`py-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                            createCost === c.v
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white border-black/10 text-black/70 hover:border-black/20'
                          }`}
                        >
                          {c.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Live Summary Card */}
                  <div className="rounded-[24px] border border-black/10 bg-gradient-to-br from-white via-amber-50/30 to-emerald-50/30 p-4 shadow-sm mt-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="font-bold text-[13px] text-black">Aarav · 4.9</div>
                          <div className="text-[10px] text-black/50">Pickup: {createPickup}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                        {createType === 'pink' ? '💗 DATE TRIP' : createType === 'women' ? '👩 WOMEN-ONLY' : '🟢 BUDDY TRIP'}
                      </span>
                    </div>

                    <div className="mt-3 font-[800] text-[16px] text-black">
                      {createDestination} {createLadder === 'micro' ? '☕' : createLadder === 'day' ? '⛰️' : createLadder === 'getaway' ? '🏕️' : '🥐'}
                    </div>

                    <div className="text-xs text-black/60 mt-1 flex items-center gap-2">
                      <span>📅 {createDate}</span>
                      <span>•</span>
                      <span>{createTimeSlot.split('·')[1]?.trim() || createTimeSlot}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {createVibes.map((v) => (
                        <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/70">
                          {v}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-black/5 flex justify-between items-center text-xs font-bold text-black">
                      <span className="text-black/60">{createRide}</span>
                      <span className="text-emerald-700">₹{createCost}/person</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Step Navigation Buttons */}
            <div className="pt-5 flex gap-3">
              {createStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setCreateStep((s) => Math.max(1, s - 1));
                  }}
                  className="h-[52px] px-5 rounded-full border border-black/15 font-bold text-[14px] active:scale-95 transition cursor-pointer"
                >
                  Back
                </button>
              )}

              {createStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setCreateStep((s) => Math.min(5, s + 1));
                  }}
                  className="flex-1 h-[52px] rounded-full bg-black text-white font-bold text-[15px] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Next: Question {createStep + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex-1 h-[52px] rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white font-bold text-[15px] shadow-[0_14px_28px_-10px_rgba(249,115,22,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Publish Trip 🎉
                </button>
              )}
            </div>

            {/* Confetti / Published Success Overlay */}
            {isPublished && (
              <div className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl mb-5">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-[26px] font-[800] tracking-tight">Trip Live! 🎉</h3>
                <p className="text-[14px] text-black/60 mt-2 leading-relaxed max-w-[280px]">
                  Your {createDestination} trip is now live and visible to 240 nearby explorers in Bangalore.
                </p>

                {/* Boost Card */}
                <div className="mt-6 w-full max-w-[320px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-[22px] p-4 text-left text-white shadow-xl">
                  <div className="flex items-center gap-2 font-bold text-[13px]">
                    <Zap className="w-4 h-4" />
                    <span>Boost for ₹49</span>
                  </div>
                  <div className="text-[12px] opacity-90 mt-1 leading-relaxed">
                    Reach 5x more people in Bangalore. 87% of boosted trips get 3+ join requests in 1 hour.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Boost activated!');
                      setIsPublished(false);
                      setActiveTab('explore');
                      setCreateStep(1);
                    }}
                    className="mt-3 w-full h-10 rounded-full bg-white text-black font-bold text-[13px] shadow active:scale-95 transition cursor-pointer"
                  >
                    Boost Now
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublished(false);
                    setActiveTab('explore');
                    setCreateStep(1);
                  }}
                  className="mt-4 w-full max-w-[320px] h-12 rounded-full border border-black/10 font-semibold text-[14px] active:scale-95 transition cursor-pointer"
                >
                  Continue Exploring
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= SLIDE-UP TRIP DETAILS SHEET ================= */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)] pb-[env(safe-area-inset-bottom,12px)]">
            
            {/* Sheet Header Hero Gradient */}
            <div
              className={`h-[180px] relative bg-gradient-to-br ${selectedTrip.gradient} p-5 flex flex-col justify-end shrink-0`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <button
                  type="button"
                  onClick={() => setSelectedTrip(null)}
                  className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 active:scale-90 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="h-9 px-3.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow">
                  <Users className="w-4 h-4" />
                  <span>{selectedTrip.totalSpots - selectedTrip.spots} spots left</span>
                </div>
              </div>

              <div className="relative z-10 text-white">
                <div className="inline-flex px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-[11px] font-bold tracking-wide mb-1">
                  {selectedTrip.type === 'pink' ? '💗 DATE TRIP' : '🟢 BUDDY TRIP'}
                </div>
                <h2 className="text-[24px] font-[800] leading-tight tracking-tight">
                  {selectedTrip.destination}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-[13px] opacity-90">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTrip.time} · ₹{selectedTrip.cost}/person</span>
                </div>
              </div>
            </div>

            {/* Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-5">
              
              {/* 3-Stop Itinerary */}
              <div>
                <div className="text-[11px] font-bold tracking-widest text-black/40">
                  3-STOP ITINERARY
                </div>
                <div className="mt-3 relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                  {[
                    { time: '5:30 AM', place: 'Indiranagar Pickup', note: 'Public cafe meet' },
                    { time: '7:00 AM', place: 'Nandi Hills Sunrise', note: 'Chai & viewpoint' },
                    { time: '11:00 AM', place: 'Breakfast at foothills', note: 'Wrap & drop back' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                      <div className="absolute -left-[19px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex-1 bg-[#faf8f5] rounded-2xl p-3 border border-black/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                            {step.time}
                          </span>
                          <span className="text-[11px] text-black/50">{step.note}</span>
                        </div>
                        <div className="font-semibold text-[13px] mt-1">
                          {step.place}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Profile Card */}
              <div className="rounded-[22px] border border-black/10 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${selectedTrip.gradient}`} />
                  <div className="absolute inset-[2px] rounded-full bg-white flex items-center justify-center font-bold text-[18px]">
                    {selectedTrip.host.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] truncate">{selectedTrip.host.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 font-semibold">
                      Lvl {selectedTrip.host.level}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['ID Verified', 'On-Time 8x', 'Friendly'].map((badge) => (
                      <span
                        key={badge}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#f5f3f0] flex items-center justify-center relative shrink-0">
                  <span className="font-bold text-[13px]">{selectedTrip.score}</span>
                  <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#10b981"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${(selectedTrip.score / 5) * 113} 113`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Cost Split Breakdown */}
              <div className="rounded-[22px] bg-[#faf8f5] border border-black/5 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold tracking-widest text-black/40">
                    COST SPLIT CALCULATOR
                  </span>
                  <span className="text-[12px] font-bold">₹{selectedTrip.cost}/person</span>
                </div>
                <div className="space-y-2 text-[13px]">
                  {[
                    { k: 'Fuel (120km)', v: 320 },
                    { k: 'Entry & Parking', v: 180 },
                    { k: 'Chai & Breakfast', v: 300 },
                  ].map((row) => (
                    <div key={row.k} className="flex justify-between">
                      <span className="text-black/60">{row.k}</span>
                      <span className="font-semibold">₹{row.v}</span>
                    </div>
                  ))}
                  <div className="h-[1px] bg-black/10 my-2" />
                  <div className="flex justify-between font-bold text-[14px]">
                    <span>Total split</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[12px]">
                      ₹{selectedTrip.cost} each
                    </span>
                  </div>
                </div>
              </div>

              {/* Q&A Wall */}
              <div>
                <div className="text-[11px] font-bold tracking-widest text-black/40 flex items-center gap-1.5 mb-3">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Q&A WALL</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { q: 'Car or bike? Comfortable with pillion?', a: 'Bringing my car - 3 spots! 🟢' },
                    { q: 'Is it beginner friendly?', a: 'Totally! Slow pace, chai breaks ☕' },
                  ].map((qa, idx) => (
                    <div key={idx} className="rounded-2xl bg-white border border-black/10 p-3 shadow-xs">
                      <div className="text-[12px] font-medium text-black/70">
                        <strong>Q:</strong> {qa.q}
                      </div>
                      <div className="text-[12px] font-semibold mt-1">
                        <strong>A:</strong> {qa.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe by Design Notice */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] leading-relaxed text-black/70">
                  <strong className="text-emerald-950">Safe by Design:</strong> Public pickup, verified only, live location share enabled. No private addresses shared.
                </div>
              </div>
            </div>

            {/* Bottom Action Sheet Buttons */}
            <div className="p-4 bg-white/95 backdrop-blur-xl border-t border-black/5 shrink-0">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    hapticSuccess();
                    toast.success('Joined as Buddy! 🟢');
                    setSelectedTrip(null);
                  }}
                  className="flex-1 h-[50px] rounded-full bg-white border border-black/15 font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer shadow-xs"
                >
                  <span className="text-[15px]">🟢</span> Buddy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticSuccess();
                    toast.success('Requested as Date! 💗');
                    setSelectedTrip(null);
                  }}
                  className="flex-[1.6] h-[50px] rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white font-bold text-[14px] shadow-[0_12px_24px_-8px_rgba(236,72,153,0.5)] flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  💗 Request as Date
                </button>
              </div>
              <div className="text-center text-[10px] text-black/40 mt-2 font-medium">
                Host approves · No charge until confirmed
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5]" />}>
      <TripsContent />
    </Suspense>
  );
}
