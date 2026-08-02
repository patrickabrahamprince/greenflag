'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Heart, Compass, Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import { useCountdown, formatCountdown } from '@/lib/hooks/useCountdown';
import { useUserStore } from '@/lib/store';
import { getCached, setCached } from '@/lib/pageCache';

const MATCHES_CACHE_KEY = 'my-connections:matches';

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];
const URGENT_THRESHOLD_MS = 12 * 60 * 60 * 1000;

interface MatchListItem {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
  submit_deadline: string | null;
  retry_unlocked_at: string | null;
  retry_decision: string | null;
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

function MatchRow({
  match,
  onClick,
  isMan,
  onNudge,
  onDecision,
  actionLoading,
}: {
  match: MatchListItem;
  onClick: () => void;
  isMan: boolean;
  onNudge: () => void;
  onDecision: (decision: 'accept' | 'deny') => void;
  actionLoading: boolean;
}) {
  const remainingMs = useCountdown(match.next_day_unlocks_at);
  const isLocked = remainingMs !== null && remainingMs > 0;
  const needsHisSubmission = isMan && match.status === 'pending_submission' && !isLocked && !!match.submit_deadline;

  // She can act on a rejected match from her side in two states: nudge it
  // open early (retry_decision is still NULL, meaning the 24h auto-prompt
  // hasn't fired yet), or answer the auto-prompt once it has
  // (retry_decision === 'pending'). Once she's answered either way
  // ('accepted'/'denied') or already nudged, there's nothing left to show.
  const canNudge = !isMan && match.status === 'rejected' && !match.retry_decision;
  const canDecide = !isMan && match.status === 'rejected' && match.retry_decision === 'pending';

  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden ${
      needsHisSubmission ? 'bg-red-500/[0.06] border border-red-500/20' : 'bg-[#111111]'
    }`}>
      <button onClick={onClick} className="w-full flex items-center gap-3 p-4">
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

      {canNudge && (
        <div className="px-4 pb-4">
          <button
            onClick={onNudge}
            disabled={actionLoading}
            className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Give Him Another Chance
          </button>
        </div>
      )}

      {canDecide && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gold/80 mb-2">It&apos;s been 24 hours. Want to let him try again?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDecision('deny')}
              disabled={actionLoading}
              className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              No
            </button>
            <button
              onClick={() => onDecision('accept')}
              disabled={actionLoading}
              className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Yes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyConnectionsPage() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.user);
  const isMan = currentUser?.persona !== 'woman';
  const [matches, setMatches] = useState<MatchListItem[]>(() => getCached(MATCHES_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => getCached<MatchListItem[]>(MATCHES_CACHE_KEY) === undefined);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadMatches = () => {
    fetch('/api/matches')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setMatches(data.matches || []);
          setCached(MATCHES_CACHE_KEY, data.matches || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleNudge = async (matchId: string) => {
    setActioningId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/nudge-retry`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Failed to nudge');
        return;
      }
      toast.success('He can try again now.');
      loadMatches();
    } catch {
      toast.error('Network error.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDecision = async (matchId: string, decision: 'accept' | 'deny') => {
    setActioningId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/retry-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Failed to save decision');
        return;
      }
      toast.success(decision === 'accept' ? 'He can try again now.' : 'Match closed for good.');
      loadMatches();
    } catch {
      toast.error('Network error.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh screen-gradient px-6 pt-safe-top pb-24 max-w-app mx-auto">
      <div className="flex items-center justify-end mb-6">
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
            <MatchRow
              key={m.id}
              match={m}
              isMan={isMan}
              onClick={() => router.push(`/task/${m.id}`)}
              onNudge={() => handleNudge(m.id)}
              onDecision={(decision) => handleDecision(m.id, decision)}
              actionLoading={actioningId === m.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
