'use client';

import { Mic, Camera, FileText } from 'lucide-react';

interface Intention {
  id: string;
  day_number: number;
  type: string;
  prompt: string;
}

interface IntentionListProps {
  intentions: Intention[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Mic; classes: string }> = {
  voice: { label: 'Voice', icon: Mic, classes: 'bg-purple-500/20 text-purple-400' },
  photo: { label: 'Photo', icon: Camera, classes: 'bg-blue-500/20 text-blue-400' },
  text: { label: 'Text', icon: FileText, classes: 'bg-green-500/20 text-green-400' },
};

export function IntentionList({ intentions }: IntentionListProps) {
  return (
    <div className="space-y-3">
      {intentions.map((intent) => {
        const config = TYPE_CONFIG[intent.type] ?? TYPE_CONFIG.text;
        const Icon = config.icon;
        return (
          <div
            key={intent.id}
            data-testid="intention-item"
            className="flex items-center gap-3 bg-well rounded-xl p-4"
          >
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-ink">{intent.day_number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.classes}`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-ink truncate">{intent.prompt}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
