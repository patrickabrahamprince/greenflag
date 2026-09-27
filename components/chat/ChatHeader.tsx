import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  partnerName: string | undefined;
  partnerPhoto: string | undefined;
  backRoute: string;
  isChatUnlocked: boolean;
  onUnmatch?: () => void;
}

export function ChatHeader({ partnerName, partnerPhoto, backRoute, isChatUnlocked, onUnmatch }: ChatHeaderProps) {
  const router = useRouter();
  return (
    <div className="px-5 py-3 sticky top-0 z-30 bg-base/80 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backRoute)}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-well border border-white/15">
              {partnerPhoto ? (
                <img
                  src={partnerPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }}
                />
              ) : (
                <span className="text-sm font-display font-bold text-white/50">{partnerName?.[0] ?? '?'}</span>
              )}
            </div>
            {isChatUnlocked && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald rounded-full ring-2 ring-base" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="font-display font-bold text-base text-white truncate">{partnerName}</h1>
            {isChatUnlocked && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald tracking-wide">Connected</span>
              </div>
            )}
          </div>
        </div>

        {onUnmatch && (
          <button
            onClick={onUnmatch}
            aria-label="More options"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white active:scale-95 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

