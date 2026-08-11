'use client';

import { X, Zap } from 'lucide-react';
import { useState } from 'react';

interface DayExplanation {
  day: 1 | 2 | 3;
  title: string;
  description: string;
  whatToExpect: string[];
  tips: string[];
}

const DAY_EXPLANATIONS: Record<1 | 2 | 3, DayExplanation> = {
  1: {
    day: 1,
    title: 'Day 1: Initial Match',
    description: 'You both matched each other! This is where it starts.',
    whatToExpect: [
      'See their full profile and all their photos',
      'Read their bio and interests',
      'View your match percentage and why you matched',
      'Decide if you want to say hello',
    ],
    tips: [
      'Take a moment to check out their whole profile',
      'Look for things you have in common',
      'If interested, send that first message!',
    ],
  },
  2: {
    day: 2,
    title: 'Day 2: First Exchange',
    description: 'Exchange gets deeper. Learn about their values.',
    whatToExpect: [
      'Share 1-2 meaningful questions',
      'Get to know their personality and values',
      'Start understanding if you\'re compatible',
      'Build the foundation for a real connection',
    ],
    tips: [
      'Ask questions that matter to you',
      'Listen carefully to their answers',
      'Share a bit about yourself too',
    ],
  },
  3: {
    day: 3,
    title: 'Day 3: Real Connection',
    description: 'Go deeper. This is where chemistry happens.',
    whatToExpect: [
      'Share something more personal (photo, voice note, or deeper question)',
      'Hear their voice or see them in a different light',
      'Feel if there\'s real chemistry',
      'Unlock options for video calls and more',
    ],
    tips: [
      'Be authentic and vulnerable',
      'Share something that matters to you',
      'Listen to their response with an open heart',
    ],
  },
};

export function DayExplanationModal({
  day,
  onClose,
}: {
  day: 1 | 2 | 3;
  onClose: () => void;
}) {
  const explanation = DAY_EXPLANATIONS[day];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-raised flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-bold">
              {day}
            </div>
            <h2 className="text-xl font-display font-semibold text-ink">{explanation.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-raised rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ink/60" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-ink/80 text-sm mb-6">{explanation.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold text-ink text-sm mb-3">What to expect:</h3>
            <ul className="space-y-2">
              {explanation.whatToExpect.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-ink/80">
                  <span className="text-gold font-bold">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-ink text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              Pro tips:
            </h3>
            <ul className="space-y-2">
              {explanation.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-ink/80">
                  <span className="text-gold font-bold">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-raised border-t border-raised">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gold hover:bg-gold/90 text-ink text-sm font-medium rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
