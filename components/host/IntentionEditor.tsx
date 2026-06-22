'use client';

import { Mic, Camera, FileText } from 'lucide-react';
import type { IntentionType } from './StandardDaySlot';

interface IntentionEditorProps {
  dayNumber: number;
  type: IntentionType;
  prompt: string;
  onTypeChange: (type: IntentionType) => void;
  onPromptChange: (prompt: string) => void;
  onClose: () => void;
}

const TYPES: { value: IntentionType; label: string; icon: typeof Mic; active: string; inactive: string }[] = [
  { value: 'voice', label: 'Voice', icon: Mic, active: 'bg-purple-500 text-white', inactive: 'bg-purple-500/20 text-purple-400' },
  { value: 'photo', label: 'Photo', icon: Camera, active: 'bg-blue-500 text-white', inactive: 'bg-blue-500/20 text-blue-400' },
  { value: 'text', label: 'Text', icon: FileText, active: 'bg-green-500 text-white', inactive: 'bg-green-500/20 text-green-400' },
];

export function IntentionEditor({
  dayNumber,
  type,
  prompt,
  onTypeChange,
  onPromptChange,
  onClose,
}: IntentionEditorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div data-testid="intention-editor" className="relative w-full max-w-app bg-[#1C1C1E] rounded-t-2xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#EDEADE]">Day {dayNumber}</h3>
          <button onClick={onClose} className="text-sm text-[#8E8E93]">
            Done
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {TYPES.map(({ value, label, icon: Icon, active, inactive }) => (
            <button
              key={value}
              onClick={() => onTypeChange(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                type === value ? active : inactive
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value.slice(0, 150))}
          placeholder="What should he share?"
          maxLength={150}
          rows={3}
          className="w-full bg-[#0A0A0A] border border-[#2C2C2E] rounded-xl px-4 py-3 text-sm text-[#EDEADE] placeholder:text-[#8E8E93] resize-none focus:outline-none focus:border-[#D4AF37] transition-colors"
        />
        <p className="text-right text-[10px] text-[#8E8E93] mt-1">{prompt.length}/150</p>
      </div>
    </div>
  );
}
