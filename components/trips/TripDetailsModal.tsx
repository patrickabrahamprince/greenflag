'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MapPin, Calendar, Users, Bike, DollarSign, Shield, Share2, MessageSquare, Check, Sparkles } from 'lucide-react';
import { Trip } from '@/types';
import { POPULAR_DESTINATIONS } from '@/lib/trips-data';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface TripDetailsModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestClick: (trip: Trip) => void;
  onManageClick: (trip: Trip) => void;
  currentUserId?: string;
}

export function TripDetailsModal({
  trip,
  isOpen,
  onClose,
  onRequestClick,
  onManageClick,
  currentUserId,
}: TripDetailsModalProps) {
  if (!isOpen || !trip) return null;

  const isHost = currentUserId && trip.host_id === currentUserId;
  const popularDest = POPULAR_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === trip.destination.toLowerCase()
  );
  const heroImage = popularDest?.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

  const handleShare = () => {
    hapticTap();
    if (navigator.share) {
      navigator.share({
        title: `${trip.destination} Trip on Greenflag`,
        text: `Heading to ${trip.destination} for ${trip.vibe} (${trip.start_date}). ${trip.spots_available} spot left — join me on Greenflag!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Heading to ${trip.destination} (${trip.start_date})! Check out our trip plan on Greenflag: ${window.location.href}`
      );
      toast.success('Trip link copied to clipboard!');
      hapticSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Destination Hero Banner */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <Image
            src={heroImage}
            alt={trip.destination}
            fill
            sizes="600px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />

          {/* Close & Share buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs text-white font-semibold active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>
          </div>

          {/* Banner Badges */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                {trip.vibe}
              </span>
              {trip.female_only && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Female-Only
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">{trip.destination}</h2>
            <p className="text-xs text-white/90 font-medium">{popularDest?.distance || trip.state || 'Weekend Getaway'}</p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Dates
              </div>
              <div className="text-xs font-bold text-ink truncate">{trip.start_date}</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Budget
              </div>
              <div className="text-xs font-bold text-ink">₹{trip.budget_per_day}/day</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                <Bike className="w-3 h-3 text-emerald-600" /> Transport
              </div>
              <div className="text-xs font-bold text-ink truncate">{trip.transport_type || 'Ride Split'}</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-emerald-600" /> Open Spots
              </div>
              <div className="text-xs font-extrabold text-emerald-700">
                {trip.spots_available} of {trip.spots_total} left
              </div>
            </div>
          </div>

          {/* Host Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-slate-200 shrink-0">
                {trip.host?.photos?.[0] ? (
                  <Image
                    src={trip.host.photos[0]}
                    alt={trip.host.name || 'Host'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-700 font-bold">
                    {trip.host?.name?.charAt(0) || 'H'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-ink">{trip.host?.name}</span>
                  {trip.host?.age && <span className="text-xs text-slate-500 font-medium">• {trip.host.age}</span>}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Greenflag Verified Host
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{trip.host?.city || 'Bangalore'}</div>
              </div>
            </div>

            {isHost && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                You are Host
              </span>
            )}
          </div>

          {/* Itinerary / Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Trip Plan & Notes
            </h4>
            <p className="text-xs text-ink/80 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
              {trip.description}
            </p>
          </div>

          {/* Safety rules */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <h4 className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Greenflag Travel Safety
            </h4>
            <ul className="text-[11px] text-emerald-900/80 space-y-1 font-medium">
              <li>• Host approval required before chat unlocks (no unsolicited spam).</li>
              <li>• Recommend verified homestays & hostels for overnight stops.</li>
              <li>• Mutual confirmation keeps both travelers safe and accountable.</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          {isHost ? (
            <button
              onClick={() => {
                hapticTap();
                onManageClick(trip);
              }}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Manage Requests ({trip.requests_count || 0})</span>
            </button>
          ) : trip.user_request_status === 'pending' ? (
            <div className="w-full py-3.5 px-4 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl text-center">
              Request Sent • Waiting for Host Review
            </div>
          ) : trip.user_request_status === 'accepted' ? (
            <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Request Accepted • Chat Unlocked</span>
            </div>
          ) : trip.spots_available === 0 ? (
            <div className="w-full py-3.5 px-4 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl text-center">
              Trip is Fully Booked
            </div>
          ) : (
            <button
              onClick={() => {
                hapticTap();
                onRequestClick(trip);
              }}
              className="btn-primary w-full !rounded-xl text-sm"
            >
              <Users className="w-4 h-4" />
              <span>Request to Join Trip ({trip.spots_available} spot left)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
