'use client';

import { Mic, Camera, FileText, Pencil } from 'lucide-react';

export type IntentionType = 'voice' | 'photo' | 'text';

export interface Intention {
  dayNumber: number;
  type: IntentionType;
  prompt: string;
}

interface StandardDaySlotProps {
  intention: Intention;
  onEdit: () => void;
}

const TYPE_CONFIG: Record<IntentionType, { label: string; icon: typeof Mic; classes: string }> = {
  voice: { label: 'Voice', icon: Mic, classes: 'bg-purple-500/20 text-purple-400' },
  photo: { label: 'Photo', icon: Camera, classes: 'bg-blue-500/20 text-blue-400' },
  text: { label: 'Text', icon: FileText, classes: 'bg-green-500/20 text-green-400' },
};

export function StandardDaySlot({ intention, onEdit }: StandardDaySlotProps) {
  const config = TYPE_CONFIG[intention.type];
  const Icon = config.icon;

  return (
    <button
      data-testid="day-slot"
      onClick={onEdit}
      className="w-full flex items-center gap-3 bg-[#1C1C1E] rounded-xl p-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="w-9 h-9 rounded-full bg-[#00C853] flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-black">{intention.dayNumber}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.classes}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        </div>
        <p className="text-sm text-[#EDEADE] truncate">{intention.prompt || 'Tap to set prompt'}</p>
      </div>

      <Pencil className="w-4 h-4 text-[#8E8E93] shrink-0" />
    </button>
  );
}
