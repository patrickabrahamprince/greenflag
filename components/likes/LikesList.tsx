// /components/likes/LikesList.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Coins, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getLikesReceived } from '@/lib/supabase/profile';
import { useWallet } from '@/hooks/useWallet';
import { LikeCard } from './LikeCard';
import { BuyCoinsModal } from '@/components/chat/BuyCoinsModal';
import type { Like } from '@/types/profile';

export function LikesList() {
  const [likes, setLikes] = useState<Like[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const supabase = createClientComponentClient();

  const { balance, refreshBalance } = useWallet();

  const fetchLikes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLikesReceived();
      setLikes(data);

      // Check if user already unlocked them previously (e.g. check local storage or if we want persistent session unlocks)
      const unlockedSession = sessionStorage.getItem('likes_unlocked') === 'true';
      if (unlockedSession) {
        setIsUnlocked(true);
      }
    } catch (err: any) {
      console.error('Error fetching likes:', err);
      toast.error('Failed to load likes list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const handleRevealAll = async () => {
    if (balance < 10) {
      setShowBuyModal(true);
      return;
    }

    setRevealing(true);
    try {
      const { data: success, error } = await supabase.rpc('reveal_likes');
      if (error) throw error;

      if (success === true) {
        toast.success('All likes revealed!');
        setIsUnlocked(true);
        sessionStorage.setItem('likes_unlocked', 'true');
        await refreshBalance();
        await fetchLikes();
      } else {
        setShowBuyModal(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to deduct coins and reveal likes.');
    } finally {
      setRevealing(false);
    }
  };

  const handleSingleUnlockSuccess = async () => {
    setIsUnlocked(true);
    sessionStorage.setItem('likes_unlocked', 'true');
    await refreshBalance();
    await fetchLikes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6">
      {/* Unlock Header Banner */}
      {!isUnlocked && likes.length > 0 && (
        <div className="mb-6 p-6 bg-white border border-[#E8E6E1] text-center rounded-xl shadow-sm flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center text-[#C9A961] mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-['Playfair_Display'] text-base italic font-bold text-[#1A1A1A] mb-1">
            See Who Liked You
          </h3>
          <p className="text-xs text-[#1A1A1A]/50 max-w-sm leading-relaxed mb-4">
            There are {likes.length} people interested in matching with you. Unlock the entire list to view profiles instantly.
          </p>

          <button
            onClick={handleRevealAll}
            disabled={revealing}
            className="px-6 py-2.5 bg-[#C9A961] hover:bg-[#B89851] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            {revealing ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <>
                <Coins className="w-4 h-4" /> Reveal for 10 coins
              </>
            )}
          </button>
        </div>
      )}

      {/* Grid List */}
      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0EDE9] flex items-center justify-center text-[#1A1A1A]/20 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-['Playfair_Display'] text-lg italic font-bold text-[#1A1A1A] mb-1">
            No Likes Yet
          </h3>
          <p className="text-xs text-[#1A1A1A]/40 max-w-xs leading-relaxed font-thin">
            Complete your profile, upload photos, and start swiping in the discover tab to get noticed!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {likes.map((like) => (
            <LikeCard
              key={like.id}
              like={like}
              blurred={!isUnlocked}
              onUnlockSuccess={handleSingleUnlockSuccess}
            />
          ))}
        </div>
      )}

      <BuyCoinsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  );
}
