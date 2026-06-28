import { useRouter } from 'next/navigation';
import { StatusChip } from './StatusChip';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import type { ConnectionStatus } from './types';

interface ManConnectionCardProps {
  connectionId: string;
  womanName: string;
  womanPhoto: string | null;
  currentDay: number;
  status: ConnectionStatus;
}

export function ManConnectionCard({
  connectionId,
  womanName,
  womanPhoto,
  currentDay,
  status,
}: ManConnectionCardProps) {
  const router = useRouter();

  const chipVariant =
    status === 'connected'
      ? 'connected'
      : status === 'ended'
        ? 'ended'
        : 'progress';

  const isEnded = status === 'ended';

  return (
    <button
      data-testid="connection-card"
      onClick={() => router.push(`/intentions/${connectionId}`)}
      className={`card w-full text-left p-4 transition-all duration-300 ${
        isEnded ? 'opacity-50' : 'hover:border-[#C9A961]'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#F0EDE9]"
        >
          {womanPhoto ? (
            <img
              src={womanPhoto}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="font-['Playfair_Display'] text-sm italic text-ink/50">
              {womanName.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-['Playfair_Display'] text-sm italic text-ink truncate">
              {womanName}
            </h3>
            <StatusChip variant={chipVariant} />
          </div>

          <p className="text-[11px] text-[#8E8E93] font-thin mb-2">
            Day {currentDay} of 3
          </p>

          <ProgressSegmentBar currentDay={currentDay} />
        </div>
      </div>
    </button>
  );
}
