'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Sparkles, Shield, Users, Bike, DollarSign, Loader2 } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
import { TripVibe, Trip } from '@/types';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (trip: Trip) => void;
  currentUserPersona?: string;
}

const VIBE_OPTIONS: { label: TripVibe; icon: string }[] = [
  { label: 'Chill', icon: '☕' },
  { label: 'Foodie', icon: '🍕' },
  { label: 'Daytrip', icon: '🗺️' },
  { label: 'Roadtrip', icon: '🚗' },
  { label: 'Trek', icon: '🥾' },
  { label: 'Beach', icon: '🏖️' },
  { label: 'Camping', icon: '⛺' },
  { label: 'Festival', icon: '🎸' },
  { label: 'Adventure', icon: '🧗' },
  { label: 'Heritage', icon: '🏛️' },
  { label: 'Workcation', icon: '💻' },
  { label: 'Backpacking', icon: '🎒' },
];

const TRANSPORT_OPTIONS = [
  'Meet at Venue / Café',
  'Self-Drive Car / Carpool Split',
  'Bike / Royal Enfield Ride',
  'Cab / Auto Share',
  'Overnight Train / Bus Buddy',
  'Flight & Stay Split',
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  const [destination, setDestination] = useState('Indiranagar (Café / Hangout)');
  const [customDestination, setCustomDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState<TripVibe>('Chill');
  const [transportType, setTransportType] = useState(TRANSPORT_OPTIONS[0]);
  const [budgetPerDay, setBudgetPerDay] = useState(500);
  const [spotsTotal, setSpotsTotal] = useState(1);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Set quick weekend dates
  const setQuickWeekend = (offsetWeeks: number = 0) => {
    hapticTap();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 + (offsetWeeks * 7);
    const sat = new Date(today);
    sat.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);

    setStartDate(sat.toISOString().split('T')[0]);
    setEndDate(sun.toISOString().split('T')[0]);
  };

  const handleSelectPopularDest = (destName: string) => {
    hapticTap();
    setDestination(destName);
    setCustomDestination('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDestination = destination === 'custom' ? customDestination.trim() : destination;

    if (!finalDestination) {
      toast.error('Please specify a destination or hangout spot.');
      hapticWarning();
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please pick dates for your plan.');
      hapticWarning();
      return;
    }
    if (!description.trim()) {
      toast.error('Please write a quick 1-2 sentence plan.');
      hapticWarning();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: finalDestination,
          start_date: startDate,
          end_date: endDate,
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
        throw new Error(data.error || 'Failed to create plan');
      }

      hapticSuccess();
      toast.success('Plan posted! Live on the feed instantly.');
      onTripCreated(data.trip);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating plan';
      toast.error(msg);
      hapticWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  const QUICK_SPOTS = [
    'Indiranagar (Café / Hangout)',
    'Koramangala (Food / Social)',
    'Nandi Hills (Sunrise Drive)',
    'Bannerghatta (Day Out)',
    'Coorg (Weekend Stay)',
    'Goa (Beach Trip)',
    'Gokarna (Trek)',
  ];

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
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[90dvh] max-h-[90dvh] flex flex-col min-h-0 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Post a Plan or Hangout</h2>
              <p className="text-xs text-slate-500">30 seconds • Evening café, day trip, drive or getaway</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form 
          onSubmit={handleSubmit} 
          className="overflow-y-auto overscroll-contain touch-pan-y px-6 py-5 space-y-5 flex-1 min-h-0 pb-16"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Step 1: Destination */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Where or What Plan?
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {QUICK_SPOTS.map((destName) => {
                const isSelected = destination === destName;
                return (
                  <button
                    key={destName}
                    type="button"
                    onClick={() => handleSelectPopularDest(destName)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {destName}
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                + Custom Location / Plan
              </button>
            </div>

            {destination === 'custom' && (
              <input
                type="text"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                placeholder="Enter spot (e.g. Third Wave Coffee, Nandi Hills, Pondicherry)..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                autoFocus
              />
            )}
          </div>

          {/* Step 2: Dates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Travel Dates
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickWeekend(0)}
                  className="text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 transition-colors"
                >
                  This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickWeekend(1)}
                  className="text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 transition-colors"
                >
                  Next Weekend
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 mb-1 block font-medium">Departure</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 mb-1 block font-medium">Return</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Vibe Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 block">
              Trip Vibe
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VIBE_OPTIONS.map((opt) => {
                const isSelected = vibe === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setVibe(opt.label);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Transport & Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Bike className="w-3 h-3 text-emerald-600" /> Ride / Split
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                {TRANSPORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-white text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Approx Budget
              </label>
              <select
                value={budgetPerDay}
                onChange={(e) => setBudgetPerDay(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value={1000} className="bg-white text-ink">₹1,000 / day (Budget)</option>
                <option value={1500} className="bg-white text-ink">₹1,500 / day (Balanced)</option>
                <option value={2500} className="bg-white text-ink">₹2,500 / day (Comfort)</option>
                <option value={4000} className="bg-white text-ink">₹4,000+ / day (Luxury)</option>
              </select>
            </div>
          </div>

          {/* Step 5: Spots & Female Only toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-xs font-semibold text-ink">Companions Needed</div>
                <div className="text-[10px] text-slate-500">Total spots you want to fill</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSpotsTotal(num);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    spotsTotal === num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Female Only Safety Toggle */}
          {currentUserPersona === 'woman' && (
            <div className="flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-purple-900">Female-Only Trip</div>
                  <div className="text-[10px] text-purple-700 leading-snug">
                    Only verified women can see this trip and request to join.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={femaleOnly}
                onChange={(e) => {
                  hapticTap();
                  setFemaleOnly(e.target.checked);
                }}
                className="w-4 h-4 accent-purple-600 cursor-pointer rounded"
              />
            </div>
          )}

          {/* Step 6: Trip Note / Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5 block">
              Trip Plan & What You Are Looking For
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Riding my Meteor 350 to Coorg. Looking for 1 person to split fuel and homestay. Non-smoker, early morning start from Indiranagar."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full !rounded-xl text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing Trip...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Post Trip (Free & Live Instantly)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              No uninvited DMs. You review all requests before chat opens.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
