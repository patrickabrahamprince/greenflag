'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Check, Ban, MessageSquare, Loader2, UserCheck } from 'lucide-react';
import { Trip, TripRequest } from '@/types';
import { hapticDecision, hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface ManageRequestsModalProps {
  trip: Trip | null;
  requests: TripRequest[];
  isOpen: boolean;
  onClose: () => void;
  onRequestStatusUpdated: (requestId: string, status: 'accepted' | 'declined') => void;
}

export function ManageRequestsModal({
  trip,
  requests,
  isOpen,
  onClose,
  onRequestStatusUpdated,
}: ManageRequestsModalProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen || !trip) return null;

  const handleAction = async (requestId: string, status: 'accepted' | 'declined') => {
    hapticDecision();
    setUpdatingId(requestId);

    try {
      const res = await fetch(`/api/trips/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      toast.success(status === 'accepted' ? 'Request accepted! Chat is now unlocked.' : 'Request declined.');
      onRequestStatusUpdated(requestId, status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating request';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121216] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161c]">
          <div>
            <h3 className="text-base font-bold text-white">Manage Join Requests</h3>
            <p className="text-xs text-white/50">{trip.destination} • {trip.spots_available} spots remaining</p>
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

        {/* Requests List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {requests.length === 0 ? (
            <div className="text-center py-10">
              <UserCheck className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-white/70">No join requests yet</p>
              <p className="text-xs text-white/40 mt-1">
                Your trip is live on the Trips feed. When travelers apply, their requests appear here.
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const isUpdating = updatingId === req.id;
              return (
                <div
                  key={req.id}
                  className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-neutral-800 shrink-0">
                        {req.applicant?.photos?.[0] ? (
                          <Image
                            src={req.applicant.photos[0]}
                            alt={req.applicant.name || 'Applicant'}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-400 font-bold text-xs">
                            {req.applicant?.name?.charAt(0) || 'A'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{req.applicant?.name}</span>
                          {req.applicant?.age && (
                            <span className="text-[11px] text-white/50">• {req.applicant.age}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50">{req.applicant?.city || 'Bangalore'}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        req.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'declined'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {req.intro_note && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/80 leading-relaxed italic">
                      &quot;{req.intro_note}&quot;
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAction(req.id, 'accepted')}
                        disabled={isUpdating}
                        className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Open Chat</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'declined')}
                        disabled={isUpdating}
                        className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
