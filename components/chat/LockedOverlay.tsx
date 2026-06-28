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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm px-8" style={{ background: 'rgba(250,249,247,0.95)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#F0EDE9]">
        <Lock className="w-7 h-7 text-[#C9A961]" />
      </div>
      <h3 className="font-['Playfair_Display'] text-2xl text-ink mb-2">Messages Locked</h3>
      <p className="text-sm text-center mb-6 text-ink/50">
        Chat unlocks at Day 5. Keep going.
      </p>
      <div className="w-48 h-0.5 mb-6 bg-[#E8E6E1]">
        <div
          className="h-full transition-all duration-500 bg-[#C9A961]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <button onClick={() => router.push(backRoute)} className="btn-primary">
        Back to Standard
      </button>
    </div>
  );
}
