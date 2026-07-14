import { ArrowLeft, Clock } from 'lucide-react';
import { Avatar } from '@/components/shared/avatar';
import { cn } from '@/lib/utils';

interface HostHeaderProps {
  host: {
    name: string;
    age: number;
    photos: string[];
  };
  timeLeft: string;
  onBack: () => void;
}

export function HostHeader({ host, timeLeft, onBack }: HostHeaderProps) {
  return (
    <div className="mb-4">
      <button onClick={onBack} className="text-[#9DA0A6] mb-4">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <Avatar src={host.photos?.[0]} name={host.name} size="md" />
        <div>
          <h1 className="font-['Sora'] text-xl text-ink">
            {host.name}, {host.age}
          </h1>
          <p className="text-xs text-[#9DA0A6]">Complete 8 tasks to unlock chat</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#D4AF37]" />
        <span
          className={cn(
            'text-sm',
            timeLeft === 'Expired' ? 'text-red-400' : 'text-[#D4AF37]'
          )}
        >
          {timeLeft || 'Loading...'}
        </span>
      </div>
    </div>
  );
}
