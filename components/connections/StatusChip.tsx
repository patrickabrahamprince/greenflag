import { cn } from '@/lib/utils';

type ChipVariant = 'review' | 'working' | 'connected' | 'ended' | 'progress';

interface StatusChipProps {
  variant: ChipVariant;
  className?: string;
}

const VARIANT_STYLES: Record<ChipVariant, string> = {
  review: 'bg-red-500/10 text-red-400',
  working: 'bg-[#00C853]/10 text-[#00C853]',
  connected: 'bg-[#00C853]/15 text-[#00C853]',
  ended: 'bg-[#8E8E93]/10 text-[#8E8E93]',
  progress: 'bg-[#8E8E93]/10 text-[#EDEADE]',
};

const LABELS: Record<ChipVariant, string> = {
  review: 'Awaiting your review',
  working: "He's working on it",
  connected: 'Connected',
  ended: 'Ended',
  progress: 'In Progress',
};

export function StatusChip({ variant, className }: StatusChipProps) {
  const showDot = variant === 'review';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
      )}
      {LABELS[variant]}
    </span>
  );
}
