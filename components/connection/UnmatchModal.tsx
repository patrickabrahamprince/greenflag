'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UnmatchModalProps {
  matchId: string;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UnmatchModal({ matchId, partnerName, isOpen, onClose }: UnmatchModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnmatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to unmatch');
      toast.success('Unmatched');
      onClose();
      router.push('/messages');
    } catch (err) {
      toast.error('Failed to unmatch');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Unmatch {partnerName}?</h2>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-ink/60">
          You'll no longer see their messages. They'll know you've unmatched.
        </p>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-raised/50 text-ink font-semibold active:scale-95 transition-transform disabled:opacity-50"
          >
            Keep Matched
          </button>
          <button
            onClick={handleUnmatch}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Unmatch'}
          </button>
        </div>
      </div>
    </div>
  );
}
