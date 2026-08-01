'use client';

import type { ReactNode } from 'react';

interface PermissionPrimerProps {
  open: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onSkip: () => void;
  skipLabel: string;
}

// A benefit-framed in-app screen shown before the native OS permission
// prompt fires, rather than triggering the system dialog cold. Users are
// far more likely to grant access when they understand why first --
// applied here to microphone (voice-note tasks) and location (city
// auto-detect during profile setup), the two permissions this app asks
// for outside of the camera/photo-library picker (which the OS already
// contextualizes via its own "Take Photo" action-sheet option).
export function PermissionPrimer({
  open, icon, title, description, confirmLabel, onConfirm, onSkip, skipLabel,
}: PermissionPrimerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="card max-w-sm w-full p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3">
          <button onClick={onSkip} className="btn-secondary flex-1 !px-3 !text-[11px] normal-case tracking-normal whitespace-nowrap">
            {skipLabel}
          </button>
          <button onClick={onConfirm} className="btn-primary flex-1 !px-3 !text-[11px] normal-case tracking-normal whitespace-nowrap">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
