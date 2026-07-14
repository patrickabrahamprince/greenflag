import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  partnerName: string | undefined;
  partnerPhoto: string | undefined;
  backRoute: string;
  isChatUnlocked: boolean;
}

export function ChatHeader({ partnerName, partnerPhoto, backRoute, isChatUnlocked }: ChatHeaderProps) {
  const router = useRouter();
  return (
    <div className="px-8 pt-4 pb-0 sticky top-0 z-10 bg-[#000000]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.push(backRoute)} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-[#1C1C1E]">
            {partnerPhoto ? (
              <img src={partnerPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
            ) : (
              <span className="text-sm font-['Sora'] italic text-ink/40">{partnerName?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="font-['Sora'] text-2xl text-ink">{partnerName}</h1>
            {isChatUnlocked && (
              <span className="text-xs uppercase tracking-widest text-ink/40">Connected</span>
            )}
          </div>
        </div>
      </div>
      <div className="hairline" />
    </div>
  );
}
