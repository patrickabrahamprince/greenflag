'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Heart, Compass } from 'lucide-react';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import { useCountdown, formatCountdown } from '@/lib/hooks/useCountdown';
import { useUserStore } from '@/lib/store';

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];
const URGENT_THRESHOLD_MS = 12 * 60 * 60 * 1000;

interface MatchListItem {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
  submit_deadline: string | null;
  otherName: string;
  otherPhoto: string | null;
}

function SubmitUrgencyBadge({ deadline }: { deadline: string }) {
  const remainingMs = useCountdown(deadline);
  if (remainingMs === null) return null;
  const isUrgent = remainingMs < URGENT_THRESHOLD_MS;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${
      isUrgent ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-gold/10 text-gold'
    }`}>
      {isUrgent ? 'Hurry — ' : ''}{formatCountdown(remainingMs)} left
    </span>
  );
}

function statusLabel(m: MatchListItem) {
  switch (m.status) {
    case 'completed': return 'Conversation Unlocked';
    case 'rejected': return 'She passed';
    case 'expired_no_submission': return 'Expired';
    case 'refunded': return 'Refunded';
    default: return `Day ${m.current_day} of 3`;
  }
}

function MatchRow({ match, onClick, isMan }: { match: MatchListItem; onClick: () => void; isMan: boolean }) {
  const remainingMs = useCountdown(match.next_day_unlocks_at);
  const isLocked = remainingMs !== null && remainingMs > 0;
  const needsHisSubmission = isMan && match.status === 'pending_submission' && !isLocked && !!match.submit_deadline;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl shadow-sm transition-colors ${
        needsHisSubmission ? 'bg-red-500/[0.06] border border-red-500/20' : 'bg-[#111111]'
      }`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1C1C1E]">
        {match.otherPhoto ? (
          <img src={match.otherPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">?</div>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-display text-base text-ink truncate">{match.otherName}</p>
        <p className="text-xs text-ink/50 mb-1.5">{statusLabel(match)}</p>
        {!TERMINAL_STATUSES.includes(match.status) && (
          <ProgressSegmentBar currentDay={match.current_day} total={3} className="max-w-[120px]" />
        )}
      </div>
      {needsHisSubmission && <SubmitUrgencyBadge deadline={match.submit_deadline!} />}
      {isLocked && (
        <span className="text-xs font-medium text-gold tabular-nums flex-shrink-0">
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
  const currentUser = useUserStore((s) => s.user);
  const isMan = currentUser?.persona !== 'woman';
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
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh screen-gradient px-6 pt-safe-top pb-24 max-w-app mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-ink">Your Connections</h1>
        <button
          onClick={() => router.push('/discover')}
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 shrink-0"
        >
          <Compass className="w-3.5 h-3.5" />
          Discover New Profiles
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 mt-20">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <Heart className="w-6 h-6 text-gold" />
          </div>
          <h2 className="font-display text-xl text-ink mb-2">No Connections Yet</h2>
          <p className="text-ink/50 text-sm">Discover someone to begin an introduction.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} isMan={isMan} onClick={() => router.push(`/task/${m.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
