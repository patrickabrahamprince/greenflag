'use client';

import type { ReactNode } from 'react';

interface FirstTimeHintProps {
  show: boolean;
  icon: ReactNode;
  text: string;
  onDismiss: () => void;
  position?: 'top' | 'bottom';
}

// A small tap-to-dismiss instructional pill for a non-obvious gesture --
// deliberately lighter-weight than PermissionPrimer's full-screen benefit
// framing (that one gates a native permission dialog; this is just "here's
// how this screen works," shown once per device via useFirstTimeHint).
export function FirstTimeHint({ show, icon, text, onDismiss, position = 'bottom' }: FirstTimeHintProps) {
  if (!show) return null;

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-x-0 z-40 flex justify-center px-6 pointer-events-none animate-fade-in ${
        position === 'top' ? 'top-safe-top pt-4' : 'bottom-28'
      }`}
    >
      <div className="pointer-events-auto flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-gold/30 rounded-full pl-3 pr-4 py-2.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] active:scale-95 transition-transform">
        {icon}
        <span className="text-xs font-medium text-ink">{text}</span>
      </div>
    </div>
  );
}
