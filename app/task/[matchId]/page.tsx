'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MessageCircle, Hourglass, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { ConnectedScreen } from '@/components/ConnectedScreen';
import { EndedScreen } from '@/components/connection/EndedScreen';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import { SubmitSheet } from '@/components/connection/SubmitSheet';
import type { IntentionRecord, SubmissionRecord } from '@/components/connection/types';
import { useCountdown, formatCountdown } from '@/lib/hooks/useCountdown';

const TERMINAL_STATUSES = ['rejected', 'expired_no_submission', 'refunded'];

interface MatchData {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
  review_deadline: string | null;
}

function DayCompleteModal({ unlocksAt, onContinue, onExplore }: { unlocksAt: string; onContinue: () => void; onExplore: () => void }) {
  const remainingMs = useCountdown(unlocksAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
          <Hourglass className="w-6 h-6 text-gold" />
        </div>
        <h3 className="font-display text-2xl text-ink mb-2">Day Complete</h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-6">
          Tomorrow&apos;s intentions unlock at the same time tomorrow.
        </p>
        <p className="font-display text-4xl text-gold tracking-wider mb-6">
          {remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}
        </p>
        <div className="flex gap-3">
          <button onClick={onContinue} className="btn-secondary flex-1">
            Onward
          </button>
          <button onClick={onExplore} className="btn-primary flex-1">
            Discover Profiles
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaveWarningModal({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="font-display text-2xl text-ink mb-2">Finish Today First</h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-6">
          You&apos;ve only completed part of today&apos;s intentions. Leave now and you risk losing your coins on
          this profile and never meeting her Standard.
        </p>
        <div className="flex gap-3">
          <button onClick={onLeave} className="btn-secondary flex-1">
            Leave Anyway
          </button>
          <button onClick={onStay} className="btn-primary flex-1">
            Finish Today
          </button>
        </div>
      </div>
    </div>
  );
}

interface OtherProfile {
  id: string;
  name: string;
  age: number | null;
  photos: string[];
}

export default function TaskPage() {
  const router = useRouter();
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;
  const currentUser = useUserStore((s) => s.user);
  const isWoman = currentUser?.persona === 'woman';

  const [match, setMatch] = useState<MatchData | null>(null);
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);
  const [intentions, setIntentions] = useState<IntentionRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [activeIntention, setActiveIntention] = useState<IntentionRecord | null>(null);
  const [dayCompleteUnlockAt, setDayCompleteUnlockAt] = useState<string | null>(null);
  const [reviewingTaskNumber, setReviewingTaskNumber] = useState<number | null>(null);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load match');
        return;
      }
      setMatch(data.match);
      setOtherProfile(data.otherProfile);
      setIntentions(data.intentions || []);
      setSubmissions(data.submissions || []);
    } catch {
      setError('Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [matchId, router]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !match || !otherProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center screen-gradient px-8 text-center">
        <p className="text-ink/60 text-sm mb-6">{error || 'Match not found'}</p>
        <button onClick={() => router.push('/discover')} className="btn-primary">
          Back to Discover
        </button>
      </div>
    );
  }

  if (match.status === 'completed') {
    return (
      <ConnectedScreen
        womanPhoto={otherProfile.photos?.[0] || ''}
        womanName={otherProfile.name}
        connectionId={matchId}
      />
    );
  }

  if (TERMINAL_STATUSES.includes(match.status)) {
    return (
      <EndedScreen
        reason={match.status}
        otherName={otherProfile.name}
        onBack={() => router.push('/discover')}
      />
    );
  }

  const currentDay = match.current_day;
  const isLocked = !!match.next_day_unlocks_at && new Date(match.next_day_unlocks_at) > new Date();
  // Only meaningful mid-day: he's submitted something but not everything --
  // nothing submitted yet means nothing to lose, and a fully-submitted day
  // already routes him through SubmitSheet's own success screen.
  const hasPartialProgress = !isWoman && !isLocked && submissions.length > 0 && submissions.length < intentions.length;

  const handleBack = () => {
    if (hasPartialProgress) {
      setShowLeaveWarning(true);
    } else {
      router.push('/discover');
    }
  };

  const handleReview = async (intentionItem: IntentionRecord, decision: 'approve' | 'reject') => {
    setReviewingTaskNumber(intentionItem.task_number ?? 1);
    try {
      const res = await fetch(`/api/matches/${matchId}/review-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_number: currentDay, task_number: intentionItem.task_number ?? 1, decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Review failed');
        return;
      }
      if (decision === 'reject') {
        toast.success('Match ended.');
      } else if (data.chat_unlocked) {
        toast.success('All three days complete — your conversation is unlocked!');
      } else if (data.day_advanced && data.next_day_unlocks_at) {
        setDayCompleteUnlockAt(data.next_day_unlocks_at);
      } else {
        toast.success('Approved.');
      }
      fetchMatch();
    } catch {
      toast.error('Network error.');
    } finally {
      setReviewingTaskNumber(null);
    }
  };

  return (
    <div className="min-h-screen screen-gradient px-6 pt-8 pb-10 max-w-app mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="p-1 -ml-1 text-ink/40 hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-lg text-ink truncate">{otherProfile.name}</h1>
        <div className="w-6" />
      </div>

      <ProgressSegmentBar currentDay={currentDay} total={3} className="mb-6" />

      <p className="text-center text-sm text-ink/50 mb-3">Day {currentDay} of 3</p>

      {match.chat_unlocked && (
        <div className="rounded-2xl mb-5 p-4 flex items-center gap-4 bg-gold/[0.06] border border-gold/20">
          <div className="flex-1">
            <p className="text-gold text-sm font-medium">You&apos;ve Earned Access</p>
            <p className="text-ink/50 text-xs mt-0.5">Message her anytime</p>
          </div>
          <button
            onClick={() => router.push('/messages')}
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 flex-shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Open Chat
          </button>
        </div>
      )}

      {!isWoman && match.status === 'pending_review' && match.review_deadline && (
        <div className="rounded-2xl mb-5 p-4 flex items-center gap-4 bg-gold/[0.06] border border-gold/20">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <Hourglass className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-gold text-sm font-medium">{otherProfile.name} Is Reviewing</p>
            <p className="text-ink/50 text-xs mt-0.5">Day {currentDay} &middot; <LiveCountdown target={match.review_deadline} /> left</p>
          </div>
        </div>
      )}

      {isLocked && match.next_day_unlocks_at ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {!isWoman && (
            <div className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs font-medium uppercase tracking-wide">Day {currentDay - 1} Approved</span>
            </div>
          )}
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
            <Hourglass className="w-6 h-6 text-gold" />
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Day {currentDay} unlocks in</h2>
          <p className="font-display text-4xl text-gold tracking-wider mb-3">
            <LiveCountdown target={match.next_day_unlocks_at} />
          </p>
          <p className="text-ink/50 text-sm">
            {isWoman
              ? `Come back to review ${otherProfile.name}'s answers and see if he meets your Standard.`
              : `Come back then to continue your Standard with ${otherProfile.name}.`}
          </p>
        </div>
      ) : (
        <>
      {intentions.length === 0 && (
        <div className="text-center px-6 mb-6">
          <p className="text-ink/50 text-sm">Waiting for her to define today&apos;s intentions.</p>
        </div>
      )}

      <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
        {intentions.map((intentionItem) => {
          const matchingSub = submissions.find((s) => s.task_number === intentionItem.task_number);
          const hasSubmittedContent = !!(matchingSub?.content || matchingSub?.media_url);
          const isTaskApproved = matchingSub?.approved === true;
          const isTaskPendingReview = !!matchingSub && !isTaskApproved && hasSubmittedContent;
          const isTaskPendingSubmission = !matchingSub || (!isTaskApproved && !hasSubmittedContent);

          return (
            <div key={intentionItem.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink/40 uppercase tracking-wide">
                  Task {intentionItem.task_number} ({intentionItem.type})
                </span>
                {isTaskApproved && <span className="text-xs text-green-600 font-medium">Done ✓</span>}
                {isTaskPendingReview && <span className="text-xs text-gold font-medium">Pending Review ✓</span>}
                {isTaskPendingSubmission && <span className="text-xs text-ink/40">Pending</span>}
              </div>
              <p className={`text-sm mb-4 ${hasSubmittedContent ? 'line-through text-ink/40 font-light' : 'text-ink font-normal'}`}>
                {intentionItem.prompt}
              </p>

              {isTaskPendingSubmission && !isWoman && (
                <button
                  onClick={() => {
                    setActiveIntention(intentionItem);
                    setShowSheet(true);
                  }}
                  className="btn-primary text-xs px-4 py-2 w-full"
                >
                  Submit Response
                </button>
              )}
              {isTaskPendingSubmission && isWoman && (
                <p className="text-xs text-ink/40 italic">Awaiting his response…</p>
              )}
              {isTaskPendingReview && isWoman && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleReview(intentionItem, 'approve')}
                    disabled={reviewingTaskNumber === intentionItem.task_number}
                    className="btn-primary text-xs px-4 py-2 flex-1"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(intentionItem, 'reject')}
                    disabled={reviewingTaskNumber === intentionItem.task_number}
                    className="btn-secondary text-xs px-4 py-2 flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}

              {matchingSub && (matchingSub.content || matchingSub.media_url) && (
                <div className="border-t border-[#2A2A2A] pt-3 mt-3">
                  <p className="text-xs text-ink/40 mb-1">Your Submission:</p>
                  {matchingSub.content && <p className="text-xs text-ink/80 italic">&quot;{matchingSub.content}&quot;</p>}
                  {matchingSub.media_url && (
                    matchingSub.media_type === 'photo' ? (
                      <img src={matchingSub.media_url} alt="" className="mt-2 rounded-lg w-full max-h-64 object-cover" />
                    ) : (
                      <audio controls src={matchingSub.media_url} className="mt-2 w-full h-8" />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
        </>
      )}

      {showSheet && activeIntention && (
        <SubmitSheet
          matchId={matchId}
          dayNumber={currentDay}
          intention={activeIntention}
          isLastTaskToday={
            intentions.filter(
              (i) => i.id !== activeIntention.id && !submissions.some((s) => s.task_number === i.task_number)
            ).length === 0
          }
          onClose={() => {
            setShowSheet(false);
            setActiveIntention(null);
          }}
          onSubmit={() => {
            setShowSheet(false);
            setActiveIntention(null);
            toast.success('Response submitted — awaiting her review');
            fetchMatch();
          }}
        />
      )}

      {dayCompleteUnlockAt && (
        <DayCompleteModal
          unlocksAt={dayCompleteUnlockAt}
          onContinue={() => router.push('/my-connections')}
          onExplore={() => router.push('/discover')}
        />
      )}

      {showLeaveWarning && (
        <LeaveWarningModal
          onStay={() => setShowLeaveWarning(false)}
          onLeave={() => router.push('/discover')}
        />
      )}
    </div>
  );
}

function LiveCountdown({ target }: { target: string }) {
  const remainingMs = useCountdown(target);
  return <>{remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}</>;
}
