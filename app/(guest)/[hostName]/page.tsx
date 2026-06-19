'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Check, Send, User, AlertCircle } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Intention } from '@/types';

interface MockStandard {
  id: string;
  hostName: string;
  age: number;
  isActive: boolean;
  intentions: Intention[];
}

const MOCK_INTENTIONS: Intention[] = [
  { id: 'i1', standard_id: 's1', day: 1, description: 'Send a photo of your morning routine', type: 'photo' },
  { id: 'i2', standard_id: 's1', day: 2, description: 'Tell me what drives you in life', type: 'text' },
  { id: 'i3', standard_id: 's1', day: 3, description: 'Record a voice note introducing yourself', type: 'voice' },
  { id: 'i4', standard_id: 's1', day: 4, description: 'Share a photo from your favorite place', type: 'photo' },
  { id: 'i5', standard_id: 's1', day: 5, description: 'Describe your perfect weekend', type: 'text' },
  { id: 'i6', standard_id: 's1', day: 6, description: 'Send a voice note about your passions', type: 'voice' },
  { id: 'i7', standard_id: 's1', day: 7, description: 'Share a photo of something you created', type: 'photo' },
  { id: 'i8', standard_id: 's1', day: 8, description: 'Pin your location for a dream travel spot', type: 'location' },
];

const MOCK_SUBMISSIONS: Record<string, 'approved' | 'submitted'> = {
  i1: 'approved',
  i2: 'approved',
  i3: 'approved',
  i4: 'approved',
  i5: 'approved',
  i6: 'submitted',
};

const MOCK_CONNECTION = {
  id: 'c1',
  tasksCompleted: 6,
  status: 'active' as const,
  expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
};

function IntentionsList({
  intentions,
  submissions,
  connectionId,
}: {
  intentions: Intention[];
  submissions: Record<string, 'approved' | 'submitted'>;
  connectionId: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-2 mt-4">
      {intentions.map((intention) => {
        const status = submissions[intention.id];
        const isLocked = intention.day > Object.keys(submissions).length + 1;
        const isPending = !status && !isLocked;

        return (
          <div
            key={intention.id}
            className={cn(
              'card flex items-center gap-3 p-3',
              status === 'approved' && 'border-gold/20'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-muted font-medium">{intention.day}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{intention.description}</p>
              <span className="text-xs text-muted capitalize">{intention.type}</span>
            </div>

            <div className="flex-shrink-0">
              {isLocked ? (
                <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted" />
                </div>
              ) : status === 'approved' ? (
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gold" />
                </div>
              ) : status === 'submitted' ? (
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-xs text-gold font-medium">...</span>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/intentions/${connectionId}/${intention.day}`)}
                  className="text-xs bg-gold text-black font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-gold-light active:scale-[0.98]"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HostStandardPage({
  params,
}: {
  params: Promise<{ hostName: string }>;
}) {
  const { hostName } = use(params);
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const deduct = useCoinStore((s) => s.deduct);

  const displayName = hostName.charAt(0).toUpperCase() + hostName.slice(1);
  const submissions = MOCK_SUBMISSIONS;
  const tasksCompleted = Object.values(submissions).filter((s) => s === 'approved').length;
  const totalTasks = MOCK_INTENTIONS.length;
  const isActive = true;
  const connectionExists = true;
  const canMessage = tasksCompleted >= 5;
  const isAllApproved = tasksCompleted >= totalTasks && tasksCompleted >= 5;

  const handleMeetStandard = async () => {
    if (balance < 100) {
      router.push('/coins');
      return;
    }
    deduct(100);
    router.push(`/${hostName}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          onClick={() => router.push('/discover')}
          className="btn-ghost p-2 -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center">
          <User className="w-6 h-6 text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-white">
            {displayName}, 28
          </h1>
          <p className="text-sm text-muted">Mumbai</p>
        </div>
      </div>

      {connectionExists && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Day {Math.min(tasksCompleted + 1, totalTasks)} of {totalTasks}
            </span>
            <span className="text-gold">
              {tasksCompleted}/{totalTasks} intentions complete
            </span>
          </div>
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: totalTasks }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-300',
                  i < tasksCompleted ? 'bg-gold' : 'bg-surface-light'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {isActive ? (
        <>
          <IntentionsList
            intentions={MOCK_INTENTIONS}
            submissions={submissions}
            connectionId={MOCK_CONNECTION.id}
          />

          {canMessage && tasksCompleted < totalTasks && (
            <button
              onClick={() => router.push(`/messages/${MOCK_CONNECTION.id}`)}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Open Messages
            </button>
          )}

          {isAllApproved && (
            <button
              onClick={() => router.push(`/messages/${MOCK_CONNECTION.id}`)}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Open Messages
            </button>
          )}

          {!connectionExists && (
            <button
              onClick={handleMeetStandard}
              className="btn-primary w-full mt-6"
            >
              Meet Her Standard
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="empty-state-title">She hasn&apos;t set her standard yet.</h3>
          <p className="empty-state-text">Come back later to see her intentions.</p>
        </div>
      )}
    </div>
  );
}
