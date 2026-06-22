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
    <div className="px-4 pt-4 pb-0">
      <div className="page-header">
        <button onClick={() => router.push(backRoute)} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: '#161616' }}>
            {partnerPhoto ? (
              <img src={partnerPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
            ) : (
              <span className="text-sm font-display italic text-muted">{partnerName?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-base font-display italic text-white">{partnerName}</h1>
            {isChatUnlocked && <span className="text-xs text-gold font-thin">Connected</span>}
          </div>
        </div>
      </div>
      <div className="hairline" />
    </div>
  );
}
