import { Camera, Mic, Type } from 'lucide-react';
import type { IntentionRecord } from './types';

const TYPE_CONFIG: Record<string, { icon: typeof Camera; label: string }> = {
  photo: { icon: Camera, label: 'Photo' },
  voice: { icon: Mic, label: 'Voice' },
  text: { icon: Type, label: 'Text' },
};

interface IntentionCardProps {
  intention: IntentionRecord;
}

export function IntentionCard({ intention }: IntentionCardProps) {
  const config = TYPE_CONFIG[intention.type] || TYPE_CONFIG.text;
  const Icon = config.icon;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <Icon className="w-4 h-4 text-gold" />
        </div>
        <span className="text-xs text-[#8E8E93] uppercase tracking-widest-xl font-thin">
          {config.label} Intention
        </span>
      </div>
      <p className="text-ink/90 text-[15px] leading-relaxed">
        {intention.prompt}
      </p>
    </div>
  );
}
