'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  IndianRupee, 
  Shield, 
  Sparkles, 
  Navigation, 
  Layers, 
  ChevronRight, 
  X, 
  Plus, 
  Minus,
  Calendar,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { Trip, FlagColor } from '@/types';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
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
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (selectedFilter === 'pink') return t.flag_color === 'pink';
    if (selectedFilter === 'green') return t.flag_color === 'green' || !t.flag_color;
    if (selectedFilter === 'female') return t.female_only;
    if (selectedFilter === 'today') return true;
    if (selectedFilter === 'weekend') return true;
    return true;
  });

  // Pan / Drag handlers (Touch & Mouse)
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    panStart.current = { x: pan.x, y: pan.y };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    // Bound pan range
    const newX = Math.max(-250, Math.min(250, panStart.current.x + dx));
    const newY = Math.max(-200, Math.min(200, panStart.current.y + dy));
    setPan({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    hapticTap();
    setZoom((z) => Math.min(1.6, z + 0.15));
  };

  const handleZoomOut = () => {
    hapticTap();
    setZoom((z) => Math.max(0.85, z - 0.15));
  };

  const handleResetLocation = () => {
    hapticSuccess();
    setPan({ x: 0, y: 0 });
    setZoom(1);
    toast.success('Centered on Bangalore Live Hub');
  };

  return (
    <div className="relative w-full h-[calc(100dvh-170px)] min-h-[520px] rounded-[32px] overflow-hidden border border-stone-200/90 shadow-sm bg-[#E5E9EE] select-none touch-none">
      
      {/* Top Floating Filter Bar */}
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
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold backdrop-blur-xl border transition-all duration-200 shadow-xs active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-md'
                  : 'bg-white/95 text-[#382A21] border-stone-200/80 hover:bg-white'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Draggable Canvas Stage */}
      <div 
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePointerUp}
      >
        {/* Pannable & Zoomable World Map Layer */}
        <div
          className="absolute inset-[-200px] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Vector Map Tiles & Roads */}
          <div
            className="absolute inset-0 bg-[#E8ECE9]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(200, 215, 205, 0.4) 0%, transparent 70%),
                linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            }}
          >
            <svg className="w-full h-full opacity-45 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Ring Road & Major Arteries */}
              <path d="M 0 350 C 350 200, 450 650, 950 450" fill="none" stroke="#CBD5E1" strokeWidth="22" />
              <path d="M 220 0 C 280 320, 350 450, 450 900" fill="none" stroke="#FFFFFF" strokeWidth="14" />
              <path d="M 0 600 C 300 560, 480 480, 850 720" fill="none" stroke="#FFFFFF" strokeWidth="16" />
              <path d="M 500 0 C 450 300, 680 450, 620 900" fill="none" stroke="#E2E8F0" strokeWidth="10" />
              {/* Lakes & Parks */}
              <ellipse cx="400" cy="450" rx="120" ry="90" fill="rgba(186, 230, 253, 0.7)" stroke="#93C5FD" strokeWidth="3" />
              <ellipse cx="680" cy="320" rx="70" ry="50" fill="rgba(209, 250, 229, 0.8)" stroke="#6EE7B7" strokeWidth="2" />
              <ellipse cx="250" cy="620" rx="80" ry="60" fill="rgba(209, 250, 229, 0.8)" stroke="#6EE7B7" strokeWidth="2" />
            </svg>

            {/* Neighborhood Labels */}
            <div className="absolute top-[38%] left-[42%] text-[11px] font-bold text-stone-500 uppercase tracking-widest pointer-events-none">
              Indiranagar
            </div>
            <div className="absolute top-[52%] left-[34%] text-[11px] font-bold text-stone-500 uppercase tracking-widest pointer-events-none">
              Koramangala
            </div>
            <div className="absolute top-[28%] left-[55%] text-[11px] font-bold text-stone-500 uppercase tracking-widest pointer-events-none">
              Whitefield
            </div>
            <div className="absolute top-[62%] left-[48%] text-[11px] font-bold text-stone-500 uppercase tracking-widest pointer-events-none">
              HSR Layout
            </div>
            <div className="absolute top-[22%] left-[32%] text-[11px] font-bold text-stone-500 uppercase tracking-widest pointer-events-none">
              Hebbal / Nandi Hills Route
            </div>
          </div>

          {/* Interactive Event Pins on Map */}
          {filteredTrips.slice(0, 8).map((trip, idx) => {
            const isPink = trip.flag_color === 'pink';
            const isSelected = selectedPin?.id === trip.id;
            
            // Map coordinates relative to the canvas
            const coordinates = [
              { top: '35%', left: '44%', label: 'Indiranagar' },
              { top: '24%', left: '34%', label: 'Nandi Hills' },
              { top: '50%', left: '36%', label: 'Koramangala' },
              { top: '42%', left: '58%', label: 'Whitefield' },
              { top: '60%', left: '46%', label: 'HSR Layout' },
              { top: '30%', left: '52%', label: 'MG Road' },
              { top: '65%', left: '30%', label: 'JP Nagar' },
              { top: '48%', left: '26%', label: 'Jayanagar' },
            ];
            const pos = coordinates[idx % coordinates.length];

            return (
              <div
                key={trip.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 group pointer-events-auto"
                style={{ top: pos.top, left: pos.left }}
                onClick={(e) => {
                  e.stopPropagation();
                  hapticTap();
                  setSelectedPin(trip);
                }}
              >
                {/* Floating Tag over Pin */}
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-md whitespace-nowrap mb-1 flex items-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'scale-110 ring-4 ring-emerald-400 bg-black text-white border-white'
                      : isPink
                      ? 'bg-rose-600 text-white border-rose-400 group-hover:scale-105'
                      : 'bg-[#1D3B2A] text-white border-emerald-400 group-hover:scale-105'
                  }`}
                >
                  <span>{isPink ? '💗 1-on-1 Date' : '🟢 Buddy Trip'}</span>
                  <span className="opacity-60">•</span>
                  <span>₹{trip.budget_per_day || 950}</span>
                </div>

                {/* Animated Pin Avatar */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xl border-2 transition-all ${
                      isSelected ? 'border-emerald-400 scale-110' : 'border-white'
                    } ${
                      isPink 
                        ? 'bg-gradient-to-tr from-rose-500 to-pink-500' 
                        : 'bg-gradient-to-tr from-[#1D3B2A] to-emerald-600'
                    }`}
                  >
                    {isPink ? '💗' : '🟢'}
                  </div>
                  <div className="w-2.5 h-2.5 bg-black rotate-45 -mt-1 shadow-xs" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Floating Control Tools (Zoom, Reset, Center) */}
      <div className="absolute right-3.5 top-20 z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md flex items-center justify-center text-[#382A21] font-bold active:scale-90 transition cursor-pointer"
        >
          <Plus size={18} />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md flex items-center justify-center text-[#382A21] font-bold active:scale-90 transition cursor-pointer"
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={handleResetLocation}
          aria-label="Center on live location"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md flex items-center justify-center text-emerald-800 active:scale-90 transition cursor-pointer"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Interactive Selected Event Overview Sheet */}
      {selectedPin && (
        <div className="absolute bottom-3 inset-x-3 z-30 animate-slide-up pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl border-2 border-stone-200/90 rounded-[28px] p-4 shadow-2xl">
            
            {/* Header / Host & Badge */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  selectedPin.flag_color === 'pink' 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedPin.flag_color === 'pink' ? '💗 1-on-1 Travel Date' : '🟢 Group Road Trip'}
                </span>
                {selectedPin.female_only && (
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                    👩 Women Only
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Event</span>
              </div>
            </div>

            {/* Event Summary Body */}
            <div className="flex items-center justify-between gap-3">
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
                  <h4 className="font-display font-extrabold text-[15px] text-[#382A21] truncate">
                    {selectedPin.destination}
                  </h4>

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mt-0.5">
                    <span className="text-emerald-900 font-bold text-sm">
                      ₹{selectedPin.budget_per_day || 950}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span>Host: {selectedPin.host?.name || 'Explorer'} (4.9★)</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500 mt-1 truncate">
                    <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>Starts in 2h • Indiranagar Meet</span>
                  </div>
                </div>
              </div>

              {/* View & Join Action Button */}
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  onSelectTrip(selectedPin);
                }}
                className="px-4 py-3 bg-[#1D3B2A] hover:bg-[#14281c] text-white rounded-2xl font-bold text-xs shrink-0 active:scale-95 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>View Plan</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
