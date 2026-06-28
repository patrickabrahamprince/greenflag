// /components/discover/ProfileCard.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLike } from '@/lib/supabase/profile';
import { useWallet } from '@/hooks/useWallet';
import { BuyCoinsModal } from '@/components/chat/BuyCoinsModal';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number | null;
    city_auto?: string | null;
    city?: string | null;
    bio: string | null;
    photos: string[];
    interests?: string[];
    interests_have?: string[];
  };
  onSwipe: () => void;
}

export function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const { balance, deductCoins } = useWallet();

  const photo = profile.photos?.[0] || '/placeholder-avatar.svg';

  const handleLike = async () => {
    setLoading('like');
    try {
      const res = await createLike(profile.id, 'like');
      if (res.match && res.conversationId) {
        toast.success("It's a Match! Starting conversation...");
        router.push(`/chat/${res.conversationId}`);
        router.refresh();
      } else {
        toast.success(`Liked ${profile.name}!`);
        onSwipe();
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
      const success = await deductCoins(5, `Super Like for ${profile.name}`);
      if (!success) {
        toast.error('Deduction failed. Failed to process Super Like.');
        setLoading(null);
        return;
      }

      const res = await createLike(profile.id, 'super');
      if (res.match && res.conversationId) {
        toast.success("It's a Match! Starting conversation...");
        router.push(`/chat/${res.conversationId}`);
        router.refresh();
      } else {
        toast.success(`Super Liked ${profile.name}!`);
        onSwipe();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send Super Like.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col snap-start snap-always bg-[#FAF9F7]">
      {/* Photo cover */}
      <div className="relative w-full aspect-[3/4] flex-shrink-0 bg-[#F0EDE9] overflow-hidden">
        <img src={photo} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F7] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Info & action buttons */}
      <div className="flex-1 flex flex-col px-8 pt-2 pb-10">
        <h1 className="font-['Playfair_Display'] text-4xl text-[#1A1A1A] font-semibold">
          {profile.name}
        </h1>
        <p className="font-['Inter'] text-sm text-[#1A1A1A]/60 tracking-wide uppercase mt-1">
          {profile.age ? `${profile.age}` : ''}
          {(profile.age && (profile.city_auto || profile.city)) ? ' · ' : ''}
          {profile.city_auto || profile.city}
        </p>

        {profile.bio && (
          <p className="text-[#1A1A1A]/80 text-sm leading-relaxed max-w-md mt-3 line-clamp-3">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {(profile.interests_have ?? profile.interests ?? []).slice(0, 4).map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 border border-[#E8E6E1] text-[#1A1A1A]/70 text-[10px] uppercase tracking-wide font-medium bg-white"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-auto pt-6">
          <button
            onClick={onSwipe}
            aria-label="Pass"
            className="size-14 rounded-full bg-[#F0EDE9] border border-[#E8E6E1] flex items-center justify-center active:scale-95 transition-all text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handleLike}
            disabled={loading !== null}
            className="flex-1 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 font-bold uppercase text-[10px] tracking-wider"
          >
            {loading === 'like' ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
            ) : (
              <>
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Like
              </>
            )}
          </button>

          <button
            onClick={handleSuperLike}
            disabled={loading !== null}
            className="size-14 rounded-full bg-[#FAF9F7] border border-[#C9A961] flex items-center justify-center active:scale-95 transition-all text-[#C9A961]"
            aria-label="Super Like"
          >
            {loading === 'super' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 fill-[#C9A961]" />
            )}
          </button>
        </div>
      </div>

      <BuyCoinsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  );
}
