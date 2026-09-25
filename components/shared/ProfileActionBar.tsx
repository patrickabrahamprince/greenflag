'use client';

import { Loader2 } from 'lucide-react';

interface ProfileActionBarProps {
  profile?: { id: string };
  isOwn: boolean;
  hasConnection: boolean;
  isGuest: boolean;
  connecting: boolean;
  onEdit: () => void;
  onContinue: () => void;
  onMeet: () => void;
}

export function ProfileActionBar({
  isOwn,
  hasConnection,
  isGuest,
  connecting,
  onEdit,
  onContinue,
  onMeet,
}: ProfileActionBarProps) {
  return (
    <div className="mt-8">
      {isOwn ? (
        <button
          onClick={onEdit}
          className="w-full h-14 rounded-pill border border-raised bg-well text-ink font-medium active:scale-95 transition-all duration-200"
        >
          Edit Profile
        </button>
      ) : hasConnection ? (
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-pill bg-emerald-500 hover:bg-emerald-400 text-black font-bold active:scale-95 transition-all duration-200"
        >
          Open Chat
        </button>
      ) : (
        <button
          onClick={onMeet}
          disabled={connecting}
          className="w-full h-14 rounded-pill bg-emerald-500 hover:bg-emerald-400 text-black font-bold active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {connecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
            </>
          ) : (
            'Meet for Trips'
          )}
        </button>
      )}
    </div>
  );
}
