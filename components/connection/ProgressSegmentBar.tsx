import { cn } from '@/lib/utils';

interface ProgressSegmentBarProps {
  currentDay: number;
  total?: number;
  className?: string;
}

export function ProgressSegmentBar({ currentDay, total = 8, className }: ProgressSegmentBarProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < currentDay - 1;
        const isCurrent = i === currentDay - 1;
        return (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-500',
              isCompleted && 'bg-gold',
              isCurrent && 'bg-gold animate-pulse',
              !isCompleted && !isCurrent && 'bg-[#2A2A2A]'
            )}
          />
        );
      })}
    </div>
  );
}
