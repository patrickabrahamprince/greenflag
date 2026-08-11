'use client';

import { Trash2, X } from 'lucide-react';
import type { AdminUser } from './types';

export interface DeleteUserModalProps {
  user: AdminUser;
  confirmText: string;
  deleting: boolean;
  onConfirmTextChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteUserModal({
  user,
  confirmText,
  deleting,
  onConfirmTextChange,
  onConfirm,
  onClose,
}: DeleteUserModalProps) {
  const canDelete = confirmText.trim() === (user.name || '').trim() && confirmText.trim().length > 0;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="dialog-card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-display text-gray-900">Remove Profile</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-400 font-medium mb-1">This permanently deletes:</p>
          <p className="text-gray-900 font-medium mb-2">{user.name} ({user.email})</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Their account, profile, photos, matches, messages, wallet, and transaction
            history are all removed. This cannot be undone.
          </p>
          {user.is_admin && (
            <p className="text-xs text-red-400 font-medium mt-2">This account is an admin.</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2">
            Type <span className="text-gray-900 font-medium">{user.name}</span> to confirm
          </label>
          <input
            className="input w-full"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder={user.name}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || deleting}
            className="btn-danger flex-1 text-sm disabled:opacity-50"
          >
            {deleting ? 'Removing...' : 'Remove Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
