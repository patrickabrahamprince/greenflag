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
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <span className="text-3xl font-display italic text-gold">GF</span>
      </div>
      <h3 className="text-lg font-display italic text-white mb-1">You&apos;re connected!</h3>
      <p className="text-sm text-muted text-center mb-6 font-thin">
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
