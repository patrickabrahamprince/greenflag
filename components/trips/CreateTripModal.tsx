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
  Bike, 
  DollarSign, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Coffee,
  Compass,
  Car,
  Sunset,
  Mountain
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
  { label: 'Chill', icon: '☕', name: 'Café & Chill', desc: 'Coffee, work, casual evening hangout' },
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

const QUICK_LOCATIONS = [
  'Indiranagar (Café / Hangout)',
  'Koramangala (Food & Social)',
  'Church Street (Coffee & Walk)',
  'Nandi Hills (Sunrise Drive)',
  'Bannerghatta (Day Out)',
  'Coorg (Weekend Stay)',
  'Gokarna (Beach Trek)',
  'Goa (Weekend Escape)',
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  // Step state: 1 to 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [destination, setDestination] = useState('Indiranagar (Café / Hangout)');
  const [customDestination, setCustomDestination] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
    if (!resolvedDestination) {
      toast.error('Please choose or enter a destination.');
      hapticWarning();
      return;
    }
    hapticTap();
    setStep(2);
  };

  const goToStep3 = () => {
    if (!startDate) {
      toast.error('Please select when you want to meet or travel.');
      hapticWarning();
      return;
    }
    if (!endDate) {
      setEndDate(startDate);
    }
    hapticTap();
    setStep(3);
  };

  const goToStep4 = () => {
    if (!description.trim()) {
      toast.error('Please write a quick 1-2 sentence description.');
      hapticWarning();
      return;
    }
    hapticTap();
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
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
          description: description.trim(),
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

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          hapticTap();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[88dvh] max-h-[88dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl"
      >
        
        {/* Header with Clickable Step Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setStep((s) => (s - 1) as 1 | 2 | 3);
                  }}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Step {step} of 4
                </span>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {step === 1 && 'Where & What Vibe'}
                  {step === 2 && 'When & Companions'}
                  {step === 3 && 'Details & Budget'}
                  {step === 4 && 'Preview & Post'}
                </h2>
              </div>
            </div>
            <button
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Clickable Step Progress Tabs */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, label: '1. Vibe' },
              { num: 2, label: '2. Date' },
              { num: 3, label: '3. Details' },
              { num: 4, label: '4. Post' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  hapticTap();
                  setStep(s.num as 1 | 2 | 3 | 4);
                }}
                className="flex flex-col gap-1 text-left cursor-pointer group py-1"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.num <= step ? 'bg-emerald-600' : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                />
                <span className={`text-[10px] font-bold transition-colors ${s.num === step ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: Destination & Vibe */}
        {step === 1 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-5">
            {/* Vibe Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 block">
                1. What are you planning?
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {cat.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                2. Pick Location / Area
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_LOCATIONS.map((loc) => {
                  const isSelected = destination === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setDestination(loc);
                        setCustomDestination('');
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setDestination('custom');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    destination === 'custom'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  + Custom Spot
                </button>
              </div>

              {destination === 'custom' && (
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  placeholder="Enter café, neighborhood, or city name..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 shadow-sm"
                  autoFocus
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Date & Spots */}
        {step === 2 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-5">
            {/* Quick Date Presets */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                When are you free?
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                >
                  🌅 Today Evening
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                >
                  ⚡ Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('this_weekend')}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 text-center"
                >
                  🎉 This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('next_weekend')}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                >
                  📅 Next Weekend
                </button>
              </div>

              {/* Exact Dates */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 mb-1 block">Start / Meet Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 mb-1 block">End Date (Optional)</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Spots / Companions */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                How many people are you looking for?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSpotsTotal(num);
                    }}
                    className={`flex-1 py-3 rounded-2xl border text-center font-bold text-sm transition-all ${
                      spotsTotal === num
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {num} {num === 1 ? 'person' : 'people'}
                  </button>
                ))}
              </div>
            </div>

            {/* Female Only Toggle */}
            {currentUserPersona === 'woman' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-purple-950">Female-Only Plan</div>
                    <div className="text-[10px] text-purple-700">Only verified women can see and request to join.</div>
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

        {/* STEP 3: Details & Budget */}
        {step === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-5">
            {/* Format / Transport Mode */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                Mode / Format
              </label>
              <div className="space-y-2">
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
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                            {t.label}
                          </div>
                          <div className="text-[10px] text-slate-500">{t.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                Approx Budget (per person)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[0, 500, 1500, 3000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setBudgetPerDay(amt);
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      budgetPerDay === amt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {amt === 0 ? 'Free' : `₹${amt}`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={budgetPerDay}
                onChange={(e) => setBudgetPerDay(Number(e.target.value))}
                placeholder="Custom amount (₹)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                Plan Summary & Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grabbing coffee at Blue Tokai, then checking out the art gallery. Looking for 1-2 easygoing companions."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 leading-relaxed shadow-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Publish */}
        {step === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-4">
            <div className="text-center mb-2">
              <span className="inline-block p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">Ready to publish!</h3>
              <p className="text-xs text-slate-500">Here is how your plan will look on the feed:</p>
            </div>

            {/* Card Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {vibe}
                </span>
                {femaleOnly && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> Female-Only
                  </span>
                )}
                <span className="text-xs font-extrabold text-emerald-700">
                  {spotsTotal} spot{spotsTotal !== 1 ? 's' : ''} left
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">{resolvedDestination}</h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {startDate} • {transportType} • ₹{budgetPerDay}
                </p>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-medium">
              🔒 <strong>Safe Approval Flow</strong>: When travelers apply, you review their profiles and approve before chat unlocks.
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="p-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50 shrink-0">
          {step === 1 && (
            <button
              type="button"
              onClick={goToStep2}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to Dates & Spots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={goToStep3}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={goToStep4}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <span>Review Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="btn-primary w-full !rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Post Plan (Free & Live Now)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
