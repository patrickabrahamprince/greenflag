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
  HelpCircle,
  Edit3
} from 'lucide-react';
import { TripVibe, Trip } from '@/types';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
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
  { label: 'Chill' as TripVibe, icon: '☕', name: 'Café & Chill', desc: 'Coffee, work, relaxed catchup' },
  { label: 'Foodie' as TripVibe, icon: '🍕', name: 'Food & Drinks', desc: 'Dinner, brewery, food crawl' },
  { label: 'Daytrip' as TripVibe, icon: '🌅', name: 'Day Trip / Drive', desc: 'Sunrise spot, viewpoint, picnic' },
  { label: 'Roadtrip' as TripVibe, icon: '🚗', name: 'Weekend Getaway', desc: 'Outstation roadtrip, homestay' },
  { label: 'Trek' as TripVibe, icon: '🥾', name: 'Trek & Nature', desc: 'Hills, nature trail, hike' },
  { label: 'Beach' as TripVibe, icon: '🏖️', name: 'Beach & Coastal', desc: 'Ocean, beach shacks, sunset' },
  { label: 'Festival' as TripVibe, icon: '🎸', name: 'Concert & Events', desc: 'Live gig, standup comedy, art' },
  { label: 'Workcation' as TripVibe, icon: '💻', name: 'Workcation', desc: 'Scenic work session with wifi' },
];

// 2. Spot Styles (User chooses the vibe/style of the spot!)
const SPOT_STYLES = [
  { id: 'cozy_cafe', label: 'Cozy Specialty Café', icon: '☕' },
  { id: 'rooftop', label: 'Rooftop & Sunset Views', icon: '🌇' },
  { id: 'lively_bar', label: 'Lively Bar / Brewery', icon: '🍻' },
  { id: 'fine_dine', label: 'Dinner / Fine Dine', icon: '🍽️' },
  { id: 'scenic_drive', label: 'Scenic Drive & Highway', icon: '🛣️' },
  { id: 'viewpoint', label: 'Mountain Viewpoint', icon: '⛰️' },
  { id: 'outdoor_nature', label: 'Park / Botanical Picnic', icon: '🌿' },
  { id: 'street_food', label: 'Street Food & Night Crawl', icon: '🌮' },
  { id: 'resort_stay', label: 'Homestay / Cozy Villa', icon: '🏡' },
  { id: 'beach_shack', label: 'Beachside Shack', icon: '🏖️' },
];

