'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileOption {
  id: string;
  name: string;
  persona: string;
}

export default function AdminResetTool() {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIdA, setUserIdA] = useState('');
  const [userIdB, setUserIdB] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users?page=0')
      .then((r) => r.json())
      .then((d) => setProfiles(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  const nameFor = (id: string) => profiles.find((p) => p.id === id)?.name || 'Unknown';

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdA, userIdB }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(
          d.matchesDeleted > 0
            ? `Reset complete: ${d.matchesDeleted} match(es) and ${d.submissionsDeleted} submission(s) cleared.`
            : 'Reset complete: no existing connection was found between them.'
        );
        setConfirming(false);
      } else {
        toast.error(d.error || 'Failed to reset');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <h1 className="text-2xl font-display text-[#EDEADE] mb-1">Master Reset</h1>
      <p className="text-sm text-[#8E8E93] mb-6">
        Pick any two profiles and wipe any match, submissions, and like between them --
        useful for replaying the full Standard flow with the same test accounts.
        Coin balances are left untouched; use Credit Coins on the Users page to top up.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
        </div>
      ) : (
        <div className="card space-y-4">
          <div>
            <label className="block text-sm text-[#8E8E93] mb-2">Profile A</label>
            <select className="input w-full" value={userIdA} onChange={(e) => { setUserIdA(e.target.value); setConfirming(false); }}>
              <option value="">Select a profile...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === userIdB}>
                  {p.name} ({p.persona})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#8E8E93] mb-2">Profile B</label>
            <select className="input w-full" value={userIdB} onChange={(e) => { setUserIdB(e.target.value); setConfirming(false); }}>
              <option value="">Select a profile...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === userIdA}>
                  {p.name} ({p.persona})
                </option>
              ))}
            </select>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={!userIdA || !userIdB}
              className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Connection
            </button>
          ) : (
            <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  This permanently deletes any match, submissions, and like between{' '}
                  <span className="font-medium">{nameFor(userIdA)}</span> and{' '}
                  <span className="font-medium">{nameFor(userIdB)}</span>. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)} className="btn-secondary flex-1 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="btn-danger flex-1 text-sm disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
