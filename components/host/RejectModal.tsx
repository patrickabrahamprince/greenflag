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
      <div className="relative bg-[#FAF9F7] border border-[#E8E6E1] rounded-2xl p-6 w-full max-w-app mx-4 mb-0 sm:mb-8 animate-slide-up">
        <h3 className="font-['Playfair_Display'] text-lg text-ink mb-4">Reject Application</h3>

        <div className="space-y-3 mb-4">
          <p className="text-sm text-[#8E8E93]">Reason</p>
          {REJECT_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => onReasonChange(reason.value)}
              className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all ${
                rejectReason === reason.value
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-[#F0EDE9] text-[#8E8E93] border border-transparent hover:text-ink'
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
          className="w-full bg-[#F0EDE9] border border-[#E8E6E1] rounded-xl p-3 text-sm text-ink placeholder-[#8E8E93] min-h-[80px] resize-none mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-[#F0EDE9] text-ink text-sm font-medium"
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
