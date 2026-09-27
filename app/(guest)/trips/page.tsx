'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Navigation,
  Check,
  ChevronRight,
  Clock,
  Car,
  Fuel,
  Home,
  Utensils,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Shield,
  MessageCircle,
  Users,
  X,
  Zap
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface TripItem {
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

const TRIPS_DATA: TripItem[] = [
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

const FILTER_CHIPS = ['All', 'Today', 'Weekend', '💗 Dates', '🟢 Buddies', '👩 Women-Only'];

export default function TripsExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'explore' | 'create'>('explore');
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Form State
  const [createLadder, setCreateLadder] = useState<'micro' | 'day' | 'getaway'>('day');
  const [createDestination, setCreateDestination] = useState('Nandi Hills');
  const [createGroupSize, setCreateGroupSize] = useState('2-4');
  const [createVibes, setCreateVibes] = useState<string[]>(['Chai & Chill', 'Trek & Talk']);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'create') {
      setActiveTab('create');
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
    <div className="min-h-screen w-full bg-[#faf8f5] flex items-center justify-center p-2 md:p-8 font-[Inter] relative overflow-hidden text-black">
      
      {/* Background Dots */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Main Mobile Frame */}
      <div className="relative w-full max-w-[390px] h-[820px] bg-black rounded-[56px] p-[10px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_30px_60px_-30px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
        
        {/* Dynamic Island Pill */}
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[100px] h-[6px] bg-[#1a1a1a] rounded-full z-20" />
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-[#1a1a1a] rounded-full translate-x-[-70px] z-20" />

        <div className="relative w-full h-full bg-[#fffefc] rounded-[44px] overflow-hidden flex flex-col">
          
          {/* Status Bar */}
          <div className="h-[44px] flex items-center justify-between px-8 text-[15px] font-semibold tracking-tight z-10 shrink-0 bg-white/80 backdrop-blur-xl">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-6 h-3 border border-black/30 rounded-[3px] p-[1px]">
                <div className="w-4 h-full bg-black rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Main App Canvas */}
          <div className="flex-1 relative overflow-hidden bg-[#fffefc]">
            
            {/* ================= VIEW 1: EXPLORE (MAP + FEED) ================= */}
            {activeTab === 'explore' && (
              <div className="h-full flex flex-col">
                
                {/* Search & City Header */}
                <div className="px-5 pt-2 pb-3 bg-white/90 backdrop-blur-xl sticky top-0 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-black/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>BANGALORE</span>
                      </div>
                      <div className="font-[800] text-[22px] tracking-tight leading-none mt-1">
                        Where to next?
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-[14px] shadow-lg">
                      A
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                    <input
                      placeholder="Search Nandi, Coorg, Cubbon..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f3f0] border border-black/[0.06] text-[14px] placeholder:text-black/40 font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1">
                    {FILTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setSelectedFilter(chip);
                        }}
                        className={`shrink-0 h-8 px-4 rounded-full text-[13px] font-semibold border transition-all cursor-pointer ${
                          selectedFilter === chip
                            ? 'bg-black text-white border-black shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)]'
                            : 'bg-white border-black/10 text-black/70 hover:bg-stone-50'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map View Canvas */}
                <div className="relative flex-1 bg-[#eef4ee] overflow-hidden mx-3 rounded-[24px] border border-black/[0.06] shadow-inner">
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Map Graphic Vector Elements */}
                  <div className="absolute inset-0 p-6 pointer-events-none">
                    <div className="w-full h-full relative">
                      <div className="absolute left-[20%] top-0 bottom-0 w-[6px] bg-white/80 rounded-full" />
                      <div className="absolute top-[38%] left-0 right-0 h-[5px] bg-white/80 rounded-full" />
                      <div className="absolute top-[68%] left-0 right-0 h-[4px] bg-white/60 rounded-full rotate-[-8deg]" />
                      <div className="absolute left-[10%] top-[55%] w-[32%] h-[22%] bg-emerald-200/40 rounded-[18px]" />
                      <div className="absolute right-[18%] top-[12%] w-[26%] h-[18%] bg-emerald-200/30 rounded-[16px]" />
                    </div>
                  </div>

                  {/* Trip Pins on Map */}
                  {TRIPS_DATA.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedTrip(t);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer active:scale-90 transition-transform"
                      style={{ left: `${t.pin.x}%`, top: `${t.pin.y}%` }}
                    >
                      <div className="relative">
                        <div
                          className={`absolute inset-0 rounded-full blur-[8px] opacity-40 ${
                            t.type === 'pink' ? 'bg-rose-400' : 'bg-emerald-400'
                          } animate-ping`}
                        />
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] border-[2.5px] border-white flex items-center justify-center text-[14px]`}
                        >
                          {t.type === 'pink' ? '💗' : '🟢'}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 shadow" />
                      </div>
                    </button>
                  ))}

                  {/* Cluster Badge */}
                  <div className="absolute left-[58%] top-[30%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      3 trips
                    </div>
                  </div>

                  {/* Recenter Button */}
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      toast.success('Centered on your location in Bangalore');
                    }}
                    className="absolute right-3 bottom-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border border-black/10 cursor-pointer active:scale-90 transition-transform"
                  >
                    <Navigation className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>

                {/* Bottom Horizontal Cards Carousel */}
                <div className="pt-3 pb-24 bg-white rounded-t-[24px] -mt-6 relative z-10 shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.15)] border-t border-black/5">
                  <div className="w-10 h-1 rounded-full bg-black/15 mx-auto mb-3" />

                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory"
                  >
                    {filteredTrips.map((trip) => (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setSelectedTrip(trip);
                        }}
                        className="snap-start shrink-0 w-[300px] text-left bg-white rounded-[20px] border border-black/[0.06] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] overflow-hidden group active:scale-[0.98] transition cursor-pointer"
                      >
                        <div className="flex">
                          <div className={`w-1.5 self-stretch bg-gradient-to-b ${trip.gradient}`} />

                          <div className="flex-1 p-4">
                            {/* Host Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${trip.gradient} flex items-center justify-center text-white font-bold text-[14px] shadow`}
                                >
                                  {trip.host.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-[13px]">{trip.host.name}</span>
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-black/50 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-emerald-600" />
                                    <span>{trip.time}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Green Score Circular Ring */}
                              <div className="flex items-center gap-1.5">
                                <div className="w-8 h-8 rounded-full bg-[#f5f3f0] flex items-center justify-center text-[11px] font-bold relative">
                                  <span>{trip.score}</span>
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

                            {/* Title & Match Tag */}
                            <div className="mt-3">
                              <div className="font-[750] text-[17px] leading-tight tracking-tight">
                                {trip.destination}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                                  {trip.match}
                                </span>
                                {trip.vibe.map((v) => (
                                  <span
                                    key={v}
                                    className="text-[10px] px-2 py-1 rounded-full bg-black/5 text-black/60 font-medium"
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Spots & Price */}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-black text-white">
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

            {/* ================= VIEW 2: CREATE TRIP ================= */}
            {activeTab === 'create' && (
              <div className="h-full overflow-y-auto scrollbar-none">
                <div className="px-5 pt-3 pb-24">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[26px] font-[800] tracking-tight leading-none">
                      Create Trip
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowScoreInfo(!showScoreInfo)}
                      className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-black/60" />
                    </button>
                  </div>

                  {showScoreInfo && (
                    <div className="mt-3 p-3 rounded-2xl bg-black text-white text-[12px] leading-relaxed animate-fade-in">
                      Green Score = your trust rating. Higher score = more visibility. Earned via on-time, verified trips, and good vibes.
                    </div>
                  )}

                  {/* Ladder Milestone Cards */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'micro', label: 'Micro Date', sub: '60m', icon: '☕', grad: 'from-amber-300 to-orange-400', note: 'Public only' },
                      { id: 'day', label: 'Day Date', sub: '1 day', icon: '⛰️', grad: 'from-emerald-400 to-teal-500', note: 'Most popular' },
                      { id: 'getaway', label: 'Getaway', sub: '2-3 days', icon: '🏕️', grad: 'from-violet-400 to-fuchsia-500', note: 'Lvl 5+' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setCreateLadder(lvl.id as unknown as typeof createLadder);
                        }}
                        className={`relative text-left rounded-[18px] p-3 border-2 transition-all cursor-pointer ${
                          createLadder === lvl.id
                            ? 'border-black shadow-[0_10px_20px_-8px_rgba(0,0,0,0.2)] scale-[1.02]'
                            : 'border-black/10 bg-white'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lvl.grad} flex items-center justify-center text-[18px] shadow`}
                        >
                          {lvl.icon}
                        </div>
                        <div className="mt-2 font-bold text-[12px] leading-tight">{lvl.label}</div>
                        <div className="text-[10px] text-black/50 font-medium">
                          {lvl.sub} · {lvl.note}
                        </div>
                        {createLadder === lvl.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Form Inputs */}
                  <div className="mt-6 space-y-4">
                    {/* Where To */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest text-black/40">
                        WHERE TO?
                      </label>
                      <div className="mt-1.5 relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                        <input
                          value={createDestination}
                          onChange={(e) => setCreateDestination(e.target.value)}
                          className="w-full h-12 pl-10 pr-4 rounded-2xl bg-[#f5f3f0] border border-black/10 font-semibold text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                      </div>
                    </div>

                    {/* When & Group Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold tracking-widest text-black/40">
                          WHEN
                        </label>
                        <div className="mt-1.5 h-12 rounded-2xl bg-[#f5f3f0] border border-black/10 flex items-center px-3.5 gap-2 text-[13px] font-semibold">
                          <Calendar className="w-4 h-4 text-black/40" />
                          <span>Sat, 7AM</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold tracking-widest text-black/40">
                          GROUP SIZE
                        </label>
                        <div className="mt-1.5 flex gap-1.5">
                          {['1', '2-4', '5+'].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                hapticTap();
                                setCreateGroupSize(sz);
                              }}
                              className={`flex-1 h-12 rounded-2xl border font-bold text-[13px] transition-all cursor-pointer ${
                                createGroupSize === sz
                                  ? 'bg-black text-white border-black'
                                  : 'bg-[#f5f3f0] border-black/10 text-black/60'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cost Split Slider Box */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest text-black/40">
                        COST SPLIT · ₹/PERSON
                      </label>
                      <div className="mt-2 p-3.5 rounded-2xl bg-white border border-black/10">
                        <div className="flex justify-between text-[12px] font-medium mb-2">
                          <span className="text-black/50">Budget</span>
                          <span className="font-bold">₹800</span>
                        </div>

                        <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                          <div className="h-full w-[62%] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                        </div>

                        <div className="flex gap-2 mt-3 text-[11px]">
                          {[
                            { k: 'Fuel', v: '₹320', icon: <Fuel className="w-3 h-3" /> },
                            { k: 'Stay', v: '₹0', icon: <Home className="w-3 h-3" /> },
                            { k: 'Food', v: '₹480', icon: <Utensils className="w-3 h-3" /> },
                          ].map((item) => (
                            <div
                              key={item.k}
                              className="flex-1 bg-[#f5f3f0] rounded-xl p-2 flex items-center gap-1.5"
                            >
                              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                {item.icon}
                              </div>
                              <div>
                                <div className="font-bold leading-none">{item.v}</div>
                                <div className="text-[10px] text-black/50">{item.k}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Vibe Tags */}
                    <div>
                      <label className="text-[11px] font-bold tracking-widest text-black/40">
                        VIBE TAGS
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          'Chai & Chill',
                          'Trek & Talk',
                          'Slow Travel',
                          'Photo Walks',
                          'City Walks',
                          'Deep Talks',
                          'Night Trek',
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleVibe(tag)}
                            className={`px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                              createVibes.includes(tag)
                                ? 'bg-black text-white border-black'
                                : 'bg-white border-black/10 text-black/60'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview Card */}
                    <div className="rounded-[20px] border border-black/10 bg-gradient-to-br from-white to-[#fdf8f3] p-4 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                            A
                          </div>
                          <div>
                            <div className="font-bold text-[13px]">You · 4.9</div>
                            <div className="text-[11px] text-black/50">Verified · Hosting</div>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                          PREVIEW
                        </div>
                      </div>

                      <div className="mt-3 font-[800] text-[18px] tracking-tight">
                        {createDestination || 'Your destination'}{' '}
                        {createLadder === 'micro' ? '☕' : createLadder === 'day' ? '⛰️' : '🏕️'}
                      </div>

                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {createVibes.map((v) => (
                          <span key={v} className="text-[10px] px-2 py-1 rounded-full bg-black/5">
                            {v}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[12px]">
                        <span className="text-black/50">Group {createGroupSize}</span>
                        <span className="font-bold">₹800/person</span>
                      </div>
                    </div>

                    {/* Publish CTA Button */}
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="w-full h-[54px] rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white font-bold text-[15px] shadow-[0_14px_28px_-10px_rgba(249,115,22,0.6)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Trip</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= CELEBRATION MODAL ON PUBLISH ================= */}
            {isPublished && (
              <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                {/* Falling Confetti Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(18)].map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute w-2 h-6 rounded-full animate-[fall_2s_ease-in-out_infinite]"
                      style={{
                        left: `${(idx * 7) % 100}%`,
                        top: '-10%',
                        background: `hsl(${35 + idx * 14} 90% 60%)`,
                        animationDelay: `${idx * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl mb-5">
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </div>

                <h3 className="text-[26px] font-[800] tracking-tight">Trip Live! 🎉</h3>
                <p className="text-[14px] text-black/60 mt-2 leading-relaxed">
                  Your {createDestination} trip is now visible to 240 nearby explorers.
                </p>

                {/* Boost Card */}
                <div className="mt-6 w-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-[20px] p-4 text-left text-white shadow-[0_16px_30px_-10px_rgba(168,85,247,0.6)]">
                  <div className="flex items-center gap-2 font-bold text-[13px]">
                    <Zap className="w-4 h-4" />
                    <span>Boost for ₹49</span>
                  </div>
                  <div className="text-[12px] opacity-90 mt-1 leading-relaxed">
                    Reach 5x more people in Bangalore. 87% boost gets 3+ requests in 1 hour.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Trip boosted for ₹49! Pinned at top of Map.');
                    }}
                    className="mt-3 w-full h-10 rounded-full bg-white text-black font-bold text-[13px] cursor-pointer active:scale-95"
                  >
                    Boost Now
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setIsPublished(false);
                    setActiveTab('explore');
                  }}
                  className="mt-4 w-full h-12 rounded-full border border-black/10 font-semibold cursor-pointer"
                >
                  Continue Exploring
                </button>
              </div>
            )}

            {/* ================= SLIDE-UP TRIP DETAILS SHEET ================= */}
            {selectedTrip && (
              <div className="absolute inset-0 z-20 bg-white flex flex-col animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)]">
                
                {/* Hero Header */}
                <div className={`h-[44%] relative bg-gradient-to-br ${selectedTrip.gradient} p-5 flex flex-col justify-end`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Top Bar inside Sheet */}
                  <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
                    <button
                      type="button"
                      onClick={() => setSelectedTrip(null)}
                      className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2">
                      <div className="h-9 px-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[12px] font-semibold flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{selectedTrip.totalSpots - selectedTrip.spots} spots left</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="relative z-10 text-white">
                    <div className="inline-flex px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-[11px] font-bold tracking-wide">
                      {selectedTrip.type === 'pink' ? '💗 DATE TRIP' : '🟢 BUDDY TRIP'}
                    </div>
                    <h2 className="text-[28px] font-[800] leading-[0.95] tracking-tight mt-2">
                      {selectedTrip.destination}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-[13px] opacity-90">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTrip.time} · ₹{selectedTrip.cost}/person</span>
                    </div>
                  </div>

                  {/* Mini Route Preview Box */}
                  <div className="absolute right-4 bottom-[72px] w-[88px] h-[88px] rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-2 z-10">
                    <div className="w-full h-full relative bg-[#eef4ee] rounded-xl overflow-hidden">
                      <div className="absolute left-1/2 top-2 bottom-2 w-[2px] bg-black/10" />
                      {[{ t: 12 }, { t: 42 }, { t: 72 }].map((dot, i) => (
                        <div
                          key={i}
                          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black border-2 border-white shadow"
                          style={{ top: `${dot.t}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sheet Body Content */}
                <div className="flex-1 overflow-y-auto scrollbar-none">
                  <div className="p-5 pb-28">
                    
                    {/* 3-Stop Itinerary */}
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-black/40">
                        3-STOP ITINERARY
                      </div>
                      <div className="mt-3 relative pl-7">
                        <div className="absolute left-[9px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />

                        {[
                          { time: '5:30 AM', place: 'Indiranagar Pickup', note: 'Public cafe meet' },
                          { time: '7:00 AM', place: 'Nandi Hills Sunrise', note: 'Chai & viewpoint' },
                          { time: '11:00 AM', place: 'Breakfast at foothills', note: 'Wrap & drop back' },
                        ].map((stop, idx) => (
                          <div key={idx} className="relative flex gap-3 pb-5 last:pb-0">
                            <div className="absolute left-[-22px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <div className="flex-1 bg-[#faf8f5] rounded-2xl p-3 border border-black/5">
                              <div className="flex justify-between">
                                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-black text-white">
                                  {stop.time}
                                </span>
                                <span className="text-[11px] text-black/50">{stop.note}</span>
                              </div>
                              <div className="font-semibold text-[13px] mt-1.5">{stop.place}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Host Card */}
                    <div className="mt-6 rounded-[20px] border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex gap-3">
                        <div className="relative w-14 h-14">
                          <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${selectedTrip.gradient}`}
                          />
                          <div className="absolute inset-[2px] rounded-full bg-white flex items-center justify-center font-bold">
                            {selectedTrip.host.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px]">{selectedTrip.host.name}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 font-medium">
                              Lvl {selectedTrip.host.level}
                            </span>
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {['ID Verified', 'On-Time 8x', 'Friendly'].map((badge) => (
                              <span
                                key={badge}
                                className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Green Score Circle */}
                        <div className="w-12 h-12 rounded-full bg-[#f5f3f0] flex items-center justify-center relative">
                          <span className="font-bold text-[13px]">{selectedTrip.score}</span>
                          <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                            <circle cx="24" cy="24" r="18" stroke="#e5e7eb" strokeWidth="3" fill="none" />
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
                    </div>

                    {/* Cost Split Calculator Box */}
                    <div className="mt-4 rounded-[20px] bg-[#faf8f5] border border-black/5 p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-[11px] font-bold tracking-widest text-black/40">
                          COST SPLIT CALCULATOR
                        </div>
                        <span className="text-[12px] font-bold">₹{selectedTrip.cost}/person</span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {[
                          { k: 'Fuel (120km)', v: 320 },
                          { k: 'Entry & Parking', v: 180 },
                          { k: 'Chai & Breakfast', v: 300 },
                        ].map((row) => (
                          <div key={row.k} className="flex justify-between text-[13px]">
                            <span className="text-black/60">{row.k}</span>
                            <span className="font-semibold">₹{row.v}</span>
                          </div>
                        ))}

                        <div className="h-[1px] bg-black/10 my-2" />

                        <div className="flex justify-between font-bold text-[14px]">
                          <span>Total split</span>
                          <span className="px-2.5 py-1 rounded-full bg-black text-white text-[12px]">
                            ₹{selectedTrip.cost} each
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Q&A Wall */}
                    <div className="mt-5">
                      <div className="text-[11px] font-bold tracking-widest text-black/40 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Q&A WALL</span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {[
                          { q: 'Car or bike? Comfortable with pillion?', a: 'Bringing my car - 3 spots! 🟢' },
                          { q: 'Is it beginner friendly?', a: 'Totally! Slow pace, chai breaks ☕' },
                        ].map((qa, i) => (
                          <div key={i} className="rounded-2xl bg-white border border-black/10 p-3">
                            <div className="text-[12px] font-medium text-black/70">Q: {qa.q}</div>
                            <div className="text-[12px] font-semibold mt-1">A: {qa.a}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Box */}
                    <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-3 flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <Shield className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold">Safe by Design:</span> Public pickup, verified only, live location share enabled. No private addresses shared.
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom CTA Bar inside Sheet */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-black/5">
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        setSelectedTrip(null);
                        toast.success('Joined as Travel Buddy! Group board unlocked.');
                      }}
                      className="flex-1 h-[52px] rounded-full bg-white border border-black/10 font-bold text-[14px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span className="text-[16px]">🟢</span>
                      <span>Buddy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        setSelectedTrip(null);
                        toast.success('Requested as Date! Host has 2h to review.');
                      }}
                      className="flex-[1.6] h-[52px] rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white font-bold text-[14px] shadow-[0_12px_24px_-8px_rgba(236,72,153,0.6)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>💗 Request as Date</span>
                    </button>
                  </div>

                  <div className="text-center text-[10px] text-black/40 mt-2 font-medium">
                    Host approves · No charge until confirmed
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Home Indicator Bar */}
          <div className="h-6 flex items-center justify-center shrink-0 bg-white">
            <div className="w-32 h-1 rounded-full bg-black" />
          </div>

        </div>
      </div>
    </div>
  );
}
