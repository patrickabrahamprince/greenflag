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
  Clock,
  Car,
  ChevronLeft,
  Plus,
  Minus
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

// Organic Floating Vibe Bubbles
const VIBE_BUBBLES = [
  { label: 'Chill' as TripVibe, icon: '☕', name: 'Café & Chill', color: 'bg-[#F4EDE4] text-[#4A3B32] border-[#E8DCCF]', activeColor: 'bg-[#5D8A55] text-white border-[#5D8A55]' },
  { label: 'Foodie' as TripVibe, icon: '🍕', name: 'Food & Brewery', color: 'bg-[#FDF0EC] text-[#8C3B23] border-[#F9D8CE]', activeColor: 'bg-[#E77937] text-white border-[#E77937]' },
  { label: 'Daytrip' as TripVibe, icon: '🌅', name: 'Sunrise Drive', color: 'bg-[#FEF6E8] text-[#855B14] border-[#FBE6C2]', activeColor: 'bg-[#E5A93C] text-white border-[#E5A93C]' },
  { label: 'Roadtrip' as TripVibe, icon: '🚗', name: 'Weekend Getaway', color: 'bg-[#EEF4FF] text-[#1E3A8A] border-[#D6E4FF]', activeColor: 'bg-[#3B82F6] text-white border-[#3B82F6]' },
  { label: 'Trek' as TripVibe, icon: '🥾', name: 'Trek & Nature', color: 'bg-[#EFF8F1] text-[#1D5C2B] border-[#D1ECD6]', activeColor: 'bg-[#2E7D32] text-white border-[#2E7D32]' },
  { label: 'Beach' as TripVibe, icon: '🏖️', name: 'Beach & Waves', color: 'bg-[#ECFAFA] text-[#155E63] border-[#D0F2F2]', activeColor: 'bg-[#0D9488] text-white border-[#0D9488]' },
  { label: 'Festival' as TripVibe, icon: '🎸', name: 'Live Gig & Music', color: 'bg-[#F7EEFA] text-[#632476] border-[#EED9F5]', activeColor: 'bg-[#8B72FF] text-white border-[#8B72FF]' },
  { label: 'Workcation' as TripVibe, icon: '💻', name: 'Workcation', color: 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]', activeColor: 'bg-[#475569] text-white border-[#475569]' },
];

// Spot Style Cloud Tags
const SPOT_CLOUD_TAGS = [
  { id: 'cozy_cafe', label: 'Cozy Specialty Café', icon: '☕', tagColor: 'bg-[#FDF6ED] text-[#784A1C]' },
  { id: 'rooftop', label: 'Rooftop Sunset View', icon: '🌇', tagColor: 'bg-[#FEF0EC] text-[#9A3412]' },
  { id: 'lively_bar', label: 'Craft Brewery / Bar', icon: '🍻', tagColor: 'bg-[#FEF9EE] text-[#854D0E]' },
  { id: 'fine_dine', label: 'Dinner / Fine Dine', icon: '🍽️', tagColor: 'bg-[#F5F0EB] text-[#443831]' },
  { id: 'scenic_drive', label: 'Scenic Highway Drive', icon: '🛣️', tagColor: 'bg-[#EFF6FF] text-[#1E40AF]' },
  { id: 'viewpoint', label: 'Mountain Viewpoint', icon: '⛰️', tagColor: 'bg-[#F0FDF4] text-[#166534]' },
  { id: 'picnic_park', label: 'Botanical Park Picnic', icon: '🌿', tagColor: 'bg-[#ECFDF5] text-[#065F46]' },
  { id: 'street_food', label: 'Street Food Crawl', icon: '🌮', tagColor: 'bg-[#FFF1F2] text-[#9F1239]' },
  { id: 'homestay', label: 'Cozy Villa / Homestay', icon: '🏡', tagColor: 'bg-[#FAF5FF] text-[#6B21A8]' },
  { id: 'beach_shack', label: 'Beachside Shack', icon: '🏖️', tagColor: 'bg-[#F0FDFA] text-[#115E59]' },
];

// Time Presets
const TIME_OPTIONS = [
  { label: '6:00 AM Sunrise', icon: '🌅' },
  { label: '10:00 AM Coffee', icon: '☕' },
  { label: '1:30 PM Lunch', icon: '☀️' },
  { label: '5:30 PM Sunset', icon: '🌇' },
  { label: '8:00 PM Dinner', icon: '🍸' },
  { label: '10:00 PM Late Night', icon: '🌙' },
  { label: 'Flexible / Anytime', icon: '⚡' },
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // 5 Warm Minimalist Steps
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [spotStyle, setSpotStyle] = useState('Cozy Specialty Café');
  const [locationName, setLocationName] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('5:30 PM Sunset');
  const [customTimeInput, setCustomTimeInput] = useState('');
  
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [transportType, setTransportType] = useState('Meet at Venue');

  // Budget
  const [budgetAmount, setBudgetAmount] = useState<number>(500);
  const [budgetMode, setBudgetMode] = useState<'amount' | 'split' | 'free' | 'treat'>('amount');
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resolvedDestination = locationName.trim()
    ? `${locationName.trim()} (${spotStyle})`
    : spotStyle;

  const resolvedTime = customTimeInput.trim() ? customTimeInput.trim() : selectedTimeSlot;

  const resolvedBudgetDisplay = budgetMode === 'free'
    ? 'Free (₹0)'
    : budgetMode === 'split'
    ? 'Split 50-50'
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

  const handleNext = () => {
    if (step === 3 && !startDate) {
      toast.error('Please pick a date');
      hapticWarning();
      return;
    }
    hapticTap();
    setStep((s) => (s + 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleBack = () => {
    hapticTap();
    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#231E1A]/70 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-t-[40px] sm:rounded-[40px] max-w-lg w-full h-[94dvh] max-h-[94dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-sheet-up font-sans"
      >
        
        {/* Top Minimal Navigation & Progress Line */}
        <div className="px-6 pt-6 pb-2 shrink-0 bg-[#FAF8F5]">
          <div className="flex items-center justify-between gap-4 mb-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#2D241E] shadow-sm active:scale-90 transition-transform cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Smooth Fill Progress Bar */}
            <div className="flex-1 max-w-[180px]">
              <div className="h-1.5 w-full bg-[#E8E2D9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5D8A55] rounded-full transition-all duration-400 ease-out"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#2D241E] shadow-sm active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 1: Activity Vibes (Organic Floating Bubbles) */}
        {step === 1 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-5 animate-fade-in">
            <div className="text-center sm:text-left pt-2">
              <h2 className="text-2xl sm:text-[28px] font-black text-[#29221D] tracking-tight leading-tight">
                What makes you excited today?
              </h2>
              <p className="text-xs sm:text-sm text-[#73685E] font-medium mt-1.5">
                Pick the hangout vibe you want to host.
              </p>
            </div>

            {/* Organic Staggered Floating Bubble Cloud */}
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start pt-2">
              {VIBE_BUBBLES.map((cat) => {
                const isSelected = vibe === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setVibe(cat.label);
                    }}
                    className={`px-4 py-3 rounded-full text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center gap-2 shadow-sm ${
                      isSelected
                        ? `${cat.activeColor} shadow-md scale-105 ring-2 ring-black/10`
                        : `${cat.color} hover:shadow hover:scale-[1.02]`
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-white border border-[#E8E2D9] rounded-3xl mt-4 shadow-sm flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <p className="text-xs text-[#73685E] font-medium leading-relaxed">
                Selected: <strong className="text-[#29221D]">{vibe}</strong> — great choice for meeting fun, easygoing companions.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Spot Style (Visual Tag Cloud + Open Search) */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-5 animate-fade-in">
            <div className="text-center sm:text-left pt-2">
              <h2 className="text-2xl sm:text-[28px] font-black text-[#29221D] tracking-tight leading-tight">
                What style of spot?
              </h2>
              <p className="text-xs sm:text-sm text-[#73685E] font-medium mt-1.5">
                Choose the venue vibe or type a specific place.
              </p>
            </div>

            {/* Floating Tag Cloud */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SPOT_CLOUD_TAGS.map((spot) => {
                const isSelected = spotStyle === spot.label;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSpotStyle(spot.label);
                    }}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center gap-2 shadow-sm ${
                      isSelected
                        ? '!bg-[#29221D] !text-white !border-[#29221D] shadow-md scale-105'
                        : `${spot.tagColor} border-black/5 hover:border-black/15 bg-white`
                    }`}
                  >
                    <span className="text-base">{spot.icon}</span>
                    <span>{spot.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Open Custom Spot Input Card */}
            <div className="p-4 bg-white border border-[#E8E2D9] rounded-3xl space-y-2 shadow-sm">
              <label className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#5D8A55]" />
                <span>Exact place or neighborhood (Optional)</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Blue Tokai Koramangala, Nandi Hills, Church St..."
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl text-xs text-[#29221D] font-bold placeholder-[#A89F95] focus:outline-none focus:bg-white focus:border-[#29221D]"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Date & Shoot the Time */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-5 animate-fade-in">
            <div className="text-center sm:text-left pt-2">
              <h2 className="text-2xl sm:text-[28px] font-black text-[#29221D] tracking-tight leading-tight">
                When are you free?
              </h2>
              <p className="text-xs sm:text-sm text-[#73685E] font-medium mt-1.5">
                Pick a date and shoot the exact meeting time.
              </p>
            </div>

            {/* Date Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#73685E]">
                1. Choose Date
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="py-3 px-3 bg-white hover:bg-[#F4EDE4] border border-[#E8E2D9] rounded-2xl text-xs font-extrabold text-[#29221D] text-center active:scale-95 shadow-sm"
                >
                  🌇 Today Evening
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="py-3 px-3 bg-white hover:bg-[#F4EDE4] border border-[#E8E2D9] rounded-2xl text-xs font-extrabold text-[#29221D] text-center active:scale-95 shadow-sm"
                >
                  ⚡ Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('this_weekend')}
                  className="py-3 px-3 bg-[#EFF8F1] hover:bg-[#D1ECD6] border border-[#D1ECD6] rounded-2xl text-xs font-black text-[#1D5C2B] text-center active:scale-95 shadow-sm"
                >
                  🎉 This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('next_weekend')}
                  className="py-3 px-3 bg-white hover:bg-[#F4EDE4] border border-[#E8E2D9] rounded-2xl text-xs font-extrabold text-[#29221D] text-center active:scale-95 shadow-sm"
                >
                  📅 Next Weekend
                </button>
              </div>

              {/* Exact Date Picker */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-[#73685E] mb-1 block">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded-2xl text-xs text-[#29221D] font-bold focus:outline-none focus:border-[#29221D]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#73685E] mb-1 block">End Date (Optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded-2xl text-xs text-[#29221D] font-bold focus:outline-none focus:border-[#29221D]"
                  />
                </div>
              </div>
            </div>

            {/* Shoot Time Pills */}
            <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#73685E]">
                2. Shoot the Time
              </span>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((time) => {
                  const isSelected = selectedTimeSlot === time.label && !customTimeInput.trim();
                  return (
                    <button
                      key={time.label}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedTimeSlot(time.label);
                        setCustomTimeInput('');
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm ${
                        isSelected
                          ? '!bg-[#29221D] !text-white !border-[#29221D]'
                          : 'bg-white text-[#29221D] border-[#E8E2D9] hover:bg-[#F4EDE4]'
                      }`}
                    >
                      <span>{time.icon}</span>
                      <span>{time.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Free-form Custom Time */}
              <div className="relative pt-1">
                <Clock className="w-4 h-4 text-[#5D8A55] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  placeholder="Or type any time (e.g. 6:45 PM, 5 AM sunrise)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D9] rounded-2xl text-xs text-[#29221D] font-bold placeholder-[#A89F95] focus:outline-none focus:border-[#29221D]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Budget & Companions */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-5 animate-fade-in">
            <div className="text-center sm:text-left pt-2">
              <h2 className="text-2xl sm:text-[28px] font-black text-[#29221D] tracking-tight leading-tight">
                Budget & companions
              </h2>
              <p className="text-xs sm:text-sm text-[#73685E] font-medium mt-1.5">
                Set the group size and estimated spend per person.
              </p>
            </div>

            {/* Companion Count */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#73685E]">
                1. How many companions?
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
                      className={`flex-1 py-3 rounded-2xl border text-center text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm ${
                        isSelected
                          ? '!bg-[#29221D] !text-white !border-[#29221D]'
                          : 'bg-white text-[#29221D] border-[#E8E2D9] hover:bg-[#F4EDE4]'
                      }`}
                    >
                      {num} {num === 1 ? 'person' : 'people'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Modes & Custom Stepper */}
            <div className="space-y-3 pt-2 border-t border-[#E8E2D9]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#73685E]">
                2. Shoot the Spend (Any amount)
              </span>

              {/* Mode Pills */}
              <div className="grid grid-cols-4 gap-1.5">
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
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      budgetMode === b.id
                        ? '!bg-[#29221D] !text-white !border-[#29221D]'
                        : 'bg-white text-[#29221D] border border-[#E8E2D9] hover:bg-[#F4EDE4]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Amount Display with Stepper */}
              {budgetMode === 'amount' && (
                <div className="p-4 bg-white border border-[#E8E2D9] rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setBudgetAmount((p) => Math.max(0, p - 100));
                      }}
                      className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center text-[#29221D] active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="text-center">
                      <div className="text-3xl font-black text-[#29221D]">
                        ₹{budgetAmount}
                      </div>
                      <span className="text-[10px] text-[#73685E] font-bold">
                        Estimated per person
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setBudgetAmount((p) => p + 100);
                      }}
                      className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center text-[#29221D] active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Values */}
                  <div className="flex gap-1.5 pt-1">
                    {[200, 500, 1000, 2500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setBudgetAmount(val);
                        }}
                        className={`flex-1 py-1 text-xs font-bold rounded-xl border transition-all ${
                          budgetAmount === val
                            ? 'bg-[#29221D] text-white border-[#29221D]'
                            : 'bg-[#FAF8F5] text-[#29221D] border-[#E8E2D9]'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Female Only */}
            {currentUserPersona === 'woman' && (
              <div className="p-3.5 bg-[#FAF5FF] border border-[#E9D5FF] rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-[#9333EA] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#581C87]">Female-Only Plan</div>
                    <div className="text-[10px] text-[#7E22CE]">Only verified women can view and request to join.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={femaleOnly}
                  onChange={(e) => {
                    hapticTap();
                    setFemaleOnly(e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#9333EA] cursor-pointer rounded"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Note & Card Confirmation */}
        {step === 5 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in">
            <div className="text-center sm:text-left pt-2">
              <h2 className="text-2xl sm:text-[28px] font-black text-[#29221D] tracking-tight leading-tight">
                Ready to go live!
              </h2>
              <p className="text-xs sm:text-sm text-[#73685E] font-medium mt-1.5">
                Add a short note and confirm your hangout plan.
              </p>
            </div>

            {/* Personal Note */}
            <div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grabbing specialty coffees, checking out art prints, and having great conversation. Easygoing vibes!"
                className="w-full p-4 bg-white border border-[#E8E2D9] rounded-3xl text-xs text-[#29221D] font-medium placeholder-[#A89F95] focus:outline-none focus:border-[#29221D] leading-relaxed shadow-sm"
              />
            </div>

            {/* Live Feed Card Confirmation */}
            <div className="p-5 rounded-[32px] bg-white border border-[#E8E2D9] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#5D8A55] text-white text-[11px] font-bold shadow-sm">
                  {vibe}
                </span>
                <span className="text-xs font-extrabold text-[#5D8A55]">
                  {spotsTotal} spot{spotsTotal !== 1 ? 's' : ''} left
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-[#29221D]">{resolvedDestination}</h4>
                <p className="text-xs text-[#73685E] font-bold mt-0.5">
                  {startDate || 'Upcoming Date'} • ⏰ {resolvedTime} • {resolvedBudgetDisplay}
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] text-xs text-[#443831] font-medium leading-relaxed">
                {description.trim() || 'Excited to hang out and meet new companions!'}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Button */}
        <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-[#FAF8F5] border-t border-[#E8E2D9] shrink-0">
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full h-14 rounded-full bg-[#29221D] hover:bg-[#1A1512] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="w-full h-14 rounded-full bg-[#5D8A55] hover:bg-[#4E7647] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
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
