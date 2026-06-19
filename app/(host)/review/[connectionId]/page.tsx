'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X, Camera, Mic, Type, MapPin, ChevronRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Submission, Intention } from '@/types';

const REJECT_REASONS = [
  { value: 'unclear', label: 'Unclear' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'wrong_task', label: 'Wrong task' },
  { value: 'low_effort', label: 'Low effort' },
];

const MOCK_GUEST = {
  name: 'Priya',
  age: 28,
  city: 'Mumbai',
  bio: 'Love exploring new places and meeting interesting people. Always up for an adventure!',
  photo: null,
};

const MOCK_INTENTION: Intention = {
  id: 'i1',
  standard_id: 's1',
  day: 1,
  description: 'Share a photo of your favorite book and explain why it matters to you',
  type: 'photo',
};

const MOCK_SUBMISSION: Submission = {
  id: 'sub1',
  connection_id: 'c1',
  intention_id: 1,
  proof_url: '',
  proof_text: "My favorite book is 'The Alchemist' by Paulo Coelho. It taught me to follow my dreams and listen to my heart. The journey of Santiago inspired me to take risks and embrace the unknown.",
  status: 'submitted',
  created_at: '2026-06-18T10:30:00Z',
};

const MOCK_HISTORY: { day: number; status: 'approved' | 'rejected'; description: string }[] = [
  { day: 1, status: 'approved', description: 'Share a photo of your favorite book' },
  { day: 2, status: 'approved', description: 'Record a voice note about your morning' },
  { day: 3, status: 'rejected', description: 'Tell me about a place you love' },
  { day: 4, status: 'approved', description: 'Share your current location' },
];

const MOCK_TASKS_COMPLETED = 3;

function TypeIcon({ type }: { type: Intention['type'] }) {
  switch (type) {
    case 'photo':
      return <Camera className="w-5 h-5" />;
    case 'voice':
      return <Mic className="w-5 h-5" />;
    case 'text':
      return <Type className="w-5 h-5" />;
    case 'location':
      return <MapPin className="w-5 h-5" />;
  }
}

