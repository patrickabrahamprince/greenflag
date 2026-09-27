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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-ink">Request to Join Trip</h3>
            <p className="text-xs text-slate-500">{trip.destination} • {trip.vibe}</p>
          </div>
          <button
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-ink/70 hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendRequest} className="p-6 space-y-4">
          
          {/* Host & Trip Snapshot */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-ink truncate">{trip.host?.name}</span>
                {trip.host?.age && (
                  <span className="text-xs text-slate-500 font-medium">• {trip.host.age}</span>
                )}
              </div>
              <p className="text-xs text-emerald-700 font-bold truncate">
                {trip.destination} • {trip.start_date}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {trip.spots_available} spot{trip.spots_available !== 1 ? 's' : ''} left • ₹{trip.budget_per_day}/day
              </p>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900/90 leading-relaxed font-medium">
              <strong>Greenflag Safe Companion Rule:</strong> The host reviews your profile and standards first. Only when the host accepts does chat open.
            </p>
          </div>

          {/* Intro Message Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
              Intro Note to {trip.host?.name || 'Host'}
            </label>
            <textarea
              rows={3}
              value={introNote}
              onChange={(e) => setIntroNote(e.target.value)}
              placeholder="e.g. Hey! I'm free that weekend and love trekking. I have my own helmet and happy to split fuel/homestay equally."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-ink placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 leading-relaxed"
              autoFocus
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full !rounded-xl text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Submit Join Request</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
