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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121216] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Destination Hero Banner */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <Image
            src={heroImage}
            alt={trip.destination}
            fill
            sizes="600px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/40 to-black/60" />

          {/* Close & Share buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => {
                hapticTap();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-xs text-white/90 hover:text-white font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>
          </div>

          {/* Banner Badges */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[11px] font-bold">
                {trip.vibe}
              </span>
              {trip.female_only && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/80 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Female-Only
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{trip.destination}</h2>
            <p className="text-xs text-white/70">{popularDest?.distance || trip.state || 'Weekend Getaway'}</p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[10px] text-white/50 flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-emerald-400" /> Dates
              </div>
              <div className="text-xs font-bold text-white truncate">{trip.start_date}</div>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[10px] text-white/50 flex items-center gap-1 mb-0.5">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Approx Budget
              </div>
              <div className="text-xs font-bold text-white">₹{trip.budget_per_day}/day</div>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[10px] text-white/50 flex items-center gap-1 mb-0.5">
                <Bike className="w-3 h-3 text-emerald-400" /> Transport
              </div>
              <div className="text-xs font-bold text-white truncate">{trip.transport_type || 'Ride Split'}</div>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[10px] text-white/50 flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-emerald-400" /> Open Spots
              </div>
              <div className="text-xs font-bold text-emerald-400">
                {trip.spots_available} of {trip.spots_total} left
              </div>
            </div>
          </div>

          {/* Host Card */}
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-emerald-500/40 bg-neutral-800 shrink-0">
                {trip.host?.photos?.[0] ? (
                  <Image
                    src={trip.host.photos[0]}
                    alt={trip.host.name || 'Host'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold">
                    {trip.host?.name?.charAt(0) || 'H'}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{trip.host?.name}</span>
                  {trip.host?.age && <span className="text-xs text-white/50">• {trip.host.age}</span>}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Greenflag Verified Host
                </div>
                <div className="text-[10px] text-white/50">{trip.host?.city || 'Bangalore'}</div>
              </div>
            </div>

            {isHost && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-white/10 text-white rounded-full">
                You are Host
              </span>
            )}
          </div>

          {/* Itinerary / Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Trip Plan & Notes
            </h4>
            <p className="text-xs text-white/85 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5 whitespace-pre-line">
              {trip.description}
            </p>
          </div>

          {/* Safety rules */}
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
            <h4 className="text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Greenflag Travel Safety
            </h4>
            <ul className="text-[11px] text-emerald-200/80 space-y-1">
              <li>• Host approval required before chat unlocks (no unsolicited spam).</li>
              <li>• Recommend verified homestays & hostels for overnight stops.</li>
              <li>• Mutual confirmation keeps both travelers safe and accountable.</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 border-t border-white/10 bg-[#16161c]">
          {isHost ? (
            <button
              onClick={() => {
                hapticTap();
                onManageClick(trip);
              }}
              className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Manage Requests ({trip.requests_count || 0})</span>
            </button>
          ) : trip.user_request_status === 'pending' ? (
            <div className="w-full py-3 px-4 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl text-center">
              Request Sent • Waiting for Host Review
            </div>
          ) : trip.user_request_status === 'accepted' ? (
            <div className="w-full py-3 px-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Request Accepted • Chat Unlocked</span>
            </div>
          ) : trip.spots_available === 0 ? (
            <div className="w-full py-3 px-4 bg-white/5 text-white/40 font-semibold text-xs rounded-xl text-center">
              Trip is Fully Booked
            </div>
          ) : (
            <button
              onClick={() => {
                hapticTap();
                onRequestClick(trip);
              }}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all"
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
