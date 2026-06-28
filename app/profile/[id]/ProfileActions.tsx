// /app/profile/[id]/ProfileActions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Loader2, Flag, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLike } from '@/lib/supabase/profile';
import { useWallet } from '@/hooks/useWallet';
import { BuyCoinsModal } from '@/components/chat/BuyCoinsModal';
import { BlockButton } from '@/components/moderation/BlockButton';
import { ReportModal } from '@/components/moderation/ReportModal';
import { unmatchUser } from '@/lib/supabase/moderation';

interface ProfileActionsProps {
  otherUserId: string;
}

export function ProfileActions({ otherUserId }: ProfileActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const [unmatching, setUnmatching] = useState(false);
  const { balance, deductCoins } = useWallet();

  const handleUnmatch = async () => {
    setUnmatching(true);
    const { error } = await unmatchUser(otherUserId);
    setUnmatching(false);
    setShowUnmatchConfirm(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Unmatched');
    router.push('/discover');
  };

  const handleLike = async () => {
    setLoading('like');
    try {
      const res = await createLike(otherUserId, 'like');
      if (res.match && res.conversationId) {
        toast.success("It's a Match! Starting conversation...");
        router.push(`/chat/${res.conversationId}`);
        router.refresh();
      } else {
        toast.success('Sent Like!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send like.');
    } finally {
      setLoading(null);
    }
  };

  const handleSuperLike = async () => {
    if (balance < 5) {
      setShowBuyModal(true);
      return;
    }

    setLoading('super');
    try {
      // Deduct 5 coins before inserting super like
      const success = await deductCoins(5, 'Super Like');
      if (!success) {
        toast.error('Deduction failed. Failed to process Super Like.');
        setLoading(null);
        return;
      }

      const res = await createLike(otherUserId, 'super');
      if (res.match && res.conversationId) {
        toast.success("It's a Match! Starting conversation...");
        router.push(`/chat/${res.conversationId}`);
        router.refresh();
      } else {
        toast.success('Sent Super Like!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send Super Like.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col mt-2">
      <div className="flex gap-4">
        <button
          onClick={handleLike}
          disabled={loading !== null}
          className="flex-1 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading === 'like' ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#C9A961]" />
          ) : (
            <>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Like
            </>
          )}
        </button>

        <button
          onClick={handleSuperLike}
          disabled={loading !== null}
          className="flex-1 py-3 bg-[#FAF9F7] hover:bg-[#F0EDE9] text-[#C9A961] border border-[#C9A961] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading === 'super' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-[#C9A961]" /> Super Like (5c)
            </>
          )}
        </button>
      </div>

      <BuyCoinsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />

      <div className="w-full flex items-center justify-center gap-6 mt-3">
        <BlockButton userId={otherUserId} />
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
        >
          <Flag className="w-4 h-4" />
          Report
        </button>
        <button
          onClick={() => setShowUnmatchConfirm(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#1A1A1A]/50 hover:text-red-500 transition-colors"
        >
          <UserX className="w-4 h-4" />
          Unmatch
        </button>
      </div>

      <ReportModal userId={otherUserId} open={showReport} onClose={() => setShowReport(false)} />

      {showUnmatchConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#FAF9F7] rounded-2xl p-6 max-h-[80vh] overflow-y-auto text-center">
            <h4 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-2">Unmatch?</h4>
            <p className="text-[#1A1A1A]/60 text-sm leading-relaxed mb-6">
              This will permanently delete your match, conversation, and likes. This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUnmatchConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-[#E8E6E1] text-[#1A1A1A] text-xs uppercase tracking-wide font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUnmatch}
                disabled={unmatching}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white text-xs uppercase tracking-wide font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unmatching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unmatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
