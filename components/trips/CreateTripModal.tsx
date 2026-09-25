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
  { label: 'Roadtrip', icon: '🚗' },
  { label: 'Trek', icon: '🥾' },
  { label: 'Beach', icon: '🏖️' },
  { label: 'Foodie', icon: '☕' },
  { label: 'Camping', icon: '⛺' },
  { label: 'Backpacking', icon: '🎒' },
  { label: 'Chill', icon: '🌅' },
  { label: 'Adventure', icon: '🧗' },
  { label: 'Festival', icon: '🎸' },
  { label: 'Heritage', icon: '🏛️' },
  { label: 'Workcation', icon: '💻' },
  { label: 'Daytrip', icon: '🗺️' },
];

const TRANSPORT_OPTIONS = [
  'Self-Drive Car / SUV Split',
  'Bike / Royal Enfield Ride',
  'Carpool / Cab Share',
  'Overnight Train / Bus Buddy',
  'Flight & Rental Split',
  'Public Transit / Walk & Explore',
];

export function CreateTripModal({
  isOpen,
  onClose,
  onTripCreated,
  currentUserPersona = 'woman',
}: CreateTripModalProps) {
  const [destination, setDestination] = useState('Coorg');
  const [customDestination, setCustomDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState<TripVibe>('Trek');
  const [transportType, setTransportType] = useState(TRANSPORT_OPTIONS[0]);
  const [budgetPerDay, setBudgetPerDay] = useState(1500);
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
      toast.error('Please specify a destination.');
      hapticWarning();
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please pick trip departure & return dates.');
      hapticWarning();
      return;
    }
    if (!description.trim()) {
      toast.error('Please write a quick 1-2 sentence trip plan.');
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
        throw new Error(data.error || 'Failed to create trip');
      }

      hapticSuccess();
      toast.success('Trip posted! It is now live on the Trips Feed & Discover card.');
      onTripCreated(data.trip);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating trip';
      toast.error(msg);
      hapticWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121216] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create a Trip</h2>
              <p className="text-xs text-white/50">30 seconds • Meet companions for your next plan</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          
          {/* Step 1: Destination */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Destination
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => {
                const isSelected = destination === dest.name;
                return (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => handleSelectPopularDest(dest.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-black font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {dest.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setDestination('custom');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  destination === 'custom'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                }`}
              >
                + Custom City
              </button>
            </div>

            {destination === 'custom' && (
              <input
                type="text"
                value={customDestination}
                onChange={(e) => setCustomDestination(e.target.value)}
                placeholder="Enter destination (e.g. Spiti Valley, Munnar, Varkala)"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
              />
            )}
          </div>

          {/* Step 2: Dates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Travel Dates
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickWeekend(0)}
                  className="text-[11px] font-medium text-white/70 hover:text-emerald-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 transition-colors"
                >
                  This Weekend
                </button>
                <button
                  type="button"
                  onClick={() => setQuickWeekend(1)}
                  className="text-[11px] font-medium text-white/70 hover:text-emerald-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 transition-colors"
                >
                  Next Weekend
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-white/50 mb-1 block">Departure</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-white/50 mb-1 block">Return</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Vibe Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 block">
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
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-semibold'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
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
              <label className="text-[11px] font-semibold text-white/80 mb-1 flex items-center gap-1">
                <Bike className="w-3 h-3 text-emerald-400" /> Ride / Split
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full px-2.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {TRANSPORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-neutral-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/80 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Approx Budget
              </label>
              <select
                value={budgetPerDay}
                onChange={(e) => setBudgetPerDay(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1000} className="bg-neutral-900">₹1,000 / day (Budget)</option>
                <option value={1500} className="bg-neutral-900">₹1,500 / day (Balanced)</option>
                <option value={2500} className="bg-neutral-900">₹2,500 / day (Comfort)</option>
                <option value={4000} className="bg-neutral-900">₹4,000+ / day (Luxury)</option>
              </select>
            </div>
          </div>

          {/* Step 5: Spots & Female Only toggle */}
          <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-medium text-white">Companions Needed</div>
                <div className="text-[10px] text-white/50">Total spots you want to fill</div>
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
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Female Only Safety Toggle */}
          {currentUserPersona === 'woman' && (
            <div className="flex items-center justify-between p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Female-Only Trip</div>
                  <div className="text-[10px] text-white/60 leading-snug">
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
                className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
              />
            </div>
          )}

          {/* Step 6: Trip Note / Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 block">
              Trip Plan & What You Are Looking For
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Riding my Meteor 350 to Coorg. Looking for 1 person to split fuel and homestay. Non-smoker, early morning start from Indiranagar."
              className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-bold text-sm rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Trip...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Post Trip (Free & Live Instantly)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-white/40 mt-2">
              No uninvited DMs. You review all requests before chat opens.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
