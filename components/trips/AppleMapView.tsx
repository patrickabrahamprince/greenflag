'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, IndianRupee, Shield, Sparkles, Navigation, Layers, ChevronRight, X } from 'lucide-react';
import { Trip, FlagColor } from '@/types';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface AppleMapViewProps {
  trips: Trip[];
  selectedFilter: string;
  onSelectTrip: (trip: Trip) => void;
  onFilterChange: (filterId: string) => void;
}

const MAP_FILTERS = [
  { id: 'all', label: 'All Pins', icon: '📍' },
  { id: 'today', label: 'Today', icon: '⚡' },
  { id: 'weekend', label: 'Weekend', icon: '📅' },
  { id: 'pink', label: '💗 Travel Dates', icon: '💗' },
  { id: 'green', label: '🟢 Travel Buddies', icon: '🟢' },
  { id: 'female', label: '👩 Women-Only', icon: '🛡️' },
];

export function AppleMapView({
  trips,
  selectedFilter,
  onSelectTrip,
  onFilterChange,
}: AppleMapViewProps) {
  const [selectedPin, setSelectedPin] = useState<Trip | null>(trips[0] || null);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (selectedFilter === 'pink') return t.flag_color === 'pink';
    if (selectedFilter === 'green') return t.flag_color === 'green' || !t.flag_color;
    if (selectedFilter === 'female') return t.female_only;
    if (selectedFilter === 'today') return true;
    if (selectedFilter === 'weekend') return true;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100dvh-180px)] min-h-[500px] rounded-[32px] overflow-hidden border border-stone-200/90 shadow-sm bg-[#E5E9EE]">
      {/* Top Floating Filter Bar (MapKit Style) */}
      <div className="absolute top-4 inset-x-3 z-30 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {MAP_FILTERS.map((f) => {
          const isActive = selectedFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                hapticTap();
                onFilterChange(f.id);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold backdrop-blur-xl border transition-all duration-200 shadow-xs active:scale-95 ${
                isActive
                  ? 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-md'
                  : 'bg-white/90 text-[#382A21] border-stone-200/80 hover:bg-white'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Apple-Style Vector Canvas */}
      <div className="relative w-full h-full">
        {/* Apple MapKit styled background vector tiles representation */}
        <div
          className="absolute inset-0 bg-[#E8ECE9] transition-all"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(200, 215, 205, 0.4) 0%, transparent 70%),
              linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          }}
        >
          {/* Stylized Map Roads / Geography SVG */}
          <svg className="w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 250 C 150 200, 200 450, 600 350" fill="none" stroke="#CBD5E1" strokeWidth="18" />
            <path d="M120 -50 C 180 220, 250 300, 300 700" fill="none" stroke="#FFFFFF" strokeWidth="10" />
            <path d="M-50 480 C 200 460, 320 380, 550 520" fill="none" stroke="#FFFFFF" strokeWidth="14" />
            <path d="M350 -50 C 320 200, 480 350, 420 700" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <ellipse cx="280" cy="340" rx="90" ry="70" fill="rgba(186, 230, 253, 0.6)" stroke="#93C5FD" strokeWidth="2" />
          </svg>
        </div>

        {/* MapKit Clustered Pins */}
        {filteredTrips.slice(0, 7).map((trip, idx) => {
          const isPink = trip.flag_color === 'pink';
          const isSelected = selectedPin?.id === trip.id;
          // Deterministic sample coordinates on canvas
          const offsets = [
            { top: '24%', left: '32%' },
            { top: '38%', left: '68%' },
            { top: '52%', left: '26%' },
            { top: '44%', left: '48%' },
            { top: '65%', left: '62%' },
            { top: '30%', left: '80%' },
            { top: '58%', left: '15%' },
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <div
              key={trip.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 group"
              style={{ top: pos.top, left: pos.left }}
              onClick={() => {
                hapticTap();
                setSelectedPin(trip);
              }}
            >
              {/* Countdown Tag Badge */}
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md whitespace-nowrap mb-1 flex items-center gap-1 border transition-transform ${
                  isSelected ? 'scale-110 ring-2 ring-emerald-500' : 'group-hover:scale-105'
                } ${
                  isPink
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-[#1D3B2A] text-white border-emerald-400'
                }`}
              >
                <span>{isPink ? '💗 1-on-1 Date' : '🟢 Buddy Trip'}</span>
                <span className="opacity-75">•</span>
                <span>₹{trip.budget_per_day || 1200}</span>
              </div>

              {/* Pin Head */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white transition-all ${
                    isPink ? 'bg-gradient-to-tr from-rose-500 to-pink-500' : 'bg-gradient-to-tr from-[#1D3B2A] to-emerald-600'
                  }`}
                >
                  {isPink ? '💗' : '🟢'}
                </div>
                <div className="w-2 h-2 bg-stone-800 rotate-45 -mt-1 shadow-xs" />
              </div>
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute right-3 bottom-44 z-30 flex flex-col gap-2">
          <button
            onClick={() => {
              hapticTap();
              toast.success('Centered on your location (Bangalore)');
            }}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md flex items-center justify-center text-[#382A21] active:scale-90"
          >
            <Navigation size={18} className="text-emerald-700" />
          </button>
        </div>

        {/* Selected Trip Floating Mini Card (Apple Style) */}
        {selectedPin && (
          <div className="absolute bottom-4 inset-x-3 z-30 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-xl border-2 border-stone-200/90 rounded-[28px] p-4 shadow-xl flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                onClick={() => onSelectTrip(selectedPin)}
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 shadow-xs">
                  <img
                    src={selectedPin.host?.photos?.[0] || '/figma/destination_card_3.png'}
                    alt={selectedPin.destination}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 text-xs">
                    {selectedPin.flag_color === 'pink' ? '💗' : '🟢'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {selectedPin.ladder_level === 1 ? 'Level 1: Micro Date' : 'Weekend Trip'}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      • Starts in 2h
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-base text-[#382A21] truncate mt-0.5">
                    {selectedPin.destination}
                  </h4>

                  <div className="flex items-center gap-3 text-xs font-semibold text-stone-600 mt-0.5">
                    <span className="text-emerald-800 font-bold">
                      ₹{selectedPin.budget_per_day || 1200}/pax
                    </span>
                    <span>•</span>
                    <span>Host: {selectedPin.host?.name || 'Explorer'} (4.9★)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTrip(selectedPin)}
                className="px-4 py-3 bg-[#1D3B2A] text-white rounded-2xl font-bold text-xs shrink-0 active:scale-95 transition-transform flex items-center gap-1 shadow-md"
              >
                View Plan
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
