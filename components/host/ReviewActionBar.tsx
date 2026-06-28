import { X, Loader2, Shield } from 'lucide-react';

interface ReviewActionBarProps {
  onReject: () => void;
  onApprove: () => void;
  processing: boolean;
}

export function ReviewActionBar({ onReject, onApprove, processing }: ReviewActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 p-4">
      <div className="max-w-[480px] mx-auto flex gap-4">
        <button
          onClick={onReject}
          disabled={processing}
          className="flex-1 h-12 rounded-xl bg-red-500 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          Reject
        </button>
        <button
          onClick={onApprove}
          disabled={processing}
          className="flex-1 h-12 rounded-xl bg-[#00C853] text-black font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
          Unlock Chat
        </button>
      </div>
    </div>
  );
}
