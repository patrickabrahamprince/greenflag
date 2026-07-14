'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';

interface MatchListItem {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
  otherName: string;
  otherPhoto: string | null;
}

function useCountdown(target: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!target) {
      setRemainingMs(null);
      return;
    }
    const targetMs = new Date(target).getTime();
    const tick = () => setRemainingMs(Math.max(0, targetMs - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return remainingMs;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function statusLabel(m: MatchListItem) {
  switch (m.status) {
    case 'completed': return 'Chat unlocked';
    case 'rejected': return 'She passed';
    case 'expired_no_submission': return 'Expired — no response';
    case 'refunded': return 'Refunded — not reviewed in time';
    default: return `Day ${m.current_day} of 3`;
  }
}

function MatchRow({ match, onClick }: { match: MatchListItem; onClick: () => void }) {
  const remainingMs = useCountdown(match.next_day_unlocks_at);
  const isLocked = remainingMs !== null && remainingMs > 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-[#111111] rounded-2xl shadow-sm"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1C1C1E]">
        {match.otherPhoto ? (
          <img src={match.otherPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">?</div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-['Playfair_Display'] text-base text-ink truncate">{match.otherName}</p>
        <p className="text-xs text-ink/50">{statusLabel(match)}</p>
      </div>
      {isLocked && (
        <span className="text-xs font-medium text-[#D4AF37] tabular-nums flex-shrink-0">
          {formatCountdown(remainingMs!)}
        </span>
      )}
      {match.status === 'completed' && (
        <span className="text-xs font-medium text-green-600 flex-shrink-0">Unlocked</span>
      )}
    </button>
  );
}

export default function MyConnectionsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setMatches(data.matches || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] px-6 pt-8 pb-24 max-w-app mx-auto">
      <h1 className="font-['Playfair_Display'] text-3xl text-ink mb-6">My Connections</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 mt-20">
          <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5">
            <Heart className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h2 className="font-['Playfair_Display'] text-xl text-ink mb-2">No connections yet</h2>
          <p className="text-ink/50 text-sm">Unlock a profile in Discover to start a connection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} onClick={() => router.push(`/task/${m.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
