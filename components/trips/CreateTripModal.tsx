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
  ChevronLeft,
  Check,
  Search,
  Clock,
  Plus,
  Minus,
  Sliders,
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

// 1. Organic Bubble Cloud Tags (Matched to reference design)
const VIBE_BUBBLES = [
  { label: 'Chill' as TripVibe, icon: '☕', name: 'Café & Chill', activeBg: 'bg-[#79A871] text-white' },
  { label: 'Foodie' as TripVibe, icon: '🍕', name: 'Food & Brewery', activeBg: 'bg-[#F07A38] text-white' },
  { label: 'Daytrip' as TripVibe, icon: '🌅', name: 'Sunrise Drive', activeBg: 'bg-[#F59E0B] text-white' },
  { label: 'Roadtrip' as TripVibe, icon: '🚗', name: 'Weekend Getaway', activeBg: 'bg-[#3B82F6] text-white' },
  { label: 'Trek' as TripVibe, icon: '🥾', name: 'Trek & Nature', activeBg: 'bg-[#2E7D32] text-white' },
  { label: 'Beach' as TripVibe, icon: '🏖️', name: 'Beach & Waves', activeBg: 'bg-[#0D9488] text-white' },
  { label: 'Festival' as TripVibe, icon: '🎸', name: 'Live Gig & Music', activeBg: 'bg-[#8B72FF] text-white' },
  { label: 'Workcation' as TripVibe, icon: '💻', name: 'Workcation', activeBg: 'bg-[#64748B] text-white' },
];

// 2. Spot Style Cloud Tags
const SPOT_CLOUD_TAGS = [
  { id: 'cozy_cafe', label: 'Cozy Specialty Café', icon: '☕', activeBg: 'bg-[#79A871] text-white' },
  { id: 'rooftop', label: 'Rooftop Sunset View', icon: '🌇', activeBg: 'bg-[#F07A38] text-white' },
  { id: 'lively_bar', label: 'Craft Brewery / Bar', icon: '🍻', activeBg: 'bg-[#F59E0B] text-white' },
  { id: 'fine_dine', label: 'Dinner / Fine Dine', icon: '🍽️', activeBg: 'bg-[#382A21] text-white' },
  { id: 'scenic_drive', label: 'Scenic Highway Drive', icon: '🛣️', activeBg: 'bg-[#3B82F6] text-white' },
  { id: 'viewpoint', label: 'Mountain Viewpoint', icon: '⛰️', activeBg: 'bg-[#2E7D32] text-white' },
  { id: 'picnic_park', label: 'Botanical Park Picnic', icon: '🌿', activeBg: 'bg-[#0D9488] text-white' },
  { id: 'street_food', label: 'Street Food Crawl', icon: '🌮', activeBg: 'bg-[#E11D48] text-white' },
  { id: 'homestay', label: 'Cozy Villa / Homestay', icon: '🏡', activeBg: 'bg-[#8B72FF] text-white' },
  { id: 'beach_shack', label: 'Beachside Shack', icon: '🏖️', activeBg: 'bg-[#065F46] text-white' },
];

