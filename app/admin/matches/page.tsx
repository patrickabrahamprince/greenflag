'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Ban, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface MatchListItem {
  id: string;
  currentDay: number;
  status: string;
  chatUnlocked: boolean;
  createdAt: string;
  man: { id?: string; name: string; photo: string | null };
  woman: { id?: string; name: string; photo: string | null };
  submissionCounts: { total: number; approved: number; flagged: number };
}

const STATUS_STYLES: Record<string, string> = {
  pending_submission: 'bg-blue-500/10 text-blue-400',
  pending_review: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  expired_no_submission: 'bg-red-500/10 text-red-400',
  refunded: 'bg-gray-500/10 text-gray-500',
};

const TERMINAL_STATUSES = ['completed', 'rejected', 'expired_no_submission', 'refunded'];

function PersonCell({ person }: { person: { name: string; photo: string | null } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {person.photo ? (
          <Image src={person.photo} alt="" width={32} height={32} className="w-full h-full object-cover" onError={() => {}} />
        ) : (
          <span className="text-xs text-gray-500">{person.name?.[0]}</span>
        )}
      </div>
      <span className="text-gray-900 text-xs truncate">{person.name}</span>
    </div>
  );
}

export default function AdminMatches() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [endingId, setEndingId] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matches');
      const d = await res.json();
      if (d.matches) setMatches(d.matches);
    } catch {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleEnd = async (id: string) => {
    const reason = prompt('Reason for ending this connection (shown to both parties):');
    if (reason === null) return;
    setEndingId(id);
    try {
      const res = await fetch(`/api/admin/matches/${id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Connection ended');
        fetchMatches();
      } else {
        toast.error(d.error || 'Failed to end connection');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setEndingId(null);
    }
  };

  const filtered = statusFilter ? matches.filter((m) => m.status === statusFilter) : matches;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-gray-900">Match Moderation</h1>
        <span className="text-xs text-gray-500">{matches.length} total</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="input-light max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending_submission">Pending Submission</option>
          <option value="pending_review">Pending Review</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="expired_no_submission">Expired</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state py-16 text-center">
          <Search className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No matches found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-200">
                <th className="text-left py-3 px-2">Man</th>
                <th className="text-left py-3 px-2">Woman</th>
                <th className="text-left py-3 px-2">Day</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2 hidden md:table-cell">Submissions</th>
                <th className="text-left py-3 px-2 hidden md:table-cell">Started</th>
                <th className="text-right py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-2"><PersonCell person={m.man} /></td>
                  <td className="py-3 px-2"><PersonCell person={m.woman} /></td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{m.currentDay} / 3</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[m.status] || 'bg-gray-50 text-gray-500'}`}>
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
                    {m.submissionCounts.approved}/{m.submissionCounts.total} approved
                    {m.submissionCounts.flagged > 0 && (
                      <span className="text-red-400 ml-1">&middot; {m.submissionCounts.flagged} flagged</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => router.push(`/admin/matches/${m.id}`)}
                        className="btn-ghost text-xs p-1.5"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {!TERMINAL_STATUSES.includes(m.status) && (
                        <button
                          onClick={() => handleEnd(m.id)}
                          disabled={endingId === m.id}
                          className="btn-ghost text-xs p-1.5 text-red-400 disabled:opacity-50"
                          title="End Connection"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
