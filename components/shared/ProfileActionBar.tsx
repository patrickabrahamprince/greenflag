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
          className="w-full h-14 rounded-full border border-[#2A2A2A] bg-[#1C1C1E] text-ink font-medium active:scale-95 transition-all duration-200"
        >
          Edit Profile
        </button>
      ) : hasConnection ? (
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-[#D4AF37] text-white font-medium active:scale-95 transition-all duration-200"
        >
          Continue to Tasks
        </button>
      ) : isGuest ? (
        <button
          onClick={onMeet}
          disabled={connecting}
          className="w-full h-14 rounded-full bg-[#D4AF37] text-white font-medium active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {connecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Starting...
            </>
          ) : (
            'Meet Her Standard'
          )}
        </button>
      ) : (
        <button
          disabled
          className="w-full h-14 rounded-full border border-[#2A2A2A] bg-[#1C1C1E] text-ink/40 font-medium cursor-not-allowed"
        >
          Awaiting Application
        </button>
      )}
    </div>
  );
}