// Time Wave Slider Steps (Index 0 to 6)
const TIME_STEPS = [
  { time: '6:00 AM', label: '6:00 AM (Sunrise Spot)', icon: '🌅', desc: 'Crisp morning air & quiet roads' },
  { time: '9:30 AM', label: '9:30 AM (Morning Coffee)', icon: '☕', desc: 'Fresh brew & light breakfast' },
  { time: '1:00 PM', label: '1:00 PM (Lunch & Eateries)', icon: '☀️', desc: 'Delicious food & relaxed conversation' },
  { time: '5:30 PM', label: '5:30 PM (Golden Hour Sunset)', icon: '🌇', desc: 'Sunset viewpoint, terrace, or walk' },
  { time: '8:00 PM', label: '8:00 PM (Dinner & Brewery)', icon: '🍸', desc: 'Evening vibes, craft beers, dinner' },
  { time: '10:30 PM', label: '10:30 PM (Night Drive)', icon: '🌙', desc: 'Empty city roads & late night tea' },
  { time: 'Flexible', label: 'Flexible / Decide Together', icon: '⚡', desc: 'Open timing with companions' },
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // 5 Warm Minimalist Reference Steps
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [spotStyle, setSpotStyle] = useState('Cozy Specialty Café');
  const [searchFilter, setSearchFilter] = useState('');
  const [locationName, setLocationName] = useState('');
  
  // Date & Time Wave
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeSliderIdx, setTimeSliderIdx] = useState(3); // Default to 5:30 PM Sunset
  const [customTimeInput, setCustomTimeInput] = useState('');
  
  // Companions & Budget
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number>(500);
  const [budgetMode, setBudgetMode] = useState<'amount' | 'split' | 'free' | 'treat'>('amount');
  
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeTimeObj = TIME_STEPS[timeSliderIdx] || TIME_STEPS[3];
  const resolvedTime = customTimeInput.trim() ? customTimeInput.trim() : activeTimeObj.label;

  const resolvedDestination = locationName.trim()
    ? `${locationName.trim()} (${spotStyle})`
    : spotStyle;

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
        : `Looking forward to meeting up for ${vibe.toLowerCase()} vibes!\n\n⏰ Time: ${resolvedTime} • 💰 Budget: ${resolvedBudgetDisplay}`;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: resolvedDestination,
          start_date: startDate,
          end_date: endDate || startDate,
          vibe,
          transport_type: 'Meet at Venue / Commute',
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

  const filteredSpotTags = SPOT_CLOUD_TAGS.filter((s) => 
    !searchFilter.trim() || s.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

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
        className="bg-[#FAF9F6] border border-[#E8E2D9] rounded-t-[40px] sm:rounded-[40px] max-w-lg w-full h-[94dvh] max-h-[94dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-sheet-up font-sans"
      >
        
        {/* Top Minimal Navigation (Matching Reference Screenshot) */}
        <div className="px-6 pt-6 pb-2 shrink-0 bg-[#FAF9F6]">
          <div className="flex items-center justify-between gap-4 mb-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-[#EFECE6] hover:bg-[#E5E0D8] flex items-center justify-center text-[#382A21] font-extrabold text-lg shadow-sm active:scale-90 transition-transform cursor-pointer"
              >
                ‹
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Smooth Centered Pill Progress Bar */}
            <div className="flex-1 max-w-[140px]">
              <div className="h-1.5 w-full bg-[#E5E0D8] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#79A871] rounded-full transition-all duration-400 ease-out"
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
              className="text-xs font-bold text-[#8C827A] hover:text-[#382A21] py-1 px-2 cursor-pointer transition-colors"
            >
              Skip
            </button>
          </div>
        </div>

        {/* SCREEN 1: What makes you happy? (Tag Cloud with Search & Count) */}
        {step === 1 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pt-1">
                <h2 className="text-[26px] sm:text-[30px] font-black text-[#2E241E] tracking-tight leading-[1.2]">
                  What are you in the mood for?
                </h2>
              </div>

              {/* Subheader: Count + Search */}
              <div className="flex items-center justify-between px-1 text-xs text-[#8C827A] font-bold">
                <span>8 Categories</span>
                <span className="flex items-center gap-1 text-[#382A21]">
                  Tap to select
                </span>
              </div>

              {/* Staggered Organic Bubble Cloud (Exact Reference UI) */}
              <div className="flex flex-wrap gap-2.5 justify-center pt-1">
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
                      className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${
                        isSelected
                          ? `${cat.activeBg} border-transparent shadow-md scale-105`
                          : 'bg-white text-[#382A21] border-[#EDE8E0] hover:border-[#D5CDBD]'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Summary Pill Row */}
              <div className="flex items-center justify-center gap-2 pt-4 text-xs text-[#8C827A] font-medium">
                <span>Selected:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFECE6] text-[#382A21] font-bold text-xs">
                  <span>{vibe}</span>
                  <span className="text-[10px] text-[#8C827A]">✕</span>
                </span>
              </div>
            </div>

            {/* Bottom Large Pill CTA */}
            <div className="pt-4 pb-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full h-14 rounded-full bg-[#382A21] hover:bg-[#2A1F18] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: Spot Style (Tag Cloud + Search Input) */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pt-1">
                <h2 className="text-[26px] sm:text-[30px] font-black text-[#2E241E] tracking-tight leading-[1.2]">
                  What style of spot?
                </h2>
              </div>

              {/* Subheader: Count + Search */}
              <div className="flex items-center justify-between px-1 text-xs text-[#8C827A] font-bold">
                <span>10 Styles</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search 🔍"
                    className="w-24 focus:w-36 text-right bg-transparent border-b border-[#D5CDBD] text-xs text-[#382A21] font-bold focus:outline-none transition-all placeholder-[#8C827A]"
                  />
                </div>
              </div>

              {/* Floating Tag Cloud */}
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {filteredSpotTags.map((spot) => {
                  const isSelected = spotStyle === spot.label;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSpotStyle(spot.label);
                      }}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${
                        isSelected
                          ? '!bg-[#382A21] !text-white !border-[#382A21] shadow-md scale-105'
                          : 'bg-white text-[#382A21] border-[#EDE8E0] hover:border-[#D5CDBD]'
                      }`}
                    >
                      <span className="text-base">{spot.icon}</span>
                      <span>{spot.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Specific Custom Venue Search Input */}
              <div className="p-4 bg-white border border-[#EDE8E0] rounded-[28px] space-y-1.5 shadow-sm mt-2">
                <label className="text-[11px] font-bold text-[#8C827A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#79A871]" />
                  <span>Specific place or neighborhood (Optional)</span>
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Blue Tokai Koramangala, Nandi Hills, Church St..."
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl text-xs text-[#382A21] font-bold placeholder-[#A89F95] focus:outline-none focus:bg-white focus:border-[#382A21]"
                />
              </div>

              {/* Selected Summary Row */}
              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#8C827A] font-medium">
                <span>Selected:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFECE6] text-[#382A21] font-bold text-xs">
                  <span>{spotStyle}</span>
                  <span className="text-[10px] text-[#8C827A]">✕</span>
                </span>
              </div>
            </div>

            {/* Bottom Large Pill CTA */}
            <div className="pt-4 pb-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full h-14 rounded-full bg-[#382A21] hover:bg-[#2A1F18] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: Interactive Wave Slider for Meeting Time (Exact Reference UI) */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pt-1">
                <h2 className="text-[26px] sm:text-[30px] font-black text-[#2E241E] tracking-tight leading-[1.2]">
                  When are you free?
                </h2>
              </div>

              {/* Date Pills */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="py-2.5 px-3 bg-white hover:bg-[#EFECE6] border border-[#EDE8E0] rounded-2xl text-xs font-black text-[#382A21] text-center active:scale-95 shadow-sm"
                >
                  🌇 Today Evening
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="py-2.5 px-3 bg-white hover:bg-[#EFECE6] border border-[#EDE8E0] rounded-2xl text-xs font-black text-[#382A21] text-center active:scale-95 shadow-sm"
                >
                  ⚡ Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('this_weekend')}
                  className="py-2.5 px-3 bg-[#EFF8F1] hover:bg-[#D1ECD6] border border-[#D1ECD6] rounded-2xl text-xs font-black text-[#1D5C2B] text-center active:scale-95 shadow-sm"
                >
                  🎉 This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('next_weekend')}
                  className="py-2.5 px-3 bg-white hover:bg-[#EFECE6] border border-[#EDE8E0] rounded-2xl text-xs font-black text-[#382A21] text-center active:scale-95 shadow-sm"
                >
                  📅 Next Weekend
                </button>
              </div>

              {/* Exact Date Picker */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] mb-0.5 block">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EDE8E0] rounded-xl text-xs text-[#382A21] font-bold focus:outline-none focus:border-[#382A21]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] mb-0.5 block">End Date (Optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EDE8E0] rounded-xl text-xs text-[#382A21] font-bold focus:outline-none focus:border-[#382A21]"
                  />
                </div>
              </div>

              {/* Interactive Wave Slider Container (Look at bottom-left screen of reference image!) */}
              <div className="p-5 bg-white border border-[#EDE8E0] rounded-[32px] shadow-sm space-y-4 relative overflow-hidden">
                {/* SVG Decorative Wave Curve */}
                <div className="relative h-20 w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F07A38" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#F07A38" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 0,70 Q 75,${10 + (timeSliderIdx * 8)} 150,40 T 300,70 L 300,80 L 0,80 Z`}
                      fill="url(#waveGrad)"
                    />
                    <path
                      d={`M 0,70 Q 75,${10 + (timeSliderIdx * 8)} 150,40 T 300,70`}
                      fill="none"
                      stroke="#F07A38"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Vertical Indicator Needle */}
                  <div 
                    className="absolute bottom-4 -translate-x-1/2 w-0.5 h-16 bg-[#382A21]/30 transition-all duration-200"
                    style={{ left: `${(timeSliderIdx / (TIME_STEPS.length - 1)) * 90 + 5}%` }}
                  />
                </div>

                {/* Range Slider Track & Draggable Thumb */}
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={0}
                    max={TIME_STEPS.length - 1}
                    step={1}
                    value={timeSliderIdx}
                    onChange={(e) => {
                      hapticTap();
                      setTimeSliderIdx(Number(e.target.value));
                      setCustomTimeInput('');
                    }}
                    className="w-full h-2 bg-[#EFECE6] rounded-lg appearance-none cursor-pointer accent-[#F07A38]"
                  />
                </div>

                {/* Dynamic Real-time Text (Exact Match to Reference UI) */}
                <div className="text-center pt-1">
                  <div className="text-lg font-black text-[#2E241E] flex items-center justify-center gap-1.5">
                    <span>{activeTimeObj.icon}</span>
                    <span>{activeTimeObj.label}</span>
                  </div>
                  <p className="text-xs text-[#8C827A] font-medium mt-0.5">
                    {activeTimeObj.desc}
                  </p>
                </div>
              </div>

              {/* Free-form Custom Time Input */}
              <div className="relative">
                <Clock className="w-4 h-4 text-[#79A871] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  placeholder="Or shoot custom time (e.g. 6:45 PM, 5:00 AM)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EDE8E0] rounded-xl text-xs text-[#382A21] font-bold placeholder-[#A89F95] focus:outline-none focus:border-[#382A21]"
                />
              </div>
            </div>

            {/* Bottom Large Pill CTA */}
            <div className="pt-4 pb-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full h-14 rounded-full bg-[#382A21] hover:bg-[#2A1F18] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: Companions & Budget */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pt-1">
                <h2 className="text-[26px] sm:text-[30px] font-black text-[#2E241E] tracking-tight leading-[1.2]">
                  Budget & companions
                </h2>
              </div>

              {/* Companion Count */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
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
                            ? '!bg-[#382A21] !text-white !border-[#382A21]'
                            : 'bg-white text-[#382A21] border-[#EDE8E0] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {num} {num === 1 ? 'person' : 'people'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Modes & Stepper */}
              <div className="space-y-3 pt-2 border-t border-[#EDE8E0]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C827A]">
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
                          ? '!bg-[#382A21] !text-white !border-[#382A21]'
                          : 'bg-white text-[#382A21] border border-[#EDE8E0] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Amount Stepper Card */}
                {budgetMode === 'amount' && (
                  <div className="p-4 bg-white border border-[#EDE8E0] rounded-[28px] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setBudgetAmount((p) => Math.max(0, p - 100));
                        }}
                        className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EDE8E0] flex items-center justify-center text-[#382A21] font-bold active:scale-90"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="text-center">
                        <div className="text-3xl font-black text-[#382A21]">
                          ₹{budgetAmount}
                        </div>
                        <span className="text-[10px] text-[#8C827A] font-bold">
                          Estimated per person
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setBudgetAmount((p) => p + 100);
                        }}
                        className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EDE8E0] flex items-center justify-center text-[#382A21] font-bold active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Presets */}
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
                              ? 'bg-[#382A21] text-white border-[#382A21]'
                              : 'bg-[#FAF9F6] text-[#382A21] border-[#EDE8E0]'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Female Only Toggle */}
              {currentUserPersona === 'woman' && (
                <div className="p-3.5 bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-[#9333EA] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#581C87]">Female-Only Plan</div>
                      <div className="text-[10px] text-[#7E22CE]">Only verified women can view and request.</div>
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

            {/* Bottom Large Pill CTA */}
            <div className="pt-4 pb-6">
              <button
                type="button"
                onClick={handleNext}
                className="w-full h-14 rounded-full bg-[#382A21] hover:bg-[#2A1F18] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: Expression Note & Confirmation (Exact Match to Reference UI) */}
        {step === 5 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-2 space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center pt-1">
                <h2 className="text-[26px] sm:text-[30px] font-black text-[#2E241E] tracking-tight leading-[1.2]">
                  Plan Expression
                </h2>
                <p className="text-xs text-[#8C827A] font-medium mt-1">
                  Freely write down anything that's on your mind...
                </p>
              </div>

              {/* Expression Note Card (Look at bottom-right of reference image) */}
              <div className="p-5 bg-white border-2 border-[#EDE8E0] rounded-[32px] shadow-sm space-y-2">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grabbing specialty coffees at Blue Tokai, exploring Church Street art shops, and having relaxed conversation. Easygoing companions welcome!"
                  className="w-full bg-transparent text-sm text-[#382A21] font-medium placeholder-[#A89F95] focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Confirmation Card Preview */}
              <div className="p-4 rounded-[28px] bg-white border border-[#EDE8E0] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#79A871] text-white text-[11px] font-bold shadow-sm">
                    {vibe}
                  </span>
                  <span className="text-xs font-extrabold text-[#79A871]">
                    {spotsTotal} spot{spotsTotal !== 1 ? 's' : ''} left
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#2E241E]">{resolvedDestination}</h4>
                  <p className="text-xs text-[#8C827A] font-bold mt-0.5">
                    {startDate || 'Upcoming Date'} • ⏰ {resolvedTime} • {resolvedBudgetDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Commit Green Button (Exact Match to Reference: "I hereby commit...") */}
            <div className="pt-4 pb-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-full h-14 rounded-full bg-[#79A871] hover:bg-[#689461] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>I hereby publish this plan</span>
                    <Check className="w-5 h-5 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
