'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DELETE_REASONS = [
  'Too many notifications', 'Taking a break', 'Found someone', 'Fake profiles',
  'Not enough matches', 'Privacy concerns', 'Too expensive', 'Other',
];

const MAX_REASONS = 3;

interface DeleteReasonScreenProps {
  onBack: () => void;
  onContinue: (reasons: string[], feedback: string) => void;
}

// Reason capture before the final destructive confirmation -- matches the
// reference set's "why are you leaving?" step, which GreenFlag's delete
// flow previously skipped entirely (straight to a single confirm modal).
// Collecting this costs the leaving user one extra screen but gives the
// product a signal it currently has zero visibility into.
export function DeleteReasonScreen({ onBack, onContinue }: DeleteReasonScreenProps) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const toggleReason = (reason: string) => {
    setReasons((prev) => {
      if (prev.includes(reason)) return prev.filter((r) => r !== reason);
      if (prev.length >= MAX_REASONS) return prev;
      return [...prev, reason];
    });
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <button onClick={onBack} className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="font-display text-3xl text-ink mb-2">Why are you leaving?</h1>
        <p className="text-xs font-semibold text-gold mb-6">My selection: {reasons.length}/{MAX_REASONS}</p>

        <div className="flex flex-wrap gap-2.5 mb-6">
          {DELETE_REASONS.map((reason) => {
            const selected = reasons.includes(reason);
            return (
              <button
                key={reason}
                type="button"
                onClick={() => toggleReason(reason)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selected ? 'bg-gold text-white' : 'bg-[#1C1C1E] border border-[#2A2A2A] text-ink/70'
                }`}
              >
                {reason}
              </button>
            );
          })}
        </div>

        <label className="block text-sm font-medium text-ink mb-1.5">
          Anything else you&apos;d like to share? <span className="text-ink/40 font-normal">(optional)</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your feedback..."
          maxLength={300}
          rows={4}
          className="input resize-none"
        />

        <p className="text-ink/40 text-xs leading-relaxed mt-4">
          Your account will be permanently deleted and all your data will be erased.
        </p>
      </div>

      <button
        onClick={() => onContinue(reasons, feedback.trim())}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
