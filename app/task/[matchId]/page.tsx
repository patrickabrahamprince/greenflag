'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MessageCircle, Hourglass, CheckCircle2, AlertTriangle, Lock, Coins, Sparkles, Type as TypeIcon, Camera, Mic, Quote } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import toast from 'react-hot-toast';
import { useUserStore, useCoinStore } from '@/lib/store';
import { ConnectedScreen } from '@/components/ConnectedScreen';
import { EndedScreen } from '@/components/connection/EndedScreen';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import { SubmitSheet } from '@/components/connection/SubmitSheet';
import type { IntentionRecord, SubmissionRecord } from '@/components/connection/types';
import { useCountdown, formatCountdown } from '@/lib/hooks/useCountdown';
import { useScreenshotTarget } from '@/lib/hooks/useScreenshotGuard';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticDecision, hapticSuccess, hapticWarning } from '@/lib/haptics';

const TERMINAL_STATUSES = ['rejected', 'expired_no_submission', 'refunded'];
const REVEAL_COST = 20;
const SPECIAL_SEND_COST = 150;
// Mirrors RETRY_COST in api/matches/[id]/retry/route.ts.
const RETRY_COST = 100;

const REJECT_REASON_CHIPS = [
  "Didn't follow instructions",
  'Effort felt low',
  'Not a match after all',
];

interface MatchData {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
  review_deadline: string | null;
  rejection_reason: string | null;
  retry_unlocked_at: string | null;
  retry_decision: string | null;
}

interface SpecialSend {
  id: string;
  day_number: number;
  type: 'text' | 'photo' | 'voice';
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  viewed_at: string | null;
  alreadyViewed: boolean;
}

