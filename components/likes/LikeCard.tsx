// /components/likes/LikeCard.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Coins, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BuyCoinsModal } from '@/components/chat/BuyCoinsModal';
import type { Like } from '@/types/profile';

interface LikeCardProps {
  like: Like;
  blurred: boolean;
  onUnlockSuccess: () => void;
}

export function LikeCard({ like, blurred, onUnlockSuccess }: LikeCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const supabase = createClientComponentClient();

  const handleCardClick = async () => {
    if (!blurred) {
      router.push(`/profile/${like.from_user_id}`);
      return;
    }

    // Blurred state: trigger reveal_likes RPC
    setLoading(true);
    try {
      const { data: success, error } = await supabase.rpc('reveal_likes');
      if (error) throw error;

      if (success === true) {
        toast.success('Likes revealed!');
        onUnlockSuccess();
      } else {
        // Failed due to insufficient coins, trigger BuyCoinsModal
        setShowBuyModal(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to reveal likes');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div
      onClick={handleCardClick}
      className="relative w-full aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-md border border-[#E8E6E1] cursor-pointer group flex flex-col justify-end"
    >
      {/* Background Photo */}
      <div className={`absolute inset-0 transition-transform duration-300 group-hover:scale-105 ${blurred ? 'blur-md select-none pointer-events-none' : ''}`}>
        {like.photo_url ? (
          <img src={like.photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#F0EDE9] flex items-center justify-center">
            <span className="font-['Playfair_Display'] italic text-xs text-[#1A1A1A]/30">No Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>

      {/* Blur Unlock Overlay */}
      {blurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/30 text-white text-center">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
          ) : (
            <>
              <Lock className="w-6 h-6 text-[#C9A961] mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A961] mb-1">
                Locked Like
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Coins className="w-3.5 h-3.5 text-[#C9A961]" />
                <span className="text-[9px] font-mono font-bold">10 coins to reveal</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info footer */}
      <div className="relative p-4 text-white z-10">
        <h4 className="font-['Playfair_Display'] text-sm italic font-bold">
          {blurred ? 'Someone' : like.name}, {blurred ? '??' : like.age}
        </h4>
        <p className="text-[9px] text-white/60 mt-0.5">
          Liked you {formatDistanceToNow(new Date(like.created_at), { addSuffix: true })}
        </p>
      </div>

      <BuyCoinsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  );

  return blurred ? cardContent : <Link href={`/profile/${like.from_user_id}`}>{cardContent}</Link>;
}
