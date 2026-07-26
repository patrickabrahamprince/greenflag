const SUGGESTED_OPENERS = [
  'Hey! Loved your standards',
  'That was such a fun challenge!',
  "Can't believe we matched, hi!",
];

interface EmptyChatProps {
  partnerName: string;
  onSend: (msg: string) => void;
}

export function EmptyChat({ partnerName, onSend }: EmptyChatProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[#C026D3]/10 border border-[#C026D3]/20">
        <span className="font-display text-3xl text-[#C026D3]">GF</span>
      </div>
      <h3 className="font-display text-2xl text-ink mb-1">You&apos;re connected!</h3>
      <p className="text-sm text-ink/50 text-center mb-6">
        Say hello to {partnerName}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED_OPENERS.map((opener) => (
          <button
            key={opener}
            onClick={() => onSend(opener)}
            className="btn-secondary text-xs px-4 py-2"
          >
            {opener}
          </button>
        ))}
      </div>
    </div>
  );
}
