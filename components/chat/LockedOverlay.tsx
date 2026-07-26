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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm px-8" style={{ background: 'rgba(10,10,10,0.95)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#1C1C1E]">
        <Lock className="w-7 h-7 text-gold" />
      </div>
      <h3 className="font-display text-2xl text-ink mb-2">Conversation Locked</h3>
      <p className="text-sm text-center mb-6 text-ink/50">
        The conversation unlocks at Day 5. Keep going.
      </p>
      <div className="w-48 h-0.5 mb-6 bg-[#2A2A2A]">
        <div
          className="h-full transition-all duration-500 bg-gold"
          style={{ width: `${progress}%` }}
        />
      </div>
      <button onClick={() => router.push(backRoute)} className="btn-primary">
        Back to Standard
      </button>
    </div>
  );
}
