import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

interface LockedOverlayProps {
  backRoute: string;
  currentDay: number;
}

export function LockedOverlay({ backRoute, currentDay }: LockedOverlayProps) {
  const router = useRouter();
  const progress = Math.min((currentDay / 5) * 100, 100);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-2xl px-8 bg-base/90 text-center animate-fade-in">
      <div className="w-18 h-18 rounded-3xl flex items-center justify-center mb-4 bg-gold/10 border border-gold/30 shadow-glow-gold">
        <Lock className="w-8 h-8 text-gold" />
      </div>
      <h3 className="font-display font-bold text-2xl text-white mb-2 tracking-tight">Conversation Locked</h3>
      <p className="text-sm text-white/50 max-w-xs mb-6">
        This conversation unlocks at Day 5. Keep progressing with your matches!
      </p>
      
      <div className="w-56 h-2 rounded-full mb-8 bg-white/10 overflow-hidden border border-white/10 p-0.5">
        <div
          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-gold to-emerald shadow-glow-emerald"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button onClick={() => router.push(backRoute)} className="btn-primary min-w-[200px]">
        Back to Standard
      </button>
    </div>
  );
}