// 3. Time Presets + Custom Time
const TIME_PRESETS = [
  { label: 'Morning (8:00 AM - 11:00 AM)', icon: '🌅' },
  { label: 'Afternoon (1:00 PM - 4:00 PM)', icon: '☀️' },
  { label: 'Evening (5:30 PM - 8:30 PM)', icon: '🌇' },
  { label: 'Night Out (9:00 PM onwards)', icon: '🌙' },
  { label: 'Flexible / Anytime', icon: '⚡' },
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
  // Bumble Questionnaire: 5 clean question screens
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [spotStyle, setSpotStyle] = useState('Cozy Specialty Café');
  const [locationName, setLocationName] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [meetTime, setMeetTime] = useState('Evening (5:30 PM - 8:30 PM)');
  const [customTime, setCustomTime] = useState('');
  
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [transportType, setTransportType] = useState(TRANSPORT_CHOICES[0].label);

  // Any Money / Budget
  const [budgetAmount, setBudgetAmount] = useState<string>('500');
  const [budgetType, setBudgetType] = useState<'custom' | 'split' | 'free' | 'treat'>('custom');
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Final destination label combination
  const resolvedDestination = locationName.trim()
    ? `${locationName.trim()} (${spotStyle})`
    : spotStyle;

  const resolvedTime = customTime.trim() ? customTime.trim() : meetTime;

  const resolvedBudgetNumber = budgetType === 'free' ? 0 : Number(budgetAmount) || 0;

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
      toast.error('Please pick a date for your plan.');
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
      const budgetNote = budgetType === 'free' 
        ? 'Free / No spend' 
        : budgetType === 'split' 
        ? 'Split 50-50' 
        : budgetType === 'treat' 
        ? 'My treat' 
        : `₹${resolvedBudgetNumber}`;

      const fullDescription = description.trim() 
        ? `${description.trim()}\n\n⏰ Time: ${resolvedTime} • 💰 Budget: ${budgetNote}`
        : `Looking forward to meeting up for ${vibe.toLowerCase()} hangout!\n\n⏰ Time: ${resolvedTime} • 💰 Budget: ${budgetNote}`;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: resolvedDestination,
          start_date: startDate,
          end_date: endDate || startDate,
          vibe,
          transport_type: transportType,
          budget_per_day: resolvedBudgetNumber,
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
      toast.success('Your plan is live!');
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
        className="bg-white border border-slate-200 rounded-t-[32px] sm:rounded-3xl max-w-lg w-full h-[92dvh] max-h-[92dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-sheet-up"
      >
        
        {/* Top Bumble-Style Segmented Progress Bar */}
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
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform cursor-pointer"
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
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                What are you in the mood for?
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Choose the main vibe of your plan.
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-95 relative flex flex-col justify-between min-h-[105px] ${
                      isSelected
                        ? '!border-slate-950 !bg-slate-950 !text-white shadow-md transform-gpu -translate-y-0.5'
                        : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 !text-slate-950 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="text-2xl mb-1">{cat.icon}</div>
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

        {/* QUESTION 2: Spot Style & Location (No fixed location list — pure style & open search!) */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                What style of spot?
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Pick the venue style, and optionally type the exact place or neighborhood.
              </p>
            </div>

            {/* Spot Style Pills */}
            <div className="grid grid-cols-2 gap-2 pt-1">
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
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-95 flex items-center gap-2.5 ${
                      isSelected
                        ? '!border-slate-950 !bg-slate-950 !text-white shadow-md'
                        : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 !text-slate-950 shadow-sm'
                    }`}
                  >
                    <span className="text-xl shrink-0">{style.icon}</span>
                    <span className={`text-xs font-black leading-tight ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Optional Specific Spot / Area Input */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 mb-1.5 block">
                Have a specific spot or area in mind? (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Blue Tokai Koramangala, Nandi Hills, Church St..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* QUESTION 3: Date, Free Custom Time & Group Size */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                When are you free?
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Choose the date and set any custom time you want.
              </p>
            </div>

            {/* Quick Date Presets */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. Date
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

            {/* Time: Free Custom Time + Presets */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                2. Time (Pick preset or enter any time)
              </span>
              
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {TIME_PRESETS.map((t) => {
                  const isSelected = meetTime === t.label && !customTime.trim();
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setMeetTime(t.label);
                        setCustomTime('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                        isSelected
                          ? '!bg-slate-950 !text-white shadow-sm'
                          : '!bg-slate-100 !text-slate-800 hover:!bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Free-form custom time input */}
              <div className="relative">
                <Clock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="Or enter any custom time (e.g. 6:30 PM, Sunset 5:45 PM)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950"
                />
              </div>
            </div>

            {/* Companions Count */}
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

        {/* QUESTION 4: Commute & ANY Money / Budget */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Commute & Budget
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Set how you will get there and enter any custom budget.
              </p>
            </div>

            {/* Commute */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. How will you meet / travel?
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

            {/* Budget: ANY Money / Custom spend */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                2. Budget / Spend (Enter any amount)
              </span>

              {/* Budget Style Quick Chips */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {[
                  { id: 'custom', label: 'Custom ₹' },
                  { id: 'split', label: 'Split 50-50' },
                  { id: 'free', label: 'Free (₹0)' },
                  { id: 'treat', label: 'My treat' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setBudgetType(b.id as 'custom' | 'split' | 'free' | 'treat');
                      if (b.id === 'free') setBudgetAmount('0');
                    }}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-black transition-all cursor-pointer active:scale-95 ${
                      budgetType === b.id
                        ? '!bg-slate-950 !text-white shadow-sm'
                        : '!bg-slate-100 !text-slate-800 hover:!bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Free-form Amount Input (Allows typing ANY money) */}
              <div className="relative">
                <span className="text-sm font-black text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2">
                  ₹
                </span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => {
                    setBudgetAmount(e.target.value);
                    setBudgetType('custom');
                  }}
                  placeholder="Enter any amount (e.g. 250, 1500, 5000)..."
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-slate-950"
                />
              </div>
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

        {/* QUESTION 5: Note & Live Preview */}
        {step === 5 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Add a quick note & review
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Tell companions a sentence or two about what to expect.
              </p>
            </div>

            {/* Short Note */}
            <div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grabbing specialty coffees, checking out art prints, and having great conversation. Easygoing vibes!"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-950 leading-relaxed shadow-sm"
              />
            </div>

            {/* Live Bumble Card Preview */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                Live Card Preview
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
                    {startDate || 'Upcoming Date'} • ⏰ {resolvedTime} • ₹{resolvedBudgetNumber}/person
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-medium leading-relaxed">
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