function DayCompleteModal({ unlocksAt, completedDay, onExplore }: { unlocksAt: string; completedDay: number; onExplore: () => void }) {
  const remainingMs = useCountdown(unlocksAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
          <Hourglass className="w-6 h-6 text-gold" />
        </div>
        <h3 className="font-display text-2xl text-ink mb-2">Day {completedDay} Approved</h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-6">
          His Day {completedDay + 1} intentions unlock for him tomorrow. Check My Connections
          to see if he stays consistent.
        </p>
        <p className="font-display text-4xl text-gold tracking-wider mb-6">
          {remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}
        </p>
        <button onClick={onExplore} className="btn-primary w-full">
          Discover More
        </button>
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

function RejectReasonModal({
  onCancel,
  onConfirm,
  submitting,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-app bg-[#000000] rounded-t-2xl p-6 pb-8">
        <h3 className="font-display text-xl text-ink mb-1.5">Why are you rejecting this?</h3>
        <p className="text-ink/50 text-xs mb-4">He&apos;ll see this, so he knows where he fell short.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {REJECT_REASON_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setReason(chip)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                reason === chip ? 'border-gold text-gold bg-gold/10' : 'border-white/10 text-ink/60'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Say more (required)..."
          rows={3}
          maxLength={300}
          className="input resize-none"
        />
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={reason.trim().length < 3 || submitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
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
  const deductCoins = useCoinStore((s) => s.deduct);
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
  const [revealedSubmissionIds, setRevealedSubmissionIds] = useState<Set<string>>(new Set());
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [specialSend, setSpecialSend] = useState<SpecialSend | null>(null);
  const [showSpecialPicker, setShowSpecialPicker] = useState(false);
  const [specialType, setSpecialType] = useState<'text' | 'photo' | 'voice' | null>(null);
  const [specialRevealed, setSpecialRevealed] = useState(false);
  const [revealingSpecial, setRevealingSpecial] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<IntentionRecord | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useScreenshotTarget(otherProfile?.id, 'task');

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
      setSpecialSend(data.specialSend || null);
    } catch {
      setError('Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [matchId, router]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(fetchMatch);

  if (loading || !currentUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <LoadingLogo />
      </div>
    );
  }

  if (error || !match || !otherProfile) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center screen-gradient px-8 text-center">
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

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/retry`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.error === 'INSUFFICIENT_COINS') {
          toast.error(`Not enough coins. You need ${data.coins_needed} coins to retry.`);
        } else {
          toast.error(data?.error || 'Retry failed');
        }
        return;
      }
      deductCoins(RETRY_COST);
      toast.success("You're back in — resubmit when you're ready.");
      fetchMatch();
    } catch {
      toast.error('Network error.');
    } finally {
      setRetrying(false);
    }
  };

  if (TERMINAL_STATUSES.includes(match.status)) {
    return (
      <EndedScreen
        reason={match.status}
        otherName={otherProfile.name}
        onBack={() => router.push('/discover')}
        rejectionReason={match.rejection_reason}
        canRetry={!isWoman && !!match.retry_unlocked_at && match.retry_decision === 'accepted'}
        retryPending={!isWoman && match.retry_decision === 'pending'}
        retryCost={RETRY_COST}
        retrying={retrying}
        onRetry={handleRetry}
      />
    );
  }

  const currentDay = match.current_day;
  const isLocked = !!match.next_day_unlocks_at && new Date(match.next_day_unlocks_at) > new Date();
  // Only meaningful mid-day: he's submitted something but not everything --
  // nothing submitted yet means nothing to lose, and a fully-submitted day
  // already routes him through SubmitSheet's own success screen.
  const hasPartialProgress = !isWoman && !isLocked && submissions.length > 0 && submissions.length < intentions.length;
  const allTasksSubmittedToday = intentions.length > 0 && submissions.length === intentions.length;

  const handleBack = () => {
    if (hasPartialProgress) {
      setShowLeaveWarning(true);
    } else {
      router.push('/discover');
    }
  };

  const handleReview = async (intentionItem: IntentionRecord, decision: 'approve' | 'reject', reason?: string) => {
    if (decision === 'reject') {
      hapticWarning();
      setRejecting(true);
    } else {
      hapticDecision();
    }
    setReviewingTaskNumber(intentionItem.task_number ?? 1);
    try {
      const res = await fetch(`/api/matches/${matchId}/review-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_number: currentDay, task_number: intentionItem.task_number ?? 1, decision, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Review failed');
        return;
      }
      if (decision === 'reject') {
        setRejectTarget(null);
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
      setRejecting(false);
    }
  };

  const handleRevealSubmission = async (submissionId: string) => {
    setRevealingId(submissionId);
    try {
      const res = await fetch(`/api/matches/${matchId}/reveal-submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Failed to reveal');
        return;
      }
      deductCoins(REVEAL_COST);
      hapticSuccess();
      setRevealedSubmissionIds((prev) => new Set(prev).add(submissionId));
    } catch {
      toast.error('Network error.');
    } finally {
      setRevealingId(null);
    }
  };

  const handleRevealSpecial = async () => {
    setRevealingSpecial(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/special-send/reveal`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Failed to reveal');
        return;
      }
      deductCoins(REVEAL_COST);
      hapticSuccess();
      setSpecialRevealed(true);
    } catch {
      toast.error('Network error.');
    } finally {
      setRevealingSpecial(false);
    }
  };

  return (
    <div
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="h-[calc(100dvh-5rem)] overflow-y-auto overscroll-none screen-gradient px-6 pt-safe-top pb-24 max-w-app mx-auto flex flex-col"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: pullDistance }}
      >
        <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="p-1 -ml-1 text-ink/40 hover:text-ink active:scale-90 transition-all">
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
          <p className="text-ink/50 text-sm mb-6">
            {isWoman
              ? `Come back to review ${otherProfile.name}'s answers and see if he meets your Standard.`
              : `Come back then to continue your Standard with ${otherProfile.name}.`}
          </p>
          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={() => router.push(`/profile/${otherProfile.id}`)} className="btn-secondary flex-1 text-sm px-4">
              View Profile
            </button>
            <button onClick={() => router.push('/discover')} className="btn-primary flex-1 text-sm px-4">
              Discover More
            </button>
          </div>
        </div>
      ) : (
        <>
      {intentions.length === 0 && (
        <div className="text-center px-6 mb-6">
          <p className="text-ink/50 text-sm">Waiting for her to define today&apos;s intentions.</p>
        </div>
      )}

      <div className="space-y-4 mb-6 flex-1 overflow-y-auto scrollbar-hide">
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
                    onClick={() => setRejectTarget(intentionItem)}
                    disabled={reviewingTaskNumber === intentionItem.task_number}
                    className="btn-secondary text-xs px-4 py-2 flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}

              {matchingSub && (matchingSub.content || matchingSub.media_url) && (
                <div className="border-t border-[#2A2A2A] pt-3 mt-3">
                  {!isWoman ? (
                    // Once sent, it's out of his hands -- no re-reading his
                    // own answer, no reveal option. Keeps him moving forward
                    // instead of dwelling on/editing what he already sent.
                    <div className="rounded-lg py-4 flex flex-col items-center gap-1.5 bg-[#1C1C1E]">
                      <Lock className="w-4 h-4 text-ink/30" />
                      <p className="text-xs text-ink/40">Sent — awaiting her decision</p>
                    </div>
                  ) : isTaskApproved && !revealedSubmissionIds.has(matchingSub.id) ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <div className="py-6 text-center bg-[#1C1C1E] blur-sm select-none">
                        <p className="text-xs text-ink/60">
                          {matchingSub.content ? `"${matchingSub.content}"` : 'Content hidden after approval'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevealSubmission(matchingSub.id)}
                        disabled={revealingId === matchingSub.id}
                        className="glass-surface absolute inset-0 m-auto h-8 w-fit px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Coins className="w-3 h-3 text-gold shrink-0" />
                        <span className="text-white text-xs font-display font-bold whitespace-nowrap">
                          Reveal — {REVEAL_COST}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#1C1C1E] border border-[#2A2A2A] p-4">
                      {matchingSub.content && (
                        <div className="flex gap-2.5">
                          <Quote className="w-4 h-4 text-gold/60 shrink-0 mt-0.5" />
                          <p className="text-sm text-ink font-medium leading-relaxed">{matchingSub.content}</p>
                        </div>
                      )}
                      {matchingSub.media_url && (
                        matchingSub.media_type === 'photo' ? (
                          <img
                            src={matchingSub.media_url}
                            alt=""
                            className={`rounded-lg w-full max-h-64 object-cover ${matchingSub.content ? 'mt-3' : ''}`}
                          />
                        ) : (
                          <div className={`flex items-center gap-2.5 ${matchingSub.content ? 'mt-3' : ''}`}>
                            <Mic className="w-4 h-4 text-gold/60 shrink-0" />
                            <audio controls src={matchingSub.media_url} className="w-full h-8" />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allTasksSubmittedToday && !isWoman && (
        specialSend ? (
          <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 bg-[#1C1C1E] border border-[#2A2A2A]">
            <Lock className="w-4 h-4 text-ink/30 shrink-0" />
            <p className="text-xs text-ink/40">Special note sent — your one-time move for today is used.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-4 border border-gold/30 bg-gradient-to-r from-gold/[0.1] via-gold/[0.04] to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-gold" />
              <p className="font-display text-sm text-gold">Send Something Special?</p>
            </div>
            <p className="text-xs text-ink/50 mb-3">
              A one-time surprise note, photo, or voice — {SPECIAL_SEND_COST} coins. No prompt, just you.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setSpecialType('text'); setShowSpecialPicker(true); }}
                className="flex-1 min-w-0 btn-secondary !px-2 text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <TypeIcon className="w-3.5 h-3.5" /> Note
              </button>
              <button
                onClick={() => { setSpecialType('photo'); setShowSpecialPicker(true); }}
                className="flex-1 min-w-0 btn-secondary !px-2 text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Photo
              </button>
              <button
                onClick={() => { setSpecialType('voice'); setShowSpecialPicker(true); }}
                className="flex-1 min-w-0 btn-secondary !px-2 text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" /> Voice
              </button>
            </div>
          </div>
        )
      )}

      {specialSend && isWoman && (
        <div className="rounded-2xl p-4 mb-4 border border-gold/30 bg-gradient-to-r from-gold/[0.12] via-gold/[0.05] to-transparent shadow-[0_0_24px_-10px_rgba(192,38,211,0.6)]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="font-display text-sm text-gold">A Special Note From {otherProfile.name}</p>
          </div>
          {!specialSend.alreadyViewed || specialRevealed ? (
            <>
              {specialSend.type === 'text' && (
                <p className="text-sm text-ink/80 italic">&quot;{specialSend.content}&quot;</p>
              )}
              {specialSend.media_url && (
                specialSend.type === 'photo' ? (
                  <img src={specialSend.media_url} alt="" className="rounded-lg w-full max-h-64 object-cover" />
                ) : (
                  <audio controls src={specialSend.media_url} className="w-full h-8" />
                )
              )}
            </>
          ) : (
            <div className="relative rounded-lg overflow-hidden">
              <div className="py-6 text-center bg-[#1C1C1E] blur-sm select-none">
                <p className="text-xs text-ink/60">A surprise, just for you.</p>
              </div>
              <button
                onClick={handleRevealSpecial}
                disabled={revealingSpecial}
                className="glass-surface absolute inset-0 m-auto h-8 w-fit px-3 rounded-full flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                <Coins className="w-3 h-3 text-gold shrink-0" />
                <span className="text-white text-xs font-display font-bold whitespace-nowrap">
                  Reveal — {REVEAL_COST}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
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
          remainingTasksToday={
            intentions.filter(
              (i) => i.id !== activeIntention.id && !submissions.some((s) => s.task_number === i.task_number)
            ).length
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

      {showSpecialPicker && specialType && (
        <SubmitSheet
          matchId={matchId}
          dayNumber={currentDay}
          mode="special"
          intention={{ id: 'special', standard_id: null, day_number: currentDay, task_number: 0, type: specialType, prompt: 'Something special, just for her.' }}
          isLastTaskToday={false}
          onClose={() => {
            setShowSpecialPicker(false);
            setSpecialType(null);
          }}
          onSubmit={() => {
            setShowSpecialPicker(false);
            setSpecialType(null);
            toast.success('Special note sent');
            fetchMatch();
          }}
        />
      )}

      {dayCompleteUnlockAt && (
        <DayCompleteModal
          unlocksAt={dayCompleteUnlockAt}
          completedDay={Math.max(1, currentDay - 1)}
          onExplore={() => router.push('/discover')}
        />
      )}

      {showLeaveWarning && (
        <LeaveWarningModal
          onStay={() => setShowLeaveWarning(false)}
          onLeave={() => router.push('/discover')}
        />
      )}

      {rejectTarget && (
        <RejectReasonModal
          submitting={rejecting}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => handleReview(rejectTarget, 'reject', reason)}
        />
      )}
    </div>
  );
}

function LiveCountdown({ target }: { target: string }) {
  const remainingMs = useCountdown(target);
  return <>{remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}</>;
}
