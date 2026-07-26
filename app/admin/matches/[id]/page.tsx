'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Ban, Check, X, Mic, Type as TypeIcon, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface MatchDetail {
  id: string;
  current_day: number;
  status: string;
  chat_unlocked: boolean;
  created_at: string;
  completed_at: string | null;
  next_day_unlocks_at: string | null;
  review_deadline: string | null;
  man: { id: string; name: string; photos: string[] };
  woman: { id: string; name: string; photos: string[] };
}

interface SubmissionDetail {
  id: string;
  day_number: number;
  task_number: number;
  prompt: string | null;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  approved: boolean;
  moderation_status: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

function SubmissionCard({ sub, onModerate }: { sub: SubmissionDetail; onModerate: (id: string, action: 'approve' | 'reject') => void }) {
  const Icon = sub.media_type === 'voice' ? Mic : sub.media_type === 'text' ? TypeIcon : Camera;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#C9A961]" />
          <span className="text-xs text-[#8E8E93] uppercase tracking-wide">Day {sub.day_number} &middot; Task {sub.task_number}</span>
        </div>
        {sub.moderation_status && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            sub.moderation_status === 'rejected' ? 'bg-red-500/10 text-red-400'
              : sub.moderation_status === 'approved' ? 'bg-green-500/10 text-green-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            {sub.moderation_status}
          </span>
        )}
      </div>

      {sub.prompt && <p className="text-xs text-[#8E8E93] mb-2">{sub.prompt}</p>}

      {sub.media_type === 'voice' && sub.media_url ? (
        <audio controls src={sub.media_url} className="w-full mb-3" />
      ) : sub.media_type === 'text' ? (
        <p className="text-[#EDEADE] text-sm italic mb-3">{sub.content ? `"${sub.content}"` : 'No text submitted'}</p>
      ) : sub.media_url ? (
        <img src={sub.media_url} alt="" className="w-full max-h-64 object-cover rounded-xl mb-3" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
      ) : (
        <p className="text-[#5A5A5D] text-sm mb-3">Not submitted yet</p>
      )}

      {sub.media_url || sub.content ? (
        <div className="flex gap-2">
          <button
            onClick={() => onModerate(sub.id, 'approve')}
            disabled={sub.moderation_status === 'approved'}
            className="flex-1 bg-green-500/10 text-green-500 rounded-xl py-2 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => onModerate(sub.id, 'reject')}
            disabled={sub.moderation_status === 'rejected'}
            className="flex-1 bg-red-500/10 text-red-500 rounded-xl py-2 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminMatchDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  const fetchDetail = useCallback(async () => {
    const res = await fetch(`/api/admin/matches/${params.id}`);
    const d = await res.json();
    if (res.ok) {
      setMatch(d.match);
      setSubmissions(d.submissions || []);
    } else {
      toast.error(d.error || 'Failed to load match');
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleModerate = async (id: string, action: 'approve' | 'reject') => {
    let reason: string | null = null;
    if (action === 'reject') {
      reason = prompt('Rejection reason:');
      if (reason === null) return;
    }
    const res = await fetch(`/api/admin/submissions/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) {
      toast.success(action === 'approve' ? 'Submission approved' : 'Submission rejected');
      fetchDetail();
    } else {
      toast.error('Failed to moderate submission');
    }
  };

  const handleEnd = async () => {
    const reason = prompt('Reason for ending this connection (shown to both parties):');
    if (reason === null) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/admin/matches/${params.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Connection ended');
        fetchDetail();
      } else {
        toast.error(d.error || 'Failed to end connection');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#8E8E93] text-sm">Match not found</p>
        <button onClick={() => router.push('/admin/matches')} className="btn-secondary text-xs mt-4">
          Back to Matches
        </button>
      </div>
    );
  }

  const days = [1, 2, 3].map((d) => ({
    day: d,
    tasks: submissions.filter((s) => s.day_number === d),
  }));

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => router.push('/admin/matches')}
        className="flex items-center gap-2 text-[#8E8E93] hover:text-[#EDEADE] transition-colors mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Matches
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display text-[#EDEADE] mb-1">
            {match.man?.name} &amp; {match.woman?.name}
          </h1>
          <p className="text-sm text-[#8E8E93]">
            Day {match.current_day} of 3 &middot; {match.status.replace(/_/g, ' ')}
          </p>
        </div>
        {!TERMINAL_STATUSES.includes(match.status) && (
          <button
            onClick={handleEnd}
            disabled={ending}
            className="btn-danger text-sm px-4 flex items-center gap-2 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            End Connection
          </button>
        )}
      </div>

      <div className="space-y-8">
        {days.filter((d) => d.tasks.length > 0).map(({ day, tasks }) => (
          <div key={day}>
            <p className="text-xs text-[#8E8E93] uppercase tracking-widest mb-3">Day {day}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tasks.map((sub) => (
                <SubmissionCard key={sub.id} sub={sub} onModerate={handleModerate} />
              ))}
            </div>
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="empty-state py-16 text-center">
            <p className="text-[#8E8E93] text-sm">No submissions yet for this connection</p>
          </div>
        )}
      </div>
    </div>
  );
}
