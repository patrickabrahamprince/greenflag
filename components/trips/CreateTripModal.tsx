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
  Coffee
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

interface VibeChoice {
  label: TripVibe;
  icon: string;
  name: string;
  desc: string;
}

const VIBE_CATEGORIES: VibeChoice[] = [
  { label: 'Chill', icon: '☕', name: 'Café & Chill', desc: 'Coffee, work, casual conversation' },
  { label: 'Foodie', icon: '🍕', name: 'Food & Drinks', desc: 'Dinner, brewery, street food crawl' },
  { label: 'Daytrip', icon: '🌅', name: 'Day Trip / Drive', desc: 'Sunrise spot, viewpoint, picnic' },
  { label: 'Trek', icon: '🥾', name: 'Trek & Nature', desc: 'Hiking, hill climb, nature walk' },
  { label: 'Roadtrip', icon: '🚗', name: 'Weekend Roadtrip', desc: 'Getaway, ride split, homestay' },
  { label: 'Beach', icon: '🏖️', name: 'Beach & Coastal', desc: 'Sea, beach shacks, sunset' },
  { label: 'Festival', icon: '🎸', name: 'Concert & Events', desc: 'Music fest, standup, show' },
  { label: 'Workcation', icon: '💻', name: 'Workcation', desc: 'Remote work with scenic views' },
];

const TRANSPORT_CHOICES = [
  { label: 'Meet at Venue / Café', icon: '📍', desc: 'Meet directly at spot' },
  { label: 'Self-Drive Car / Carpool', icon: '🚗', desc: 'Split fuel & tolls' },
  { label: 'Bike / Two-Wheeler', icon: '🏍️', desc: 'Ride companion' },
  { label: 'Cab / Auto Share', icon: '🚕', desc: 'Split Uber/Ola fare' },
  { label: 'Train / Bus Buddy', icon: '🚆', desc: 'Overnight journey' },
];

const POPULAR_SPOTS = [
  { name: 'Indiranagar', tag: 'Café & Social', icon: '☕' },
  { name: 'Koramangala', tag: 'Food & Nightlife', icon: '🍕' },
  { name: 'Church Street', tag: 'Walk & Coffee', icon: '🎨' },
  { name: 'HSR Layout', tag: 'Eateries & Work', icon: '💻' },
  { name: 'Nandi Hills', tag: 'Sunrise Drive', icon: '🌅' },
  { name: 'Bannerghatta', tag: 'Day Outing', icon: '🌿' },
  { name: 'Coorg', tag: 'Weekend Getaway', icon: '⛰️' },
  { name: 'Gokarna', tag: 'Beach & Trek', icon: '🏖️' },
  { name: 'Goa', tag: 'Coastal Escape', icon: '🌴' },
  { name: 'Pondicherry', tag: 'Heritage Walk', icon: '🥐' },
];

