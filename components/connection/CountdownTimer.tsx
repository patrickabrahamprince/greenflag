'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: string;
  label?: string;
  onComplete?: () => void;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function CountdownTimer({ deadline, label = 'Submit in', onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(deadline).getTime() - Date.now();
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, onComplete]);

  return (
    <div data-testid="countdown-timer" className="text-center py-3">
      <p className="text-[#8E8E93] text-xs font-thin mb-1">{label}</p>
      <p className="text-gold font-display text-2xl tracking-wide">{formatTime(remaining)}</p>
    </div>
  );
}
