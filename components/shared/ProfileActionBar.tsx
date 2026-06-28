'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  profile,
  isOwn,
  hasConnection,
  isGuest,
  connecting,
  onEdit,
  onContinue,
  onMeet,
}: ProfileActionBarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="mt-8">
      {isOwn ? (
        <button
          onClick={onEdit}
          className="w-full h-14 rounded-full border border-white/20 bg-white/5 text-[#EDEADE] font-medium backdrop-blur-md active:scale-95 transition-all duration-200"
        >
          Edit Profile
        </button>
      ) : hasConnection ? (
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-[#00C853] text-[#0A0A0A] font-medium active:scale-95 transition-all duration-200"
        >
          Continue to Tasks
        </button>
      ) : isGuest ? (
        <button
          onClick={async () => {
            if (loading) return;
            setLoading(true);
            try {
              const res = await fetch('/api/connections/start', {
                method: 'POST',
                body: JSON.stringify({ woman_id: profile?.id }),
              });
              if (!res.ok) throw new Error('Failed to start');
              const { connection_id } = await res.json();
              router.push(`/intentions/${connection_id}/1`);
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || connecting}
          className="w-full h-14 rounded-full bg-[#00C853] text-[#0A0A0A] font-medium active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading || connecting ? (
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
          className="w-full h-14 rounded-full border border-white/10 bg-white/5 text-[#EDEADE]/40 font-medium cursor-not-allowed"
        >
          Awaiting Application
        </button>
      )}
    </div>
  );
}
