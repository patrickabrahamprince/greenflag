import { Sparkles, MessageCircleHeart } from 'lucide-react';

const SUGGESTED_OPENERS = [
  'I loved your vibe!',
  'Where is your next trip to?',
  "Great to connect with you, hi!",
];

interface EmptyChatProps {
  partnerName: string;
  onSend: (msg: string) => void;
}

export function EmptyChat({ partnerName, onSend }: EmptyChatProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br from-emerald/20 via-emerald/10 to-transparent border border-emerald/30 shadow-glow-emerald">
          <MessageCircleHeart className="w-9 h-9 text-emerald" />
        </div>
        <Sparkles className="w-4 h-4 text-gold absolute -top-1 -right-1 animate-bounce" />
      </div>

      <h3 className="font-display font-bold text-2xl text-white mb-1 tracking-tight">You&apos;re Connected</h3>
      <p className="text-sm text-white/50 max-w-xs mb-8">
        Start the conversation with <span className="text-white font-medium">{partnerName}</span>
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald/80 mb-1">Suggested Openers</p>
        {SUGGESTED_OPENERS.map((opener) => (
          <button
            key={opener}
            onClick={() => onSend(opener)}
            className="btn-secondary text-xs px-4 py-3 text-left w-full justify-start hover:border-emerald/40 hover:text-emerald transition-all"
          >
            <span>💬</span>
            <span className="truncate">{opener}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

