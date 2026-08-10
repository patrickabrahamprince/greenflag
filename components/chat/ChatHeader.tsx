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
    <div className="px-8 pt-4 pb-0 sticky top-0 z-10 bg-base/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 py-4">
        {/* Plain icon tap target, not .btn-ghost -- that class now draws a
            visible Lavender border pill (correct for text CTAs), which
            reads wrong around a bare back arrow. */}
        <button onClick={() => router.push(backRoute)} aria-label="Back" className="p-2 -ml-2 text-ink active:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-well">
            {partnerPhoto ? (
              <img src={partnerPhoto} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
            ) : (
              <span className="text-sm font-display italic text-ink/40">{partnerName?.[0]}</span>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">{partnerName}</h1>
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
