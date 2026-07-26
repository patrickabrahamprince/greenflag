'use client';

interface EndedScreenProps {
  reason: string;
  otherName: string;
  onBack: () => void;
}

const COPY: Record<string, string> = {
  rejected: 'She chose not to continue.',
  expired_no_submission: 'This match expired — no response was submitted in time.',
  refunded: "This match expired — she didn't review in time. His coins were refunded.",
};

export function EndedScreen({ reason, otherName, onBack }: EndedScreenProps) {
  const message = COPY[reason] || 'This match has ended.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 screen-gradient text-center">
      <p className="text-2xl font-display text-ink mb-4">{otherName}</p>
      <div className="w-16 h-px bg-ink/20 mb-6" />
      <p className="text-ink/60 text-sm font-light max-w-xs mb-8">{message}</p>
      <button onClick={onBack} className="btn-primary px-8 py-3">
        Back to Discover
      </button>
    </div>
  );
}
