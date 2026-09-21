'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Send, ShieldCheck, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { Trip } from '@/types';
import { hapticTap, hapticSuccess, hapticWarning } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface JoinTripModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: (tripId: string) => void;
}

export function JoinTripModal({
  trip,
  isOpen,
  onClose,
  onRequestSubmitted,
}: JoinTripModalProps) {
  const [introNote, setIntroNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !trip) return null;

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introNote.trim()) {
      toast.error('Please write a short intro note for the host.');
      hapticWarning();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intro_note: introNote.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit join request');
      }

      hapticSuccess();
      toast.success(`Request sent to ${trip.host?.name || 'host'}! They will review your standards.`);
      onRequestSubmitted(trip.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending request';
      toast.error(msg);
      hapticWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121216] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161c]">
          <div>
            <h3 className="text-base font-bold text-white">Request to Join Trip</h3>
            <p className="text-xs text-white/50">{trip.destination} • {trip.vibe}</p>
          </div>
          <button
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendRequest} className="p-6 space-y-4">
          
          {/* Host & Trip Snapshot */}
          <div className="flex items-center gap-3.5 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate">{trip.host?.name}</span>
                {trip.host?.age && (
                  <span className="text-xs text-white/50">• {trip.host.age}</span>
                )}
              </div>
              <p className="text-xs text-emerald-400 truncate">
                {trip.destination} • {trip.start_date}
              </p>
              <p className="text-[11px] text-white/50">
                {trip.spots_available} spot{trip.spots_available !== 1 ? 's' : ''} left • ₹{trip.budget_per_day}/day
              </p>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-950/25 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              <strong>Greenflag Safe Companion Rule:</strong> The host reviews your profile and standards first. Only when the host accepts does chat open.
            </p>
          </div>

          {/* Intro Message Note */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5 block">
              Intro Note to {trip.host?.name || 'Host'}
            </label>
            <textarea
              rows={3}
              value={introNote}
              onChange={(e) => setIntroNote(e.target.value)}
              placeholder="e.g. Hey! I'm free that weekend and love trekking. I have my own helmet and happy to split fuel/homestay equally."
              className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 leading-relaxed"
              autoFocus
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-black font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Join Request</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
