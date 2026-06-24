'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ReviewGuestHeader } from '@/components/host/ReviewGuestHeader';
import { ReviewActionBar } from '@/components/host/ReviewActionBar';
import { ReviewTaskList } from '@/components/host/ReviewTaskList';
import { ReviewBackButton } from '@/components/host/ReviewBackButton';
import { ReviewLoadingState } from '@/components/host/ReviewLoadingState';
import { ReviewNotFoundState } from '@/components/host/ReviewNotFoundState';
import { ReviewIncompleteNotice } from '@/components/host/ReviewIncompleteNotice';
import { RejectModal } from '@/components/host/RejectModal';

interface TaskSubmission {
  id: number;
  connection_id: string;
  task_number: number;
  content_type: string;
  text_content?: string;
  media_url?: string;
  submitted_at: string;
}

interface Standard {
  title: string;
  prompt: string;
  type: string;
}

interface ConnectionData {
  id: string;
  status: string;
  guest: { id: string; name: string; age: number; photos: string[] };
  host: { id: string; name: string; standards?: Standard[] };
  submissions: TaskSubmission[];
  standards: Standard[];
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = use(params);
  const router = useRouter();

  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/connections/${connectionId}`);
        const data = await res.json();
        if (data.id) setConnection(data);
      } catch {
        toast.error('Failed to load connection');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [connectionId]);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/connections/${connectionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve: true }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success('Chat unlocked!');
      router.push('/interested');
    } catch {
      toast.error('Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) { toast.error('Please select a reason'); return; }
    setProcessing(true);
    try {
      const res = await fetch(`/api/connections/${connectionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve: false, reason: rejectReason, note: rejectNote }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success('Application rejected. Coins refunded.');
      setShowRejectModal(false);
      router.push('/interested');
    } catch {
      toast.error('Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <ReviewLoadingState />;
  if (!connection) return <ReviewNotFoundState />;

  const submissions = connection.submissions || [];
  const tasks = (connection.standards as Standard[]) || [];

  return (
    <div className="animate-fade-in py-6">
      <ReviewBackButton onClick={() => router.push('/interested')} />
      <ReviewGuestHeader guest={connection.guest} submissionCount={submissions.length} />
      <ReviewTaskList tasks={tasks} submissions={submissions} />
      {submissions.length < 8 && <ReviewIncompleteNotice />}
      {submissions.length === 8 && (
        <ReviewActionBar
          onReject={() => setShowRejectModal(true)}
          onApprove={handleApprove}
          processing={processing}
        />
      )}
      {showRejectModal && (
        <RejectModal
          rejectReason={rejectReason}
          rejectNote={rejectNote}
          processing={processing}
          onReasonChange={setRejectReason}
          onNoteChange={setRejectNote}
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}
