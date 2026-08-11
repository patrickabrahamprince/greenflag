'use client';

import { Loader2 } from 'lucide-react';

interface EndedScreenProps {
  reason: string;
  otherName: string;
  onBack: () => void;
  rejectionReason?: string | null;
  canRetry?: boolean;
  retryPending?: boolean;
  retryCost?: number;
  retrying?: boolean;
  onRetry?: () => void;
}

const COPY: Record<string, string> = {
  rejected: 'She chose not to continue.',
  expired_no_submission: 'This match expired — no response was submitted in time.',
  refunded: "This match expired — she didn't review in time. His coins were refunded.",
};

export function EndedScreen({
  reason,
  otherName,
  onBack,
  rejectionReason,
  canRetry,
  retryPending,
  retryCost,
  retrying,
  onRetry,
}: EndedScreenProps) {
  const message = COPY[reason] || 'This match has ended.';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 screen-gradient text-center">
      <p className="text-2xl font-display text-ink mb-4">{otherName}</p>
      <div className="w-16 h-px bg-ink/20 mb-6" />
      <p className="text-ink/60 text-sm font-light max-w-xs mb-4">{message}</p>

      {reason === 'rejected' && rejectionReason && (
        <div className="w-full max-w-xs rounded-2xl border border-raised bg-raised/20 p-4 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1.5">Why</p>
          <p className="text-sm text-ink/80 leading-relaxed">{rejectionReason}</p>
        </div>
      )}

      {reason === 'rejected' && canRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="btn-primary px-8 py-3 mb-3 flex items-center justify-center gap-2"
        >
          {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : `Try Again${retryCost ? ` — ${retryCost} coins` : ''}`}
        </button>
      )}

      {reason === 'rejected' && !canRetry && retryPending && (
        <p className="text-xs text-gold/80 mb-6 max-w-xs">
          She&apos;s deciding whether to give you another chance. Check back soon.
        </p>
      )}

      {reason === 'rejected' && !canRetry && !retryPending && (
        <p className="text-xs text-ink/40 mb-6 max-w-xs">
          If she&apos;s open to it, you&apos;ll hear back within 24 hours.
        </p>
      )}

      <button onClick={onBack} className={reason === 'rejected' && canRetry ? 'btn-secondary px-8 py-3' : 'btn-primary px-8 py-3'}>
        Back to Discover
      </button>
    </div>
  );
}
