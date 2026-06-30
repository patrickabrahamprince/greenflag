'use client';

import { Mic } from 'lucide-react';

interface TaskPanelProps {
  dayNumber: 1 | 2 | 3;
  hasSubmitted: boolean;
  partnerHasSubmitted: boolean;
}

// Stub UI only — no recording/upload wired up yet. Once implemented, recordings
// should be uploaded to Supabase Storage at a path like:
//   `submissions/{conversationId}/{userId}/day-{dayNumber}.webm`
// and the resulting storage path saved as `submissions.audio_url` (see docs/tasks-spec.md).
export function TaskPanel({ dayNumber, hasSubmitted, partnerHasSubmitted }: TaskPanelProps) {
  return (
    <div className="px-8 py-6">
      <div className="hairline mb-6" />
      <span className="text-xs uppercase tracking-widest text-ink/40">Day {dayNumber}</span>
      <h2 className="font-['Playfair_Display'] text-2xl text-ink mt-1 mb-4">
        Record your answer
      </h2>

      {hasSubmitted ? (
        <div className="rounded-2xl bg-[#F0EDE9] px-5 py-4">
          <audio controls className="w-full" />
          <p className="text-xs text-ink/40 mt-2">
            {partnerHasSubmitted ? "You're both done for today." : 'Waiting on your match...'}
          </p>
        </div>
      ) : (
        <button className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl">
          <Mic className="w-5 h-5" />
          <span>Tap to record</span>
        </button>
      )}
    </div>
  );
}
