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
  DollarSign, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Search,
  Compass,
  Car,
  Clock,
  Send,
  Navigation,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Heart,
  Flame,
  Plus,
  Minus,
  Zap,
  Smile
} from 'lucide-react';
import { TripVibe, Trip } from '@/types';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
  currentUserPersona?: string;
}

// 1. Activity Vibes
const VIBE_CATEGORIES = [
  { label: 'Chill' as TripVibe, icon: '☕', name: 'Café & Chill', desc: 'Coffee, work, relaxed catchup', color: 'from-amber-500/10 to-orange-500/10' },
  { label: 'Foodie' as TripVibe, icon: '🍕', name: 'Food & Drinks', desc: 'Dinner, brewery, food crawl', color: 'from-rose-500/10 to-orange-500/10' },
  { label: 'Daytrip' as TripVibe, icon: '🌅', name: 'Day Trip / Drive', desc: 'Sunrise spot, viewpoint, picnic', color: 'from-emerald-500/10 to-teal-500/10' },
  { label: 'Roadtrip' as TripVibe, icon: '🚗', name: 'Weekend Getaway', desc: 'Outstation roadtrip, homestay', color: 'from-blue-500/10 to-indigo-500/10' },
  { label: 'Trek' as TripVibe, icon: '🥾', name: 'Trek & Nature', desc: 'Hills, nature trail, hike', color: 'from-green-500/10 to-emerald-500/10' },
  { label: 'Beach' as TripVibe, icon: '🏖️', name: 'Beach & Coastal', desc: 'Ocean, beach shacks, sunset', color: 'from-cyan-500/10 to-blue-500/10' },
  { label: 'Festival' as TripVibe, icon: '🎸', name: 'Concert & Events', desc: 'Live gig, standup comedy, art', color: 'from-purple-500/10 to-pink-500/10' },
  { label: 'Workcation' as TripVibe, icon: '💻', name: 'Workcation', desc: 'Scenic work session with wifi', color: 'from-slate-500/10 to-teal-500/10' },
];

// 2. Spot Styles
const SPOT_STYLES = [
  { id: 'cozy_cafe', label: 'Cozy Specialty Café', icon: '☕', sub: 'Artisan coffee & relaxed talks' },
  { id: 'rooftop', label: 'Rooftop & Sunset Views', icon: '🌇', sub: 'Golden hour drinks & skyline' },
  { id: 'lively_bar', label: 'Lively Bar / Brewery', icon: '🍻', sub: 'Craft beers & music' },
  { id: 'fine_dine', label: 'Dinner / Fine Dine', icon: '🍽️', sub: 'Gourmet meal & conversation' },
  { id: 'scenic_drive', label: 'Scenic Highway Drive', icon: '🛣️', sub: 'Open roads & pitstops' },
  { id: 'viewpoint', label: 'Mountain Viewpoint', icon: '⛰️', sub: 'Fresh air & scenic views' },
  { id: 'outdoor_nature', label: 'Botanical Picnic / Park', icon: '🌿', sub: 'Greenery & casual walk' },
  { id: 'street_food', label: 'Street Food & Night Walk', icon: '🌮', sub: 'Local bites & lively streets' },
  { id: 'resort_stay', label: 'Homestay / Cozy Villa', icon: '🏡', sub: 'Weekend staycation' },
  { id: 'beach_shack', label: 'Beachside Shack', icon: '🏖️', sub: 'Waves, breeze & sunset' },
];

// 3. Time Shooter Options
const QUICK_TIME_SLOTS = [
  { label: '6:00 AM (Sunrise)', icon: '🌅' },
  { label: '10:00 AM (Brunch / Coffee)', icon: '☕' },
  { label: '1:30 PM (Lunch)', icon: '☀️' },
  { label: '5:30 PM (Evening Sunset)', icon: '🌇' },
  { label: '8:00 PM (Dinner & Drinks)', icon: '🍸' },
  { label: '10:00 PM (Night Drive / Hangout)', icon: '🌙' },
  { label: 'Flexible / Decide Together', icon: '⚡' },
];

