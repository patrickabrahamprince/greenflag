import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total = 8, className }: ProgressBarProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-400 ease-out',
            i < current ? 'bg-gold' : 'bg-surface'
          )}
        />
      ))}
    </div>
  );
}
