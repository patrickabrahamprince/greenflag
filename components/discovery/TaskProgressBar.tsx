import { cn } from '@/lib/utils';

interface TaskProgressBarProps {
  completedCount: number;
  totalTasks?: number;
  isSubmitted?: boolean;
  className?: string;
}

export function TaskProgressBar({
  completedCount,
  totalTasks = 8,
  isSubmitted = false,
  className,
}: TaskProgressBarProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#8E8E93]">Progress</span>
        <span className="text-[#C9A961]">{completedCount}/{totalTasks}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: totalTasks }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i < completedCount
                ? 'bg-[#C9A961]'
                : isSubmitted
                  ? 'bg-[#C9A961]/30'
                  : 'bg-white/10'
            )}
          />
        ))}
      </div>
    </div>
  );
}
