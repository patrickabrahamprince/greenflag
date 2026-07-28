'use client';

import { Hourglass } from 'lucide-react';

interface ReviewTimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReviewTimerRing({ secondsLeft, totalSeconds }: ReviewTimerRingProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-6">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke="url(#reviewRingGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <defs>
          <linearGradient id="reviewRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C026D3" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-pulse">
        <Hourglass className="w-8 h-8 text-gold" />
      </div>
      <span className="absolute -bottom-2 translate-y-full font-display text-2xl text-gold tabular-nums">
        {secondsLeft}s
      </span>
    </div>
  );
}
