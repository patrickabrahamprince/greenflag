'use client';

import { X } from 'lucide-react';

interface BlockConfirmModalProps {
  open: boolean;
  name: string;
  blocking: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockConfirmModal({ open, name, blocking, onClose, onConfirm }: BlockConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] text-lg text-ink">Block {name}?</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-5 h-5 text-[#9DA0A6]" />
          </button>
        </div>
        <p className="text-sm text-[#9DA0A6] mb-6">
          They won&apos;t be able to see or contact you, and you won&apos;t see them in Discover again.
        </p>
        <button
          onClick={onConfirm}
          disabled={blocking}
          className="btn-primary w-full active:scale-95 disabled:opacity-50"
        >
          {blocking ? 'Blocking...' : 'Block'}
        </button>
      </div>
    </div>
  );
}
