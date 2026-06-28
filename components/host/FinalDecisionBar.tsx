import { Flag, X, Loader2 } from 'lucide-react';

interface FinalDecisionBarProps {
  onPass: () => void;
  onGreenFlag: () => void;
  processing: boolean;
}

export function FinalDecisionBar({ onPass, onGreenFlag, processing }: FinalDecisionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 p-4">
      <div className="max-w-[480px] mx-auto flex gap-4">
        <button
          onClick={onPass}
          disabled={processing}
          className="flex-1 h-12 rounded-xl bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
          Pass
        </button>
        <button
          onClick={onGreenFlag}
          disabled={processing}
          className="flex-1 h-12 rounded-xl bg-[#C9A961] text-black font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flag className="w-5 h-5" />}
          Green Flag
        </button>
      </div>
    </div>
  );
}
