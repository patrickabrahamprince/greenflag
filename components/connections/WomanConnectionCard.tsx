import { useRouter } from 'next/navigation';
import { StatusChip } from './StatusChip';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import type { ConnectionStatus } from './types';

interface WomanConnectionCardProps {
  connectionId: string;
  manName: string;
  manPhoto: string | null;
  currentDay: number;
  status: ConnectionStatus;
  deadline: string | null;
}

function formatTimeLeft(deadlineStr: string): string {
  const diff = new Date(deadlineStr).getTime() - Date.now();
  if (diff <= 0) return 'Auto-approve imminent';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m to auto-approve`;
  return `${minutes}m to auto-approve`;
}

export function WomanConnectionCard({
  connectionId,
  manName,
  manPhoto,
  currentDay,
  status,
  deadline,
}: WomanConnectionCardProps) {
  const router = useRouter();

  const chipVariant =
    status === 'pending_review'
      ? 'review'
      : status === 'active' || status === 'pending_submission'
        ? 'working'
        : status === 'connected'
          ? 'connected'
          : 'ended';

  const isEnded = status === 'ended';
  const isReviewPending = status === 'pending_review';

  return (
    <button
      data-testid="connection-card"
      onClick={() => router.push(`/review/${connectionId}`)}
      className={`card w-full text-left p-4 transition-all duration-300 ${
        isEnded ? 'opacity-50' : 'hover:border-[#D4AF37]/20'
      }`}
      style={{ background: '#1C1C1E' }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: '#161616' }}
        >
          {manPhoto ? (
            <img
              src={manPhoto}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: isEnded ? 'none' : 'blur(8px) brightness(0.7)' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-sm font-display italic text-[#8E8E93]">
              {manName.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-display italic text-[#EDEADE] truncate">
              {manName}
            </h3>
            <StatusChip variant={chipVariant} />
          </div>

          <p className="text-[11px] text-[#8E8E93] font-thin mb-2">
            Day {currentDay} of 8
          </p>

          <ProgressSegmentBar currentDay={currentDay} />

          {isReviewPending && deadline && (
            <p className="text-[10px] text-red-400 font-thin mt-2">
              {formatTimeLeft(deadline)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
