'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Image, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

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
  host: { id: string; name: string };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <p className="text-sm text-[#8E8E93]">Connection not found</p>
      </div>
    );
  }

  const c = connection;
  const submissions = c.submissions || [];
  const guest = c.guest;
  const tasks = ((c as any).host?.standards as Standard[]) || [];

  return (
    <div className="animate-fade-in py-6">
      <button
        onClick={() => router.push('/interested')}
        className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {guest.photos?.[0] ? (
            <img src={guest.photos[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
          ) : (
            <span className="text-2xl font-medium text-[#EDEADE]">
              {guest.name?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl text-[#EDEADE] font-semibold">
            {guest.name}, {guest.age}
          </h1>
          <p className="text-[#8E8E93] text-sm">{submissions.length}/8 tasks completed</p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {tasks.map((task, idx) => {
          const taskNum = idx + 1;
          const sub = submissions.find((s) => s.task_number === taskNum);

          return (
            <div key={taskNum} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#D4AF37]">Task {taskNum}/8</span>
                {sub ? (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Submitted
                  </span>
                ) : (
                  <span className="text-xs text-[#8E8E93]">Not submitted</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-[#EDEADE] mb-1">{task.title}</h3>
              <p className="text-xs text-[#8E8E93] mb-2">{task.prompt}</p>

              {sub ? (
                <div className="space-y-2">
                  {sub.media_url && (
                    <div className="relative">
                      <img
                        src={sub.media_url}
                        alt={`Task ${taskNum} submission`}
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden bg-white/5 rounded-xl p-4 text-center">
                        <Image className="w-6 h-6 text-[#8E8E93] mx-auto mb-1" />
                        <p className="text-xs text-[#8E8E93]">Image unavailable</p>
                      </div>
                    </div>
                  )}
                  {sub.text_content && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-[#EDEADE] leading-relaxed">{sub.text_content}</p>
                    </div>
                  )}
                  {!sub.media_url && !sub.text_content && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-[#5A5A5D] italic">Empty submission</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-[#5A5A5D] italic">Awaiting submission</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {submissions.length < 8 && (
        <div className="card border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-4">
          <p className="text-sm text-[#D4AF37] flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Waiting for all 8 tasks before you can review.
          </p>
        </div>
      )}

      {submissions.length === 8 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="max-w-[480px] mx-auto flex gap-4">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={processing}
              className="flex-1 h-12 rounded-xl bg-red-500 text-white font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 h-12 rounded-xl bg-[#D4AF37] text-black font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              Unlock Chat
            </button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-app mx-4 mb-0 sm:mb-8 animate-slide-up">
            <h3 className="text-lg font-medium text-[#EDEADE] mb-4">Reject Application</h3>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-[#8E8E93]">Reason</p>
              {[
                { value: 'incomplete', label: 'Incomplete responses' },
                { value: 'low_effort', label: 'Low effort' },
                { value: 'mismatch', label: 'Values mismatch' },
                { value: 'other', label: 'Other' },
              ].map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setRejectReason(reason.value)}
                  className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all ${
                    rejectReason === reason.value
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-[#8E8E93] border border-transparent hover:text-[#EDEADE]'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-[#EDEADE] placeholder-[#5A5A5D] min-h-[80px] resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 h-11 rounded-xl bg-white/10 text-[#EDEADE] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || processing}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
