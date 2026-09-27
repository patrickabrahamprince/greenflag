import { Sparkles } from 'lucide-react';

export function ConnectedBanner() {
  return (
    <div className="mx-4 mb-3 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 bg-emerald/10 border border-emerald/25 shadow-glow-emerald backdrop-blur-xl animate-slide-down">
      <Sparkles className="w-4 h-4 text-emerald shrink-0" />
      <span className="text-xs text-emerald font-semibold font-display tracking-wide text-center">
        You&apos;re Connected. Say hello and plan your next meet!
      </span>
    </div>
  );
}