const TIME_SLOTS = [
  { id: 'evening', label: 'Evening', time: '5:00 PM - 9:00 PM', icon: '🌇' },
  { id: 'morning', label: 'Morning / Sunrise', time: '6:00 AM - 10:30 AM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon / Lunch', time: '12:00 PM - 3:30 PM', icon: '☀️' },
  { id: 'night', label: 'Night Out', time: '9:00 PM - Late', icon: '🌙' },
  { id: 'flexible', label: 'Flexible / Anytime', time: 'Coordinate with companion', icon: '⚡' },
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // 5 Distinct Steps: 1. Vibe -> 2. Spot -> 3. Dates & Time -> 4. Format & Budget -> 5. Post
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form Fields
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [destination, setDestination] = useState('Indiranagar');
  const [customDestination, setCustomDestination] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [meetTime, setMeetTime] = useState('Evening (5:00 PM - 9:00 PM)');
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);

  const [transportType, setTransportType] = useState(TRANSPORT_CHOICES[0].label);
  const [budgetPerDay, setBudgetPerDay] = useState(500);
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resolvedDestination = destination === 'custom' ? customDestination.trim() : destination;

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

  // Step Nav Validations
  const goToStep2 = () => {
    hapticTap();
    setStep(2);
  };

  const goToStep3 = () => {
    if (!resolvedDestination) {
      toast.error('Please choose or enter a location.');
      hapticWarning();
      return;
    }
    hapticTap();
    setStep(3);
  };

  const goToStep4 = () => {
    if (!startDate) {
      toast.error('Please select when you want to meet.');
      hapticWarning();
      return;
    }
    if (!endDate) {
      setEndDate(startDate);
    }
    hapticTap();
    setStep(4);
  };

  const goToStep5 = () => {
    if (!description.trim()) {
      toast.error('Please write a quick 1-2 sentence description.');
      hapticWarning();
      return;
    }
    hapticTap();
    setStep(5);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedDescription = `${description.trim()}\n\n⏰ Meet Time: ${meetTime}`;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: resolvedDestination,
          start_date: startDate,
          end_date: endDate || startDate,
          vibe,
          transport_type: transportType,
          budget_per_day: budgetPerDay,
          spots_available: spotsTotal,
          spots_total: spotsTotal,
          female_only: femaleOnly,
          description: formattedDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish plan');
      }

      hapticSuccess();
      toast.success('Plan published! Live on the feed now.');
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

  const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'What is the Vibe?', subtitle: 'Choose what you want to do' },
    2: { title: 'Pick Spot / Area', subtitle: 'Where do you want to meet?' },
    3: { title: 'Date, Time & Size', subtitle: 'When & group size' },
    4: { title: 'Format & Budget', subtitle: 'Commute & spend' },
    5: { title: 'Review & Publish', subtitle: 'Live plan preview' },
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          hapticTap();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[92dvh] max-h-[92dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-sheet-up"
      >
        
        {/* Top Header with High Contrast Step Indicator */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
                  }}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 active:scale-90 transition-transform cursor-pointer touch-manipulation shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Step {step} of 5
                </span>
                <h2 className="text-base font-black text-slate-950 leading-tight mt-0.5">
                  {STEP_TITLES[step].title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 active:scale-90 flex items-center justify-center text-slate-900 transition-all cursor-pointer touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5 High Contrast Clickable Step Tabs */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[
              { num: 1, label: '1. Vibe' },
              { num: 2, label: '2. Spot' },
              { num: 3, label: '3. Time' },
              { num: 4, label: '4. Format' },
              { num: 5, label: '5. Post' },
            ].map((s) => {
              const isActive = s.num === step;
              const isPast = s.num < step;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setStep(s.num as 1 | 2 | 3 | 4 | 5);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-center cursor-pointer select-none touch-manipulation transition-all active:scale-95 ${
                    isActive
                      ? '!bg-slate-950 !text-white font-black shadow-md border border-slate-950'
                      : isPast
                      ? '!bg-emerald-100 !text-emerald-900 font-bold border border-emerald-300'
                      : '!bg-slate-200 !text-slate-700 font-semibold'
                  }`}
                >
                  <div className="text-[10px] leading-tight truncate">
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Activity & Vibe */}
        {step === 1 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                1. What do you want to do?
              </span>
              <span className="text-[11px] text-emerald-800 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Tap to choose
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none touch-manipulation active:scale-95 relative flex flex-col justify-between min-h-[108px] ${
                      isSelected
                        ? '!border-emerald-600 !bg-emerald-50 ring-2 ring-emerald-500 shadow-md transform-gpu -translate-y-0.5'
                        : '!border-slate-200 !bg-white hover:!bg-slate-50 text-slate-900 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full !bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div>
                      <div className="text-xs font-black text-slate-950">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-600 line-clamp-1 mt-0.5 font-semibold">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Spot & Location */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                2. Popular Hotspots & Neighborhoods
              </span>
              <span className="text-[11px] text-emerald-800 font-extrabold">Select spot</span>
            </div>

            {/* Grid of Visual Location Cards with Rock-Solid Contrast */}
            <div className="grid grid-cols-2 gap-2.5">
              {POPULAR_SPOTS.map((spot) => {
                const isSelected = destination === spot.name;
                return (
                  <button
                    key={spot.name}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setDestination(spot.name);
                      setCustomDestination('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer select-none touch-manipulation active:scale-95 relative flex items-center gap-3 ${
                      isSelected
                        ? '!border-slate-950 !bg-slate-950 !text-white shadow-md ring-2 ring-slate-900'
                        : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 text-slate-900 shadow-sm'
                    }`}
                  >
                    <span className="text-xl shrink-0">{spot.icon}</span>
                    <div className="min-w-0">
                      <div className={`text-xs font-black truncate ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                        {spot.name}
                      </div>
                      <div className={`text-[10px] font-bold truncate ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>
                        {spot.tag}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Location Input */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 mb-1.5 block">
                Or enter any custom café / neighborhood:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => {
                    setCustomDestination(e.target.value);
                    setDestination('custom');
                  }}
                  onFocus={() => setDestination('custom')}
                  placeholder="e.g. Third Wave Coffee Sadashivnagar, Cubbon Park..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dates, Time & Group Size */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 animate-fade-in">
            {/* Quick Date Presets */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. When are you free?
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95 transition-transform"
                >
                  🌇 Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95 transition-transform"
                >
                  ⚡ Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('this_weekend')}
                  className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl text-xs font-black text-emerald-950 text-center active:scale-95 transition-transform"
                >
                  🎉 This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('next_weekend')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black text-slate-900 text-center active:scale-95 transition-transform"
                >
                  📅 Next Weekend
                </button>
              </div>

              {/* Exact Dates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 mb-1 block">Start / Meet Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 mb-1 block">End Date (Optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Meeting Time Selector (NEW!) */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block flex items-center justify-between">
                <span>2. Preferred Time of Day</span>
                <span className="text-[10px] text-emerald-800 font-bold">Tap to pick</span>
              </label>
              
              <div className="space-y-1.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = meetTime.startsWith(slot.label);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setMeetTime(`${slot.label} (${slot.time})`);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer active:scale-98 ${
                        isSelected
                          ? '!border-slate-950 !bg-slate-950 !text-white shadow-sm'
                          : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{slot.icon}</span>
                        <div>
                          <div className={`text-xs font-black ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                            {slot.label}
                          </div>
                          <div className={`text-[10px] font-semibold ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>
                            {slot.time}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spots / Companions */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                3. How many companions are you looking for?
              </label>
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
                      className={`flex-1 py-3 rounded-2xl border text-center text-xs transition-all cursor-pointer active:scale-95 ${
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

            {/* Female Only Toggle */}
            {currentUserPersona === 'woman' && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-purple-950">Female-Only Plan</div>
                    <div className="text-[10px] text-purple-700 font-semibold">Only verified women can view and request to join.</div>
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

        {/* STEP 4: Format & Budget */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 animate-fade-in">
            {/* Format / Transport Mode */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                1. Meeting / Commute Format
              </label>
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
                          : '!border-slate-200 !bg-slate-50 hover:!bg-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.icon}</span>
                        <div>
                          <div className={`text-xs font-black ${isSelected ? '!text-white' : '!text-slate-950'}`}>
                            {t.label}
                          </div>
                          <div className={`text-[10px] font-semibold ${isSelected ? '!text-slate-300' : '!text-slate-500'}`}>{t.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 block">
                2. Estimated Spend (per person)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[0, 500, 1500, 3000].map((amt) => {
                  const isSelected = budgetPerDay === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setBudgetPerDay(amt);
                      }}
                      className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? '!bg-slate-950 !text-white !border-slate-950 shadow-sm'
                          : '!bg-slate-100 !text-slate-900 !border-slate-200 hover:!bg-slate-200'
                      }`}
                    >
                      {amt === 0 ? 'Free' : `₹${amt}`}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                value={budgetPerDay}
                onChange={(e) => setBudgetPerDay(Number(e.target.value))}
                placeholder="Custom amount (₹)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5 block">
                3. Short Plan Note
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grabbing cold brews at Blue Tokai, then exploring Church Street art shops. Easygoing vibes!"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 leading-relaxed shadow-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Live Review & Instant Publish */}
        {step === 5 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4 animate-fade-in">
            <div className="text-center mb-1">
              <span className="inline-block p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2 shadow-sm animate-icon-bounce">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="text-base font-black text-slate-950">Ready to go live!</h3>
              <p className="text-xs text-slate-600 font-medium">Here is your plan card as it will appear on the feed:</p>
            </div>

            {/* Card Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full !bg-emerald-600 text-white text-[10px] font-black shadow-sm">
                  {vibe}
                </span>
                {femaleOnly && (
                  <span className="px-2 py-0.5 rounded-full !bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> Female-Only
                  </span>
                )}
                <span className="text-xs font-black text-emerald-800">
                  {spotsTotal} spot{spotsTotal !== 1 ? 's' : ''} left
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-950">{resolvedDestination}</h4>
                <p className="text-xs text-slate-700 font-bold mt-0.5">
                  {startDate || 'Upcoming'} • ⏰ {meetTime} • {transportType} • ₹{budgetPerDay}/person
                </p>
              </div>

              <p className="text-xs text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-semibold">
                {description}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 font-semibold">
              🔒 <strong>Safe Approval Flow</strong>: When companions request to join, you review their profiles and accept before chat unlocks.
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="p-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50 shrink-0">
          {step === 1 && (
            <button
              type="button"
              onClick={goToStep2}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer touch-manipulation shadow-md"
            >
              <span>Next: Pick Location & Spot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={goToStep3}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer touch-manipulation shadow-md"
            >
              <span>Next: Date, Time & Companions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={goToStep4}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer touch-manipulation shadow-md"
            >
              <span>Next: Format & Budget</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={goToStep5}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer touch-manipulation shadow-md"
            >
              <span>Next: Review Plan Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer touch-manipulation shadow-lg"
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
