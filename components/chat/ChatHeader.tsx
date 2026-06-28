// /components/chat/ChatHeader.tsx

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ChatUser } from '@/types/chat';

interface ChatHeaderProps {
  otherUser?: ChatUser;
  partnerName?: string;
  partnerPhoto?: string | null;
  backRoute?: string;
  isChatUnlocked?: boolean;
}

export function ChatHeader({
  otherUser,
  partnerName,
  partnerPhoto,
  backRoute,
  isChatUnlocked,
}: ChatHeaderProps) {
  const router = useRouter();

  // Resolve values supporting both old and new signatures
  const name = otherUser ? otherUser.name : partnerName;
  const photo = otherUser ? otherUser.photos?.[0] : partnerPhoto;
  const initial = name?.charAt(0) || '?';
  const resolvedBackRoute = backRoute || null;

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8E6E1] sticky top-0 z-40">
      <button
        onClick={() => {
          if (resolvedBackRoute) {
            router.push(resolvedBackRoute);
          } else {
            router.back();
          }
        }}
        className="p-1.5 -ml-1 text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F0EDE9] flex items-center justify-center border border-[#E8E6E1] flex-shrink-0">
        {photo ? (
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-['Playfair_Display'] italic text-sm text-[#1A1A1A]/50 font-bold">
            {initial}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-['Playfair_Display'] text-sm italic font-bold text-[#1A1A1A] truncate">
          {name || 'Chat Partner'}
        </h2>
        <p className="text-[10px] text-green-600 font-medium">
          {isChatUnlocked ? 'Chat Unlocked' : 'Active Connection'}
        </p>
      </div>
    </header>
  );
}
