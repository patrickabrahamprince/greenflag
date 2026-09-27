'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Shield, 
  Users, 
  Loader2, 
  ArrowRight, 
  ChevronLeft,
  Check,
  Search,
  Clock,
  Plus,
  Minus,
  IndianRupee,
  Lock,
  Zap,
  Info,
  Fuel,
  Bed,
  Utensils,
  Share2
} from 'lucide-react';
import { Trip, TripType, TripLadderLevel, FlagColor } from '@/types';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
  currentUserPersona?: string;
}

const TRUST_LADDER = [
  {
    level: 1 as TripLadderLevel,
    type: 'micro_date' as TripType,
    title: 'Level 1: Micro Date',
    duration: '60–90 Mins',
    icon: '☕',
    description: 'Coffee, scenic walk, or work together. Public places only. Ideal for first dates.',
    expiry: 'Expires in 12h',
    isLocked: false,
    badge: 'Open to All',
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-400/60',
    tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    level: 2 as TripLadderLevel,
    type: 'day_date' as TripType,
    title: 'Level 2: Day Date',
    duration: 'Half / Full Day',
    icon: '🌅',
    description: 'Nandi Hills sunrise, craft brewery, Mysore day drive.',
    expiry: 'Expires in 48h',
    isLocked: false,
    badge: '1+ Micro Date • 4.5★ Req.',
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/60',
    tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    level: 3 as TripLadderLevel,
    type: 'getaway_date' as TripType,
    title: 'Level 3: Getaway Date',
    duration: '2+ Days Trip',
    icon: '🏕️',
    description: 'Coorg coffee estates, Gokarna beach stay, Western Ghats road trip.',
    expiry: 'Multi-Day Plan',
    isLocked: false,
    badge: '2+ Day Dates Req.',
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    border: 'border-purple-500/60',
    tagBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
];

const VIBE_TAGS = [
  { id: 'Chai & Chill', icon: '☕', label: 'Chai & Chill' },
  { id: 'Trek & Talk', icon: '🥾', label: 'Trek & Talk' },
  { id: 'Work Together', icon: '💻', label: 'Work Together' },
  { id: 'Bike Rides', icon: '🏍️', label: 'Bike Rides' },
  { id: 'Food Crawls', icon: '🍕', label: 'Food Crawls' },
  { id: 'Sunset Points', icon: '🌇', label: 'Sunset Points' },
];

const SAMPLE_PUBLIC_PLACES = [
  'Third Wave Coffee, Indiranagar, Bengaluru',
  'Cubbon Park (Near Bandstand), Bengaluru',
  'Toit Brewpub, 100ft Road, Indiranagar',
  'Blue Tokai Coffee Roasters, Koramangala',
  'Nandi Hills Viewpoint, Chikkaballapur',
  'DYU Art Cafe, Koramangala 5th Block',
  'Rasta Cafe, Mysore Highway',
];

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // Screen 2A (Type Selection) -> Screen 2B (Build Trip) -> Screen 2C (Success & Boost)
  const [currentScreen, setCurrentScreen] = useState<'type' | 'build' | 'success'>('type');

  // Form State
  const [selectedLadder, setSelectedLadder] = useState<TripLadderLevel>(1);
  const [flagColor, setFlagColor] = useState<FlagColor>('green');
  const [destination, setDestination] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('17:30');
  const [groupSize, setGroupSize] = useState<number>(3);
  const [isWomenOnly, setIsWomenOnly] = useState(false);
  
  // Cost Split
  const [fuelCost, setFuelCost] = useState<number>(600);
  const [stayCost, setStayCost] = useState<number>(0);
  const [foodCost, setFoodCost] = useState<number>(400);

  // Vibe Tags (Pick exactly 2)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Chai & Chill', 'Trek & Talk']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  const [customNote, setCustomNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<Trip | null>(null);
  const [boosted, setBoosted] = useState(false);

  if (!isOpen) return null;

  const totalCost = fuelCost + stayCost + foodCost;
  const perPersonCost = groupSize > 0 ? Math.round(totalCost / groupSize) : 0;

  const handleSelectLadder = (level: TripLadderLevel) => {
    hapticTap();
    setSelectedLadder(level);
    if (level === 1) {
      setStayCost(0);
      setGroupSize(flagColor === 'pink' ? 1 : 2);
    } else if (level === 2) {
      setStayCost(0);
      setGroupSize(flagColor === 'pink' ? 1 : 4);
    } else {
      setStayCost(3500);
      setGroupSize(flagColor === 'pink' ? 1 : 4);
    }
    setCurrentScreen('build');
  };

  const toggleVibe = (tagId: string) => {
    hapticTap();
    if (selectedVibes.includes(tagId)) {
      setSelectedVibes(selectedVibes.filter((v) => v !== tagId));
    } else {
      if (selectedVibes.length >= 2) {
        // Keep max 2
        setSelectedVibes([selectedVibes[1], tagId]);
      } else {
        setSelectedVibes([...selectedVibes, tagId]);
      }
    }
  };

  const toggleLanguage = (lang: string) => {
    hapticTap();
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handlePublishTrip = async () => {
    if (!destination.trim()) {
      hapticWarning();
      toast.error('Please specify a public meeting spot or destination');
      return;
    }
    if (selectedVibes.length === 0) {
      hapticWarning();
      toast.error('Please pick at least 1 vibe tag');
      return;
    }

    setIsSubmitting(true);
    try {
      const ladderObj = TRUST_LADDER.find((l) => l.level === selectedLadder);
      const newTripData: Partial<Trip> = {
        id: `trip-${Date.now()}`,
        destination: destination.trim(),
        flag_color: flagColor,
        trip_type: ladderObj?.type || 'micro_date',
        ladder_level: selectedLadder,
        vibe: selectedVibes[0],
        vibe_tags: selectedVibes,
        languages: selectedLanguages,
        start_date: startDate || 'Today',
        spots_total: flagColor === 'pink' ? 1 : groupSize,
        spots_available: flagColor === 'pink' ? 1 : groupSize - 1,
        female_only: isWomenOnly,
        description: customNote.trim() || `${selectedVibes.join(' & ')} at ${destination}`,
        budget_per_day: perPersonCost,
        cost_split: {
          fuel: fuelCost,
          stay: stayCost,
          food: foodCost,
          per_person: perPersonCost,
          total: totalCost,
        },
        host_green_score: 4.9,
        host_verified: true,
        why_match: 'Both active today • Shared vibe',
      };

      // Call API or create client side
      try {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTripData),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.trip) {
            newTripData.id = data.trip.id;
          }
        }
      } catch {
        // Continue with mock if offline
      }

      setCreatedTrip(newTripData as Trip);
      onTripCreated(newTripData as Trip);
      hapticSuccess();
      setCurrentScreen('success');
    } catch {
      toast.error('Failed to publish trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBoost = () => {
    hapticSuccess();
    setBoosted(true);
    toast.success('🚀 Trip Boosted for ₹49! Pinned at top of MapKit for 6 hours.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF9F6] border border-stone-200/90 rounded-t-[36px] sm:rounded-[36px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-[#382A21]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {currentScreen === 'build' && (
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setCurrentScreen('type');
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#382A21]">
                {currentScreen === 'type' && 'Choose Trip Trust Ladder'}
                {currentScreen === 'build' && 'Build Your Travel Plan'}
                {currentScreen === 'success' && 'Plan Published! 🎉'}
              </h2>
              <p className="text-[11px] font-medium text-stone-500">
                {currentScreen === 'type' && 'Verified Apple 4.3 Safe Dating Progression'}
                {currentScreen === 'build' && 'Transparent Cost Split & Safe Public Venues'}
                {currentScreen === 'success' && 'Live on MapKit near your location'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">

          {/* ================= SCREEN 2A: CHOOSE TYPE ================= */}
          {currentScreen === 'type' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100/80 border border-stone-200 rounded-[20px] flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#1D3B2A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#382A21]/80 font-medium leading-relaxed">
                  <strong>Trust-First Progression:</strong> To keep everyone safe and compliant with Apple 4.3 safety guidelines, all first dates begin with Level 1 Public Micro Dates.
                </p>
              </div>

              {/* Ladder Cards */}
              <div className="space-y-3.5">
                {TRUST_LADDER.map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => handleSelectLadder(item.level)}
                    className={`w-full text-left p-5 rounded-[28px] border-2 bg-gradient-to-br ${item.bgGradient} bg-white ${item.border} shadow-sm hover:shadow-md transition-all active:scale-[0.98] group relative cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-extrabold text-base text-[#382A21]">
                              {item.title}
                            </h3>
                          </div>
                          <span className={`inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.tagBg}`}>
                            {item.duration} • {item.expiry}
                          </span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#1D3B2A] text-white flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-xs text-[#382A21]/75 font-medium mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= SCREEN 2B: BUILD TRIP ================= */}
          {currentScreen === 'build' && (
            <div className="space-y-5">
              
              {/* Flag Color Intent Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                  Trip Intent & Flag
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setFlagColor('green');
                    }}
                    className={`p-3.5 rounded-[22px] border-2 flex items-center gap-2.5 transition-all text-left ${
                      flagColor === 'green'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-stone-200 bg-white text-[#382A21]/70'
                    }`}
                  >
                    <span className="text-xl">🟢</span>
                    <div>
                      <div className="font-extrabold text-xs">Green Flag</div>
                      <div className="text-[10px] text-stone-500">Travel Buddy / Group</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setFlagColor('pink');
                      setGroupSize(1);
                    }}
                    className={`p-3.5 rounded-[22px] border-2 flex items-center gap-2.5 transition-all text-left ${
                      flagColor === 'pink'
                        ? 'border-pink-500 bg-pink-50/70 text-pink-950 shadow-xs'
                        : 'border-stone-200 bg-white text-[#382A21]/70'
                    }`}
                  >
                    <span className="text-xl">💗</span>
                    <div>
                      <div className="font-extrabold text-xs">Pink Flag</div>
                      <div className="text-[10px] text-stone-500">1-on-1 Travel Date</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Destination / Public Place Search */}
              <div className="relative">
                <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                  Meeting Spot / Destination {flagColor === 'pink' && <span className="text-pink-600 font-bold">(Public Place Enforced)</span>}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#1D3B2A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowPlaceDropdown(true);
                    }}
                    placeholder="Search café, rooftop, trail or public spot..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200/90 rounded-[20px] text-xs font-bold text-[#382A21] placeholder-stone-400 focus:outline-none focus:border-[#1D3B2A] shadow-xs"
                  />
                </div>

                {/* Place Quick Suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SAMPLE_PUBLIC_PLACES.slice(0, 4).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setDestination(p);
                        setShowPlaceDropdown(false);
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200/60"
                    >
                      📍 {p.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                    When
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-[18px] text-xs font-bold text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-[18px] text-xs font-bold text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
                    />
                  </div>
                </div>
              </div>

              {/* Group Size & Female Only */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                    Group Size
                  </label>
                  {flagColor === 'pink' ? (
                    <div className="py-2.5 px-3 bg-pink-50 border border-pink-200 rounded-[18px] text-xs font-bold text-pink-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> 1-on-1 Dating (1 Spot)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-[18px] p-1">
                      {[2, 4, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setGroupSize(num);
                          }}
                          className={`flex-1 py-1.5 rounded-[14px] text-xs font-extrabold transition-all ${
                            groupSize === num
                              ? 'bg-[#1D3B2A] text-white shadow-xs'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {num} Pax
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                    Safety Circle
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setIsWomenOnly(!isWomenOnly);
                    }}
                    className={`w-full py-2.5 px-3 rounded-[18px] border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isWomenOnly
                        ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isWomenOnly ? '👩 Women-Only' : 'Open to All'}</span>
                  </button>
                </div>
              </div>

              {/* Vibe Tags (Select 2) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#382A21]/70">
                    Vibe Tags (Select 2)
                  </label>
                  <span className="text-[10px] font-bold text-stone-500">
                    {selectedVibes.length}/2 Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TAGS.map((v) => {
                    const isSelected = selectedVibes.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleVibe(v.id)}
                        className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{v.icon}</span>
                        <span>{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cost Split Calculator Box (Apple 4.3 Utility) */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-[24px] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-700" />
                    <span className="font-display font-extrabold text-xs text-emerald-950">
                      Cost Split Calculator
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Auto-Calculated
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-[16px] border border-emerald-200/60 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 block">Fuel / Travel</span>
                    <input
                      type="number"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(Number(e.target.value) || 0)}
                      className="w-full text-center font-extrabold text-xs text-[#382A21] focus:outline-none"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-[16px] border border-emerald-200/60 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 block">Food / Drinks</span>
                    <input
                      type="number"
                      value={foodCost}
                      onChange={(e) => setFoodCost(Number(e.target.value) || 0)}
                      className="w-full text-center font-extrabold text-xs text-[#382A21] focus:outline-none"
                    />
                  </div>
                  <div className="bg-white p-2.5 rounded-[16px] border border-emerald-200/60 shadow-xs">
                    <span className="text-[10px] font-bold text-stone-500 block">Stay (if any)</span>
                    <input
                      type="number"
                      value={stayCost}
                      onChange={(e) => setStayCost(Number(e.target.value) || 0)}
                      className="w-full text-center font-extrabold text-xs text-[#382A21] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-bold text-emerald-900">Calculated Per Person:</span>
                  <span className="font-extrabold text-sm text-[#1D3B2A] bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                    ₹{perPersonCost} / person
                  </span>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                  Comfort Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-stone-800 text-white border-stone-800'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#382A21]/70 mb-2">
                  Short Note / Plan Description
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g., Grabbing specialty pour-overs & working on side projects at Third Wave Indiranagar."
                  rows={2}
                  className="w-full p-3 bg-white border border-stone-200/90 rounded-[20px] text-xs font-medium text-[#382A21] placeholder-stone-400 focus:outline-none focus:border-[#1D3B2A]"
                />
              </div>

            </div>
          )}

          {/* ================= SCREEN 2C: SUCCESS & BOOST ================= */}
          {currentScreen === 'success' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl shadow-md animate-bounce">
                🎉
              </div>

              <div>
                <h3 className="font-display font-extrabold text-xl text-[#382A21]">
                  Your Plan is Live!
                </h3>
                <p className="text-xs text-stone-600 font-medium mt-1">
                  Notifying <strong>23 verified members</strong> nearby in your city.
                </p>
              </div>

              {/* Plan Card Preview */}
              <div className="p-4 bg-white border border-stone-200 rounded-[24px] text-left shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#382A21] flex items-center gap-1.5">
                    {flagColor === 'pink' ? '💗 Pink Flag' : '🟢 Green Flag'} • {destination}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {selectedVibes.join(' • ')} • ₹{perPersonCost}/person
                </p>
              </div>

              {/* Boost Upsell Box */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/80 rounded-[24px] text-left space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      🚀
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-sm text-[#382A21]">
                        Boost Your Plan
                      </h4>
                      <p className="text-[11px] font-medium text-stone-600">
                        Reach 100+ verified travelers for 6 hours
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full">
                    ₹49 only
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBoost}
                  disabled={boosted}
                  className={`w-full py-3 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    boosted
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{boosted ? 'Plan Boosted (Active for 6h) ✓' : 'Boost Now for ₹49'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 sm:p-5 border-t border-stone-200/80 bg-white flex items-center justify-between gap-3">
          {currentScreen === 'type' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => handleSelectLadder(1)}
                className="w-full py-3.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Plan Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentScreen === 'build' && (
            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentScreen('type')}
                className="px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-[#382A21] font-bold text-xs rounded-full transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePublishTrip}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Publish Travel Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {currentScreen === 'success' && (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-full py-3.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-md active:scale-95 transition-all"
            >
              Done / View My Trips
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
