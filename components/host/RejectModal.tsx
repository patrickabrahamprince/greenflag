interface RejectReason {
  value: string;
  label: string;
}

interface RejectModalProps {
  rejectReason: string;
  rejectNote: string;
  processing: boolean;
  onReasonChange: (reason: string) => void;
  onNoteChange: (note: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const REJECT_REASONS: RejectReason[] = [
  { value: 'incomplete', label: 'Incomplete responses' },
  { value: 'low_effort', label: 'Low effort' },
  { value: 'mismatch', label: 'Values mismatch' },
  { value: 'other', label: 'Other' },
];

export function RejectModal({
  rejectReason,
  rejectNote,
  processing,
  onReasonChange,
  onNoteChange,
  onConfirm,
  onCancel,
}: RejectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-app mx-4 mb-0 sm:mb-8 animate-slide-up">
        <h3 className="text-lg font-medium text-[#EDEADE] mb-4">Reject Application</h3>

        <div className="space-y-3 mb-4">
          <p className="text-sm text-[#8E8E93]">Reason</p>
          {REJECT_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => onReasonChange(reason.value)}
              className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all ${
                rejectReason === reason.value
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-[#8E8E93] border border-transparent hover:text-[#EDEADE]'
              }`}
            >
              {reason.label}
            </button>
          ))}
        </div>

        <textarea
          value={rejectNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Optional note..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-[#EDEADE] placeholder-[#5A5A5D] min-h-[80px] resize-none mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-white/10 text-[#EDEADE] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!rejectReason || processing}
            className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
