'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { blockUser, unblockUser } from '@/lib/supabase/moderation';

interface BlockButtonProps {
  userId: string;
  initiallyBlocked?: boolean;
}

export function BlockButton({ userId, initiallyBlocked = false }: BlockButtonProps) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnblock = async () => {
    setLoading(true);
    const { error } = await unblockUser(userId);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setBlocked(false);
    toast.success('User unblocked');
    router.refresh();
  };

  const handleConfirmBlock = async () => {
    setLoading(true);
    const { error } = await blockUser(userId);
    setLoading(false);
    setShowConfirm(false);
    if (error) {
      toast.error(error);
      return;
    }
    setBlocked(true);
    toast.success('User blocked');
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => (blocked ? handleUnblock() : setShowConfirm(true))}
        disabled={loading}
        className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#1A1A1A]/50 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
        {blocked ? 'Unblock' : 'Block'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#FAF9F7] rounded-2xl p-6 max-h-[80vh] overflow-y-auto text-center">
            <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-2">Block this user?</h4>
            <p className="text-[#1A1A1A]/60 text-sm leading-relaxed mb-6">
              They will be removed from discover, chat, and matches for both of you. You can unblock them later.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-[#E8E6E1] text-[#1A1A1A] text-xs uppercase tracking-wide font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white text-xs uppercase tracking-wide font-medium disabled:opacity-50"
              >
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
