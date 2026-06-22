import { Edit3, Pause } from 'lucide-react';

export interface HostActionButtonsProps {
  isActive: boolean | null;
}

export function HostActionButtons({ isActive }: HostActionButtonsProps) {
  return (
    <div className="flex gap-3 mb-8">
      <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
        <Edit3 className="w-4 h-4" />
        Edit Standard
      </button>
      <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
        <Pause className="w-4 h-4" />
        {isActive ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