// 4. Commute Format
const TRANSPORT_CHOICES = [
  { label: 'Meet at Venue / Spot', icon: '📍', desc: 'Meet directly at the location' },
  { label: 'Carpool / Fuel Split', icon: '🚗', desc: 'Ride together, share fuel & tolls' },
  { label: 'Bike / Two-Wheeler Buddy', icon: '🏍️', desc: 'Ride companion' },
  { label: 'Cab / Auto Share', icon: '🚕', desc: 'Split Uber / Ola fare' },
  { label: 'Train / Bus Buddy', icon: '🚆', desc: 'Travel together by train or bus' },
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // 5 Step Questionnaire
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [spotStyle, setSpotStyle] = useState('Cozy Specialty Café');
  const [locationName, setLocationName] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('5:30 PM (Evening Sunset)');
  const [customTimeInput, setCustomTimeInput] = useState('');
  
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [transportType, setTransportType] = useState(TRANSPORT_CHOICES[0].label);

  // Any Money / Budget
  const [budgetAmount, setBudgetAmount] = useState<number>(500);
  const [budgetMode, setBudgetMode] = useState<'amount' | 'split' | 'free' | 'treat'>('amount');
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Final resolved values
  const resolvedDestination = locationName.trim()
    ? `${locationName.trim()} (${spotStyle})`
    : spotStyle;

  const resolvedTime = customTimeInput.trim() ? customTimeInput.trim() : selectedTimeSlot;

  const resolvedBudgetDisplay = budgetMode === 'free'
    ? 'Free (₹0)'
    : budgetMode === 'split'
    ? 'Split bill 50-50'
    : budgetMode === 'treat'
    ? 'My treat'
    : `₹${budgetAmount}`;

  // Quick Date Helpers
  const setQuickDate = (type: 'today' | 'tomorrow' | 'this_weekend' | 'next_weekend') => {
    hapticTap();
    const today = new Date();
    if (type === 'today') {
      const d = today.toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const d = tomorrow.toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
    } else {
      const offset = type === 'this_weekend' ? 0 : 7;
      const dayOfWeek = today.getDay();
      const daysUntilSat = (6 - dayOfWeek + 7) % 7 + offset;
      const sat = new Date(today);
      sat.setDate(today.getDate() + (daysUntilSat === 0 ? 7 : daysUntilSat));
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      setStartDate(sat.toISOString().split('T')[0]);
      setEndDate(sun.toISOString().split('T')[0]);
    }
  };

  const handleAdjustBudget = (delta: number) => {
    hapticTap();
    setBudgetMode('amount');
    setBudgetAmount((prev) => Math.max(0, prev + delta));
  };

  // Nav Step Handlers
  const handleNextFromStep1 = () => {
    hapticTap();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    hapticTap();
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!startDate) {
      toast.error('Please select a date for your plan.');
      hapticWarning();
      return;
    }
    if (!endDate) {
      setEndDate(startDate);
    }
    hapticTap();
    setStep(4);
  };

  const handleNextFromStep4 = () => {
    hapticTap();
    setStep(5);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullDescription = description.trim() 
        ? `${description.trim()}\n\n⏰ Time: ${resolvedTime} • 💰 Budget: ${resolvedBudgetDisplay}`
        : `Excited to hang out! Let's do ${vibe.toLowerCase()} vibes.\n\n⏰ Time: ${resolvedTime} • 💰 Budget: ${resolvedBudgetDisplay}`;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: resolvedDestination,
          start_date: startDate,
          end_date: endDate || startDate,
          vibe,
          transport_type: transportType,
          budget_per_day: budgetMode === 'free' ? 0 : budgetAmount,
          spots_available: spotsTotal,
          spots_total: spotsTotal,
          female_only: femaleOnly,
          description: fullDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish plan');
      }

      hapticSuccess();
      toast.success('Your plan is live on the feed!');
      onTripCreated(data.trip);
      setStep(1);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error publishing plan';
      toast.error(msg);
      hapticWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          hapticTap();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-t-[36px] sm:rounded-3xl max-w-lg w-full h-[94dvh] max-h-[94dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-sheet-up"
      >
        
        {/* Top Bumble-Style Segmented Progress Bar & Navigation */}
        <div className="px-6 pt-5 pb-3 bg-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
                Question {step} of 5
              </span>
            </div>

            <div className="w-8 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bumble Segmented Pill Bar */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-slate-950' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* QUESTION 1: Activity Vibe */}
        {step === 1 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
                <span>⚡ Step 1</span>
                <span>•</span>
                <span>Hangout Style</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                What are you in the mood for?
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Choose the main activity vibe to match with like-minded companions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {VIBE_CATEGORIES.map((cat) => {
                const isSelected = vibe === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setVibe(cat.label);
                    }}
                    className={`p-4 rounded-3xl border text-left transition-all cursor-pointer select-none active:scale-95 relative flex flex-col justify-between min-h-[110px] ${
                      isSelected
                        ? '!border-slate-950 !bg-slate-950 !text-white shadow-lg transform-gpu -translate-y-1'
                        : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 !text-slate-950 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm animate-icon-bounce">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="text-3xl mb-1.5">{cat.icon}</div>
                    <div>
                      <div className={`text-xs font-black ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                        {cat.name}
                      </div>
                      <div className={`text-[10px] font-medium line-clamp-1 mt-0.5 ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUESTION 2: Spot Style & Open Venue Search */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
                <span>📍 Step 2</span>
                <span>•</span>
                <span>Spot Style</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                What style of spot?
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Pick your preferred venue atmosphere, and optionally name a specific place.
              </p>
            </div>

            {/* Spot Style Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {SPOT_STYLES.map((style) => {
                const isSelected = spotStyle === style.label;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSpotStyle(style.label);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? '!border-slate-950 !bg-slate-950 !text-white shadow-md'
                        : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 !text-slate-950 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{style.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </div>
                    <div>
                      <div className={`text-xs font-black leading-tight ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                        {style.label}
                      </div>
                      <div className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>
                        {style.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Specific Spot Input */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 mb-1.5 block">
                Have a specific café, landmark, or area in mind? (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Third Wave Coffee Sadashivnagar, Nandi Hills, Church St..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* QUESTION 3: Shoot Date & Shoot Time! */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
                <span>⏰ Step 3</span>
                <span>•</span>
                <span>Date & Time Shooter</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Shoot the date & time
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Pick a quick preset or type any exact time you prefer.
              </p>
            </div>

            {/* Quick Date Presets */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. Pick Date
              </span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95"
                >
                  🌇 Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95"
                >
                  ⚡ Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('this_weekend')}
                  className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl text-xs font-black text-emerald-950 text-center active:scale-95"
                >
                  🎉 This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('next_weekend')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95"
                >
                  📅 Next Weekend
                </button>
              </div>

              {/* Exact Date Picker */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 mb-0.5 block">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-slate-950"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 mb-0.5 block">End Date (Optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* Shoot the Time */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                2. Shoot the Time
              </span>
              
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                {QUICK_TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.label && !customTimeInput.trim();
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedTimeSlot(slot.label);
                        setCustomTimeInput('');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 flex items-center gap-2 text-left ${
                        isSelected
                          ? '!bg-slate-950 !text-white shadow-sm'
                          : '!bg-slate-100 !text-slate-800 hover:!bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span className="text-base shrink-0">{slot.icon}</span>
                      <span className="truncate">{slot.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Free-Form Custom Time Input */}
              <div className="relative">
                <Clock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  placeholder="Or shoot any custom time (e.g. 6:45 PM, 5:00 AM sunrise)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950"
                />
              </div>
            </div>

            {/* Companion Count */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                3. Looking for how many companions?
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => {
                  const isSelected = spotsTotal === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSpotsTotal(num);
                      }}
                      className={`flex-1 py-2.5 rounded-2xl border text-center text-xs transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? '!border-slate-950 !bg-slate-950 !text-white font-black shadow-md'
                          : '!border-slate-200 !bg-slate-100 !text-slate-900 hover:!bg-slate-200 font-bold'
                      }`}
                    >
                      {num} {num === 1 ? 'person' : 'people'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* QUESTION 4: Commute & Shoot Any Money! */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
                <span>💰 Step 4</span>
                <span>•</span>
                <span>Budget & Commute</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Shoot the budget & commute
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Enter any amount or choose a split style.
              </p>
            </div>

            {/* Commute Format */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. How will you meet / commute?
              </span>
              <div className="space-y-1.5">
                {TRANSPORT_CHOICES.map((t) => {
                  const isSelected = transportType === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setTransportType(t.label);
                      }}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer active:scale-98 ${
                        isSelected
                          ? '!border-slate-950 !bg-slate-950 !text-white shadow-sm'
                          : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 !text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.icon}</span>
                        <div>
                          <div className={`text-xs font-black ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                            {t.label}
                          </div>
                          <div className={`text-[10px] font-medium ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Money / Budget Shooter */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                2. Shoot the Budget / Spend (Any amount)
              </span>

              {/* Quick Split Modes */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[
                  { id: 'amount', label: 'Custom ₹' },
                  { id: 'split', label: 'Split 50-50' },
                  { id: 'free', label: 'Free (₹0)' },
                  { id: 'treat', label: 'My treat' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setBudgetMode(b.id as 'amount' | 'split' | 'free' | 'treat');
                      if (b.id === 'free') setBudgetAmount(0);
                    }}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all cursor-pointer active:scale-95 ${
                      budgetMode === b.id
                        ? '!bg-slate-950 !text-white shadow-sm'
                        : '!bg-slate-100 !text-slate-800 hover:!bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Tactile Money Stepper & Input */}
              {budgetMode === 'amount' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAdjustBudget(-100)}
                      className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 active:scale-90 shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="text-center">
                      <div className="text-3xl font-black text-slate-950">
                        ₹{budgetAmount}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Estimated per person
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdjustBudget(100)}
                      className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 active:scale-90 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Direct input & quick presets */}
                  <div className="flex items-center gap-2 pt-1">
                    {[200, 500, 1000, 2500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setBudgetAmount(val);
                        }}
                        className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition-all ${
                          budgetAmount === val
                            ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Female Only Option */}
            {currentUserPersona === 'woman' && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-purple-950">Female-Only Plan</div>
                    <div className="text-[10px] text-purple-700 font-semibold">Only verified women can see and request.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={femaleOnly}
                  onChange={(e) => {
                    hapticTap();
                    setFemaleOnly(e.target.checked);
                  }}
                  className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
                />
              </div>
            )}
          </div>
        )}

        {/* QUESTION 5: Personal Note & Live Card Preview */}
        {step === 5 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
                <span>✨ Final Step</span>
                <span>•</span>
                <span>Review & Live Card</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Add a quick note & review
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Say a sentence or two about the plan.
              </p>
            </div>

            {/* Short Note */}
            <div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grabbing specialty coffees, checking out art prints, and having great conversation. Easygoing vibes!"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950 leading-relaxed shadow-sm"
              />
            </div>

            {/* Live Bumble Card Preview */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                Live Feed Card Preview
              </span>
              <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full !bg-emerald-600 text-white text-[11px] font-black shadow-sm">
                    {vibe}
                  </span>
                  {femaleOnly && (
                    <span className="px-2.5 py-0.5 rounded-full !bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Female-Only
                    </span>
                  )}
                  <span className="text-xs font-black text-emerald-800">
                    {spotsTotal} spot{spotsTotal !== 1 ? 's' : ''} left
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-950">{resolvedDestination}</h4>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    {startDate || 'Upcoming Date'} • ⏰ {resolvedTime} • {transportType} • {resolvedBudgetDisplay}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-semibold leading-relaxed">
                  {description.trim() || 'Excited to hang out and meet new people!'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Bottom Action Button */}
        <div className="p-5 pb-[max(1.2rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-white shrink-0">
          {step === 1 && (
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="btn-primary w-full !rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue to Spot Style</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="btn-primary w-full !rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue to Date & Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleNextFromStep3}
              className="btn-primary w-full !rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue to Budget & Commute</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleNextFromStep4}
              className="btn-primary w-full !rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Preview & Note</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="btn-primary w-full !rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white animate-icon-pulse" />
                  <span>Publish Plan (Live Now)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