function StatusBadge({ status }: { status: Submission['status'] }) {
  const styles = {
    submitted: 'bg-gold/10 text-gold border-gold/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={cn('text-xs px-3 py-1 rounded-full border', styles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = use(params);
  const router = useRouter();

  const [tasksCompleted, setTasksCompleted] = useState(MOCK_TASKS_COMPLETED);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const approvedCount = MOCK_HISTORY.filter((h) => h.status === 'approved').length;
  const rejectedCount = MOCK_HISTORY.filter((h) => h.status === 'rejected').length;

  const fifthApproval = tasksCompleted === 4 && MOCK_SUBMISSION.status === 'submitted';
  const eighthApproval = tasksCompleted === 7 && MOCK_SUBMISSION.status === 'submitted';
  const isChatUnlocked = tasksCompleted >= 5;

  async function handleApprove() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));

    const newCount = tasksCompleted + 1;
    setTasksCompleted(newCount);
    setProcessing(false);

    toast.success('Submission approved!');

    if (fifthApproval && newCount >= 5) {
      toast.success('Chat unlocked! You can now message each other.', {
        duration: 4000,
      });
    }

    if (eighthApproval || newCount >= 8) {
      toast.success('All intentions completed! You are now connected.', {
        duration: 4000,
      });
    }
  }

  async function handleReject() {
    if (!rejectReason) {
      toast.error('Please select a reason');
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    setProcessing(false);
    setShowRejectModal(false);

    toast.success('Submission rejected');
    setRejectReason('');
    setRejectNote('');
  }

  return (
    <div className="animate-fade-in py-6">
      <button
        onClick={() => router.push('/interested')}
        className="btn-ghost flex items-center gap-2 text-muted hover:text-white -ml-2 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0 overflow-hidden">
            {MOCK_GUEST.photo ? (
              <img src={MOCK_GUEST.photo} alt={MOCK_GUEST.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-medium text-white">
                {MOCK_GUEST.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl text-white font-semibold">
              {MOCK_GUEST.name}
            </h1>
            <p className="text-muted text-sm">
              Day {MOCK_INTENTION.day}
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          About
        </h2>
        <p className="text-white text-sm">{MOCK_GUEST.age} &middot; {MOCK_GUEST.city}</p>
        <p className="text-muted text-sm mt-1">{MOCK_GUEST.bio}</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TypeIcon type={MOCK_INTENTION.type} />
          <h2 className="text-sm font-medium text-white">Current Intention</h2>
          <div className="ml-auto">
            <StatusBadge status={MOCK_SUBMISSION.status} />
          </div>
        </div>
        <p className="text-muted text-sm mb-4">{MOCK_INTENTION.description}</p>

        {MOCK_SUBMISSION.proof_text && (
          <div className="bg-surface-light rounded-xl p-4 mb-3">
            <p className="text-white text-sm leading-relaxed">
              {MOCK_SUBMISSION.proof_text}
            </p>
          </div>
        )}

        {MOCK_INTENTION.type === 'photo' && !MOCK_SUBMISSION.proof_url && (
          <div className="bg-surface-light rounded-xl p-8 text-center">
            <Camera className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">Photo placeholder</p>
          </div>
        )}

        {MOCK_INTENTION.type === 'voice' && (
          <div className="bg-surface-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="w-0 h-full bg-gold rounded-full" />
              </div>
            </div>
            <span className="text-xs text-muted">Voice note</span>
          </div>
        )}

        {MOCK_INTENTION.type === 'location' && (
          <div className="bg-surface-light rounded-xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gold" />
            <span className="text-white text-sm">Location shared</span>
          </div>
        )}
      </div>

      <div className="card mb-8">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          History
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-emerald-400">{approvedCount} approved</span>
          <span className="text-muted">&middot;</span>
          <span className="text-sm text-red-400">{rejectedCount} rejected</span>
          {isChatUnlocked && (
            <>
              <span className="text-muted">&middot;</span>
              <span className="text-sm text-gold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Chat unlocked
              </span>
            </>
          )}
        </div>
        <div className="space-y-2">
          {MOCK_HISTORY.map((h) => (
            <div key={h.day} className="flex items-center gap-3 text-sm">
              {h.status === 'approved' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="text-muted">Day {h.day}</span>
              <span className="text-muted">&middot;</span>
              <span className="text-muted truncate">{h.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-border p-4">
        <div className="max-w-app mx-auto flex gap-4">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={processing}
            className="flex-1 bg-red-500 text-white font-medium rounded-xl py-4 text-lg
                       transition-all duration-400 ease-out hover:bg-red-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 bg-emerald-500 text-white font-medium rounded-xl py-4 text-lg
                       transition-all duration-400 ease-out hover:bg-emerald-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Approve
          </button>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-app mx-4 mb-0 sm:mb-8 animate-slide-up">
            <h3 className="text-lg font-medium text-white mb-4">Reject Submission</h3>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-muted">Reason for rejection</p>
              {REJECT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setRejectReason(reason.value)}
                  className={cn(
                    'w-full text-left py-3 px-4 rounded-xl text-sm transition-all duration-400 ease-out',
                    rejectReason === reason.value
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-surface-light text-muted border border-transparent hover:text-white'
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Optional note..."
              className="input min-h-[80px] resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || processing}
                className="flex-1 btn-danger font-medium"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {fifthApproval && (
        <div className="card border-gold/30 bg-gold/5 mb-4">
          <p className="text-sm text-gold">
            Approving this will unlock chat — reaching 5 of 8 intentions!
          </p>
        </div>
      )}

      {eighthApproval && (
        <div className="card border-emerald-500/30 bg-emerald-500/5 mb-4">
          <p className="text-sm text-emerald-400">
            Approving this completes all 8 intentions — you will be connected!
          </p>
        </div>
      )}
    </div>
  );
}
