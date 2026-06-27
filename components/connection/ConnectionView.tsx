'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Snowflake, ArrowRight } from 'lucide-react';

import { ConnectedScreen } from '@/components/ConnectedScreen';
import { ProgressSegmentBar } from './ProgressSegmentBar';
import { IntentionCard } from './IntentionCard';
import { CountdownTimer } from './CountdownTimer';
import { SubmitSheet } from './SubmitSheet';
import type { ConnectionWithHost, SubmissionRecord, IntentionRecord } from './types';

interface ConnectionViewProps {
  connection: ConnectionWithHost;
  submission: SubmissionRecord | null;
  intention: IntentionRecord | null;
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



export function ConnectionView({ connection, submission, intention }: ConnectionViewProps) {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);
  const [sub, setSub] = useState(submission);

  const isEnded = connection.status === 'ended' || connection.status === 'expired' || connection.status === 'rejected';
  const isConnected = connection.connected;
  const isChatUnlocked = connection.chat_unlocked && !connection.connected;
  const currentDay = connection.current_day ?? 1;
  const now = new Date();
  const deadlineMs = sub?.deadline ? new Date(sub.deadline).getTime() : 0;
  const frozenUntil = connection.frozen_until ? new Date(connection.frozen_until).getTime() : 0;
  const isFrozen = frozenUntil > now.getTime();
  const deadlinePassed = deadlineMs > 0 && deadlineMs < now.getTime() && !isFrozen;
  const isPendingReview = sub?.approved === false;
  const isApproved = sub?.approved === true;
  const isPendingSubmission = !isApproved && !isPendingReview && !deadlinePassed;

  if (isEnded) {
    return (
      <div className="page-container flex flex-col">
        <div className="page-header">
          <button onClick={() => router.push('/discover')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
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

      {!intention && !isPendingReview && !deadlinePassed && (
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

      {isPendingReview && sub && (
        <>
          <div className="card p-5 text-center mb-4" style={{ background: 'rgba(212,175,55,0.05)' }}>
            <p className="text-gold text-sm font-medium">Submitted ✓</p>
            <p className="text-[#8E8E93] text-xs font-thin mt-1">Awaiting her review</p>
          </div>
          {sub.deadline && (
            <CountdownTimer deadline={sub.deadline} label="She has until" />
          )}
        </>
      )}

      {deadlinePassed && !isPendingReview && (
        <>
          <div className="card p-5 text-center mb-5" style={{ background: '#141414' }}>
            <p className="text-white/80 text-sm">You missed the deadline</p>
          </div>
          {connection.freezes_used === 0 ? (
            <button
              onClick={async () => {
                const res = await fetch(`/api/connections/${connection.id}/freeze`, { method: 'POST' });
                if (res.ok) {
                  const updated = await res.json();
                  setSub((prev) => prev ? { ...prev, deadline: updated.frozen_until } : prev);
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

      {isPendingSubmission && intention && (
        <>
          <IntentionCard intention={intention} />
          {sub?.deadline && (
            <CountdownTimer deadline={sub.deadline} label="Submit in" />
          )}
          <button onClick={() => setShowSheet(true)} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
            Submit
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}

      {showSheet && intention && (
        <SubmitSheet
          connectionId={connection.id}
          dayNumber={currentDay}
          intention={intention}
          onClose={() => setShowSheet(false)}
          onSubmit={() => { setShowSheet(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
