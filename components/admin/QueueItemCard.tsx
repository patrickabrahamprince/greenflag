'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import type { QueueItem } from './types';

export interface QueueItemCardProps {
  item: QueueItem;
  isSelected: boolean;
  onSelect: (item: QueueItem) => void;
}

function SlaTimer({ submittedAt }: { submittedAt: string }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(submittedAt).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${hrs}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [submittedAt]);

  const hrs = (Date.now() - new Date(submittedAt).getTime()) / 3600000;
  const isUrgent = hrs > 24;

  return (
    <span className={`flex items-center gap-1 text-[10px] ${isUrgent ? 'text-red-400' : 'text-[#8E8E93]'}`}>
      <Clock className="w-3 h-3" /> {elapsed}
    </span>
  );
}

export function QueueItemCard({ item, isSelected, onSelect }: QueueItemCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full card text-left flex items-center gap-3 ${isSelected ? 'border-[#D4AF37]/50' : ''}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
        {item.img ? (
          <img src={item.img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <span className="text-[#5A5A5D] text-xs">No img</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#EDEADE] font-medium truncate">{item.name}</p>
        <p className="text-xs text-[#8E8E93] truncate">Day {item.day} &middot; {item.task}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <ChevronRight className="w-4 h-4 text-[#5A5A5D]" />
        <SlaTimer submittedAt={item.submitted_at} />
      </div>
    </button>
  );
}
