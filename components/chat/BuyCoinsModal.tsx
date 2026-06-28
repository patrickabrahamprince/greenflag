// /components/chat/BuyCoinsModal.tsx

import { useRouter } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';

interface BuyCoinsModalProps {
  open: boolean;
  onClose: () => void;
}

export function BuyCoinsModal({ open, onClose }: BuyCoinsModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm p-6 bg-[#FAF9F7] border border-[#E8E6E1] text-[#1A1A1A] text-center shadow-xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-[#C9A961]/10 border border-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C9A961]">
          <Sparkles className="w-6 h-6" />
        </div>

        <h3 className="font-['Playfair_Display'] text-xl italic font-bold mb-2">
          Insufficient Coins
        </h3>
        
        <p className="text-xs text-[#1A1A1A]/60 leading-relaxed mb-6">
          Sending messages and voice notes requires coins. Get a coin pack to unlock conversation tools and keep chatting.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              router.push('/coins');
            }}
            className="w-full py-3 bg-[#C9A961] text-white font-medium uppercase text-xs tracking-wider transition-transform active:scale-[0.98]"
          >
            Buy Coins
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A] font-medium text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
