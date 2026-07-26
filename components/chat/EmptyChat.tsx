const SUGGESTED_OPENERS = [
  'I loved your Standard',
  'That was a wonderful challenge',
  "Can't believe we're here, hi!",
];

interface EmptyChatProps {
  partnerName: string;
  onSend: (msg: string) => void;
}

export function EmptyChat({ partnerName, onSend }: EmptyChatProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gold/10 border border-gold/20">
        <span className="font-display text-3xl text-gold">GF</span>
      </div>
      <h3 className="font-display text-2xl text-ink mb-1">You&apos;re Connected</h3>
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
