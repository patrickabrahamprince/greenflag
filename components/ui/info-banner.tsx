import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONE_STYLES = {
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-[#D2042D]/10 text-[#D2042D]',
} as const;

interface InfoBannerProps {
  tone: keyof typeof TONE_STYLES;
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({ tone, children, className }: InfoBannerProps) {
  return (
    <div className={cn('flex gap-2 rounded-tile p-3 text-xs', TONE_STYLES[tone], className)}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
