'use client';

import { X } from 'lucide-react';

interface ReportModalProps {
  open: boolean;
  reason: string;
  details: string;
  submitting: boolean;
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onSubmit: () => void;
}

export function ReportModal({
  open,
  reason,
  details,
  submitting,
  onClose,
  onReasonChange,
  onDetailsChange,
  onSubmit,
}: ReportModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/80 flex items-center justify-center z-[100] p-6">
      {/* Native keyboard resize is disabled app-wide (capacitor.config.ts),
          so the viewport never shrinks when the keyboard opens -- without
          this, the textarea + Submit button on a smaller device could end
          up positioned behind the keyboard with no way to scroll to them.
          Matches the --kb-inset handling already used in SubmitSheet.tsx. */}
      <div
        className="dialog-card max-w-md w-full max-h-[85dvh] overflow-y-auto"
        style={{ marginBottom: 'var(--kb-inset, 0px)', transition: 'margin-bottom 200ms ease-out' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink">Report User</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-5 h-5 text-ink/50" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink/50 mb-2">Reason</label>
            <div className="space-y-2">
              {['Fake profile', 'Inappropriate content', 'Harassment', 'Other'].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-3 rounded-lg border border-raised cursor-pointer transition-colors hover:border-gold/40"
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      reason === r ? 'border-gold' : 'border-ink/30'
                    }`}
                  >
                    {reason === r && <span className="w-2 h-2 rounded-full bg-gold" />}
                  </span>
                  <span className="text-sm text-ink">{r}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => onReasonChange(r)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-2">Details (optional)</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Add any additional context..."
              value={details}
              onChange={(e) => onDetailsChange(e.target.value)}
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={!reason || submitting}
            className="btn-primary w-full active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
