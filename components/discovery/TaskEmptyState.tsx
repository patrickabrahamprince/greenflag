import { AlertCircle, XCircle, Clock, Coins, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 'no-connection' | 'rejected' | 'expired' | 'submitted';

interface TaskEmptyStateProps {
  type: EmptyStateType;
  hostName?: string;
  onNavigate: (path: string) => void;
}

const configs: Record<EmptyStateType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  showRefund?: boolean;
}> = {
  'no-connection': {
    icon: <AlertCircle className="w-12 h-12 text-[#9DA0A6]" />,
    title: 'No active connection',
    description: '',
  },
  rejected: {
    icon: (
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
    ),
    title: 'She passed',
    description: 'Your 5 coins have been refunded.',
    showRefund: true,
  },
  expired: {
    icon: (
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-red-500" />
      </div>
    ),
    title: 'Deadline missed',
    description: 'Your 48-hour window to complete the tasks has expired.',
  },
  submitted: {
    icon: (
      <div className="w-14 h-14 rounded-full bg-[#C026D3]/10 flex items-center justify-center mx-auto mb-3">
        <Send className="w-6 h-6 text-[#C026D3]" />
      </div>
    ),
    title: 'Submitted!',
    description: 'She will review your responses soon.',
  },
};

export function TaskEmptyState({ type, hostName, onNavigate }: TaskEmptyStateProps) {
  const config = configs[type];

  return (
    <div
      className={cn(
        type === 'submitted'
          ? 'card text-center py-8'
          : 'min-h-screen bg-[#000000] flex items-center justify-center px-6'
      )}
    >
      <div className="text-center">
        {config.icon}
        <h2 className="font-display text-lg text-ink mb-2">{config.title}</h2>
        <p className="text-sm text-[#9DA0A6] mb-2">
          {type === 'no-connection'
            ? `You haven\u2019t applied to meet ${hostName} yet.`
            : config.description}
        </p>
        {config.showRefund && (
          <div className="flex items-center justify-center gap-1 text-[#C026D3] text-sm mb-6">
            <Coins className="w-4 h-4" />+5 coins refunded
          </div>
        )}
        {type !== 'submitted' && (
          <button
            onClick={() => onNavigate('/discover')}
            className="btn-primary"
          >
            Back to Discover
          </button>
        )}
      </div>
    </div>
  );
}
