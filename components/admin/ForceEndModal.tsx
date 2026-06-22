'use client';

export interface ForceEndModalProps {
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function ForceEndModal({ reason, onReasonChange, onConfirm, onClose }: ForceEndModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-display text-[#EDEADE] mb-4">Force End Connection</h3>
        <div className="mb-4">
          <label className="block text-xs text-[#8E8E93] mb-1">Reason *</label>
          <textarea className="input min-h-[80px] resize-none" value={reason} onChange={(e) => onReasonChange(e.target.value)} placeholder="Why end this connection?" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={!reason.trim()} className="bg-red-500/10 text-red-400 rounded-xl py-2 px-4 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex-1">End</button>
        </div>
      </div>
    </div>
  );
}
