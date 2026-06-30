'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, MessageCircle, Hourglass } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConnectedScreen } from '@/components/ConnectedScreen';
import { ProgressSegmentBar } from '@/components/connection/ProgressSegmentBar';
import { SubmitSheet } from '@/components/connection/SubmitSheet';
import type { IntentionRecord, SubmissionRecord } from '@/components/connection/types';

interface MatchData {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  next_day_unlocks_at: string | null;
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

function DayCompleteModal({ unlocksAt, onClose }: { unlocksAt: string; onClose: () => void }) {
  const remainingMs = useCountdown(unlocksAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-[#FAF9F7] rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#C9A961]/10 flex items-center justify-center mx-auto mb-5">
          <Hourglass className="w-6 h-6 text-[#C9A961]" />
        </div>
        <h3 className="font-['Playfair_Display'] text-2xl text-ink mb-2">Day Complete</h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-6">
          Tomorrow&apos;s tasks unlock at the same time tomorrow.
        </p>
        <p className="font-['Playfair_Display'] text-4xl text-[#C9A961] tracking-wider mb-6">
          {remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          Got it
        </button>
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

  const [match, setMatch] = useState<MatchData | null>(null);
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);
  const [intentions, setIntentions] = useState<IntentionRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [activeIntention, setActiveIntention] = useState<IntentionRecord | null>(null);
  const [dayCompleteUnlockAt, setDayCompleteUnlockAt] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  if (error || !match || !otherProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] px-8 text-center">
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

  const currentDay = match.current_day;
  const isLocked = !!match.next_day_unlocks_at && new Date(match.next_day_unlocks_at) > new Date();

  return (
    <div className="min-h-screen bg-[#FAF9F7] px-6 pt-6 pb-10 max-w-app mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/discover')} className="p-1 -ml-1 text-ink/40 hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-['Playfair_Display'] text-lg text-ink truncate">{otherProfile.name}</h1>
        <div className="w-6" />
      </div>

      <ProgressSegmentBar currentDay={currentDay} total={3} className="mb-6" />

      <p className="text-center text-sm text-ink/50 mb-3">Day {currentDay} of 3</p>

      {match.chat_unlocked && (
        <div className="rounded-2xl mb-5 p-4 flex items-center gap-4 bg-[#C9A961]/[0.06] border border-[#C9A961]/20">
          <div className="flex-1">
            <p className="text-[#C9A961] text-sm font-medium">You&apos;ve earned access</p>
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

      {isLocked && match.next_day_unlocks_at ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-14 h-14 rounded-full bg-[#C9A961]/10 flex items-center justify-center mb-5">
            <Hourglass className="w-6 h-6 text-[#C9A961]" />
          </div>
          <h2 className="font-['Playfair_Display'] text-2xl text-ink mb-2">Day {currentDay} unlocks in</h2>
          <p className="font-['Playfair_Display'] text-4xl text-[#C9A961] tracking-wider mb-3">
            <LiveCountdown target={match.next_day_unlocks_at} />
          </p>
          <p className="text-ink/50 text-sm">Come back then to continue with {otherProfile.name}.</p>
        </div>
      ) : (
        <>
      {intentions.length === 0 && (
        <div className="text-center px-6 mb-6">
          <p className="text-ink/50 text-sm">Waiting for her to set up tasks for this day.</p>
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
            <div key={intentionItem.id} className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-ink/40 uppercase tracking-wide">
                  Task {intentionItem.task_number} ({intentionItem.type})
                </span>
                {isTaskApproved && <span className="text-xs text-green-600 font-medium">Done ✓</span>}
                {isTaskPendingReview && <span className="text-xs text-[#C9A961] font-medium">Pending Review ✓</span>}
                {isTaskPendingSubmission && <span className="text-xs text-ink/40">Pending</span>}
              </div>
              <p className={`text-sm mb-4 ${hasSubmittedContent ? 'line-through text-ink/40 font-light' : 'text-ink font-normal'}`}>
                {intentionItem.prompt}
              </p>

              {isTaskPendingSubmission && (
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

              {matchingSub && (matchingSub.content || matchingSub.media_url) && (
                <div className="border-t border-[#E8E6E1] pt-3 mt-3">
                  <p className="text-xs text-ink/40 mb-1">Your Submission:</p>
                  {matchingSub.content && <p className="text-xs text-ink/80 italic">&quot;{matchingSub.content}&quot;</p>}
                  {matchingSub.media_url && (
                    matchingSub.media_type === 'photo' ? (
                      <img src={matchingSub.media_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover" />
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
          onClose={() => {
            setShowSheet(false);
            setActiveIntention(null);
          }}
          onSubmit={(result) => {
            setShowSheet(false);
            setActiveIntention(null);
            if (result?.day_advanced && !result?.chat_unlocked && result?.next_day_unlocks_at) {
              setDayCompleteUnlockAt(result.next_day_unlocks_at);
            } else if (result?.chat_unlocked) {
              toast.success('All 3 days complete — chat unlocked!');
            } else {
              toast.success('Response submitted');
            }
            fetchMatch();
          }}
        />
      )}

      {dayCompleteUnlockAt && (
        <DayCompleteModal
          unlocksAt={dayCompleteUnlockAt}
          onClose={() => setDayCompleteUnlockAt(null)}
        />
      )}
    </div>
  );
}

function LiveCountdown({ target }: { target: string }) {
  const remainingMs = useCountdown(target);
  return <>{remainingMs !== null ? formatCountdown(remainingMs) : '--:--:--'}</>;
}
