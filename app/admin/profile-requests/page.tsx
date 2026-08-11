'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Check, X, UserCog } from 'lucide-react';

interface ProfileRequest {
  id: string;
  user_id: string;
  requested_changes: Record<string, unknown>;
  created_at: string;
  requester: { name: string | null; city: string | null } | { name: string | null; city: string | null }[] | null;
}

function requesterName(r: ProfileRequest): string {
  const requester = Array.isArray(r.requester) ? r.requester[0] : r.requester;
  return requester?.name || 'Unknown';
}

export default function ProfileRequestsPage() {
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    const res = await fetch('/api/admin/profile-requests');
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActingId(id);
    const res = await fetch(`/api/admin/profile-requests/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
    setActingId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <UserCog className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-display">Profile Change Requests</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-well border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">{requesterName(r)}</p>
                  <p className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(r.id, 'approve')}
                    disabled={actingId === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50"
                  >
                    {actingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'reject')}
                    disabled={actingId === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-900/70 bg-gray-200 rounded-lg p-3 space-y-1">
                {Object.entries(r.requested_changes).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-gray-500 w-16 shrink-0">{key}:</span>
                    <span className="break-all">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
