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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm px-8" style={{ background: 'rgba(10,10,10,0.92)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#1C1C1E' }}>
        <Lock className="w-7 h-7" style={{ color: '#00C853' }} />
      </div>
      <h3 className="text-lg font-display italic mb-2" style={{ color: '#EDEADE' }}>Messages Locked</h3>
      <p className="text-sm text-center mb-6 font-thin" style={{ color: '#8E8E93' }}>
        Chat unlocks at Day 5. Keep going.
      </p>
      <div className="w-48 h-1.5 rounded-full mb-6" style={{ background: '#1C1C1E' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: '#00C853' }}
        />
      </div>
      <button onClick={() => router.push(backRoute)} className="btn-primary">
        Back to Standard
      </button>
    </div>
  );
}
