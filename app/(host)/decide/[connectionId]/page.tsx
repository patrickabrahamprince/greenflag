'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ReviewGuestHeader } from '@/components/host/ReviewGuestHeader';
import { ReviewBackButton } from '@/components/host/ReviewBackButton';
import { ReviewLoadingState } from '@/components/host/ReviewLoadingState';
import { ReviewNotFoundState } from '@/components/host/ReviewNotFoundState';
import { FinalDecisionBar } from '@/components/host/FinalDecisionBar';

interface ConnectionData {
  id: string;
  status: string;
  guest: { id: string; name: string; age: number; photos: string[] };
  submissions?: unknown[];
}

export default function DecidePage({
  params,
}: {
  params: { connectionId: string };
}) {
  const { connectionId } = params;
  const router = useRouter();

  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleDecide = async (greenFlag: boolean) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/connections/${connectionId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ green_flag: greenFlag }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success(greenFlag ? 'Green Flag sent 🟢' : 'Passed');
      router.push('/interested');
    } catch {
      toast.error('Failed to record decision');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <ReviewLoadingState />;
  if (!connection) return <ReviewNotFoundState />;

  if (connection.status !== 'awaiting_decision') {
    return (
      <div className="min-h-screen bg-[#FAF9F7] text-ink flex items-center justify-center p-6 text-center">
        <p className="text-ink/50">This connection isn&apos;t ready for a final decision yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-ink pb-28">
      <ReviewBackButton onClick={() => router.back()} />
      <ReviewGuestHeader guest={connection.guest} submissionCount={connection.submissions?.length ?? 9} />
      <div className="px-4 pt-6 text-center">
        <h1 className="font-['Playfair_Display'] text-xl">3 days complete</h1>
        <p className="text-ink/50 text-sm mt-2">
          {connection.guest.name} finished every task. Is he a Green Flag?
        </p>
      </div>
      <FinalDecisionBar
        processing={processing}
        onPass={() => handleDecide(false)}
        onGreenFlag={() => handleDecide(true)}
      />
    </div>
  );
}
