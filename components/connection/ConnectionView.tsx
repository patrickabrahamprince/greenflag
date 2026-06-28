'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Snowflake } from 'lucide-react';

import { ConnectedScreen } from '@/components/ConnectedScreen';
import { ProgressSegmentBar } from './ProgressSegmentBar';
import { CountdownTimer } from './CountdownTimer';
import { SubmitSheet } from './SubmitSheet';
import type { ConnectionWithHost, SubmissionRecord, IntentionRecord } from './types';

interface ConnectionViewProps {
  connection: ConnectionWithHost;
  submissions: SubmissionRecord[];
  intentions: IntentionRecord[];
  onRefresh: () => void;
}

function EndedCard({ reason }: { reason: string | null }) {
  return (
    <div className="card p-6 text-center" style={{ background: '#141414' }}>
      <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#1C1C1E' }}>
        <span className="text-2xl">✕</span>
      </div>
      <h3 className="text-white font-display text-lg mb-2">Connection Ended</h3>
      <p className="text-[#8E8E93] text-sm font-thin">
        {reason === 'rejected' ? 'She didn\'t accept your application.' : 'This connection has expired.'}
      </p>
    </div>
  );
}

export function ConnectionView({ connection, submissions, intentions, onRefresh }: ConnectionViewProps) {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);
  const [activeIntention, setActiveIntention] = useState<IntentionRecord | null>(null);

  const isEnded = connection.status === 'ended' || connection.status === 'expired' || connection.status === 'rejected';
  const isConnected = connection.connected;
  const isChatUnlocked = connection.chat_unlocked && !connection.connected;
  const currentDay = connection.current_day ?? 1;
  const now = new Date();

  // Find the active deadline among submissions
  const activeDeadlineSub = submissions.find((s) => s.deadline);
  const deadlineMs = activeDeadlineSub?.deadline ? new Date(activeDeadlineSub.deadline).getTime() : 0;
  const frozenUntil = connection.frozen_until ? new Date(connection.frozen_until).getTime() : 0;
  const isFrozen = frozenUntil > now.getTime();
  const deadlinePassed = deadlineMs > 0 && deadlineMs < now.getTime() && !isFrozen;

  if (isEnded) {
    return (
      <div className="page-container flex flex-col">
        <div className="page-header">
          <button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex-row items-center justify-center">
          <EndedCard reason={connection.ended_reason} />
        </div>
        <button onClick={() => router.push('/discover')} className="btn-primary w-full mb-6">
          Back to Discover
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <ConnectedScreen
        womanPhoto={connection.host.photos[0]}
        womanName={connection.host.name}
        connectionId={connection.id}
      />
    );
  }

  return (
    <div className="page-container flex flex-col">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display text-white truncate">{connection.host?.name}</h1>
      </div>

      <ProgressSegmentBar currentDay={currentDay} className="mb-6" />

      <p className="text-center text-sm text-[#8E8E93] font-thin mb-3">
        Day {currentDay} of 3
      </p>

      {intentions.length === 0 && (
        <div className="text-center px-6 mb-6">
          <p className="text-[#8E8E93] text-sm font-thin">
            Waiting for her to set up tasks for this day.
          </p>
        </div>
      )}

      {isChatUnlocked && (
        <div className="card mb-5 p-4 flex items-center gap-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex-1">
            <p className="text-gold text-sm font-medium">You&apos;ve earned access</p>
            <p className="text-[#8E8E93] text-xs font-thin mt-0.5">Message her anytime</p>
          </div>
          <button
            onClick={() => router.push(`/messages/${connection.id}`)}
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 flex-shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Open Chat
          </button>
        </div>
      )}

      {deadlinePassed && (
        <>
          <div className="card p-5 text-center mb-5" style={{ background: '#141414' }}>
            <p className="text-white/80 text-sm">You missed the deadline</p>
          </div>
          {connection.freezes_used === 0 ? (
            <button
              onClick={async () => {
                const res = await fetch(`/api/connections/${connection.id}/freeze`, { method: 'POST' });
                if (res.ok) {
                  router.refresh();
                }
              }}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Snowflake className="w-4 h-4" />
              Freeze for 300 coins — get 24 more hours
            </button>
          ) : (
            <div className="card p-5 text-center" style={{ background: '#141414' }}>
              <p className="text-[#8E8E93] text-sm font-thin">No freezes remaining. Connection ended.</p>
            </div>
          )}
        </>
      )}

      {!deadlinePassed && intentions.length > 0 && (
        <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
          {intentions.map((intentionItem) => {
            const matchingSub = submissions.find((s) => s.task_number === intentionItem.task_number);
            const hasSubmittedContent = !!(matchingSub?.content || matchingSub?.media_url);
            const isTaskApproved = matchingSub?.approved === true;
            const isTaskPendingReview = matchingSub && !isTaskApproved && hasSubmittedContent;
            const isTaskPendingSubmission = !matchingSub || (!isTaskApproved && !hasSubmittedContent);

            return (
              <div key={intentionItem.id} className="card p-5" style={{ background: '#1C1C1E' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8E8E93] font-thin">Task {intentionItem.task_number} ({intentionItem.type})</span>
                  {isTaskApproved && <span className="text-xs text-green-500 font-medium">Done (Approved) ✓</span>}
                  {isTaskPendingReview && <span className="text-xs text-gold font-medium">Done (Pending Review) ✓</span>}
                  {isTaskPendingSubmission && <span className="text-xs text-[#8E8E93] font-thin">Pending Submission</span>}
                </div>
                <p className={`text-sm mb-4 ${hasSubmittedContent ? 'line-through text-white/40 font-light' : 'text-white font-normal'}`}>{intentionItem.prompt}</p>
                
                {isTaskPendingSubmission && (
                  <button
                    onClick={() => {
                      setActiveIntention(intentionItem);
                      setShowSheet(true);
                    }}
                    className="btn-primary text-xs px-4 py-2 w-full flex items-center justify-center gap-1.5"
                  >
                    Submit Response
                  </button>
                )}

                {matchingSub && (matchingSub.content || matchingSub.media_url) && (
                  <div className="border-t border-[#2C2C2E] pt-3 mt-3">
                    <p className="text-xs text-[#8E8E93] mb-1">Your Submission:</p>
                    {matchingSub.content && <p className="text-xs text-white/90 italic">"{matchingSub.content}"</p>}
                    {matchingSub.media_url && (
                      matchingSub.media_type === 'photo' || matchingSub.media_url.match(/\.(jpeg|jpg|gif|png)/i) ? (
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
      )}

      {activeDeadlineSub?.deadline && !deadlinePassed && (
        <CountdownTimer deadline={activeDeadlineSub.deadline} label="Submit in" />
      )}

      {showSheet && activeIntention && (
        <SubmitSheet
          connectionId={connection.id}
          dayNumber={currentDay}
          intention={activeIntention}
          onClose={() => {
            setShowSheet(false);
            setActiveIntention(null);
          }}
          onSubmit={() => {
            setShowSheet(false);
            setActiveIntention(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
