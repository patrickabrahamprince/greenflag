'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileOption {
  id: string;
  name: string;
  persona: string;
}

const NUKE_CONFIRM_PHRASE = 'DELETE ALL USERS';

export default function AdminResetTool() {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIdA, setUserIdA] = useState('');
  const [userIdB, setUserIdB] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showNukePanel, setShowNukePanel] = useState(false);
  const [nukeConfirmText, setNukeConfirmText] = useState('');
  const [nuking, setNuking] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users?page=0')
      .then((r) => r.json())
      .then((d) => setProfiles(d.users || []))
      .finally(() => setLoading(false));
  }, []);

  const nameFor = (id: string) => profiles.find((p) => p.id === id)?.name || 'Unknown';

  const handleNukeAll = async () => {
    setNuking(true);
    try {
      const res = await fetch('/api/admin/nuke-all-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: nukeConfirmText.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Wiped ${d.deletedUsers} account(s). Admin accounts were left untouched.`);
        setShowNukePanel(false);
        setNukeConfirmText('');
      } else {
        toast.error(d.error || 'Failed to wipe data');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setNuking(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      <h1 className="text-2xl font-display text-gray-900 mb-1">Master Reset</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pick any two profiles and wipe any match, submissions, and like between them --
        useful for replaying the full Standard flow with the same test accounts.
        Coin balances are left untouched; use Credit Coins on the Users page to top up.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="card space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Profile A</label>
            <select className="input-light w-full" value={userIdA} onChange={(e) => { setUserIdA(e.target.value); setConfirming(false); }}>
              <option value="">Select a profile...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === userIdB}>
                  {p.name} ({p.persona})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">Profile B</label>
            <select className="input-light w-full" value={userIdB} onChange={(e) => { setUserIdB(e.target.value); setConfirming(false); }}>
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

      <div className="mt-10 pt-6 border-t border-red-500/20">
        <h2 className="text-lg font-display text-red-400 mb-1 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently wipes every non-admin account on the platform: profiles, preferences,
          photos, videos, matches, messages, wallets, and every other trace of their activity.
          Admin accounts are left untouched. There is no undo.
        </p>

        {!showNukePanel ? (
          <button
            onClick={() => setShowNukePanel(true)}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete All User Data
          </button>
        ) : (
          <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">
                This deletes every non-admin user's profile, photos, videos, standards, matches,
                messages, coins, and connections platform-wide, and removes their login entirely.
                This cannot be undone.
              </p>
            </div>
            <label className="block text-sm text-gray-500 mb-2">
              Type <span className="text-gray-900 font-medium">{NUKE_CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              className="input-light w-full mb-3"
              value={nukeConfirmText}
              onChange={(e) => setNukeConfirmText(e.target.value)}
              placeholder={NUKE_CONFIRM_PHRASE}
              autoComplete="off"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNukePanel(false); setNukeConfirmText(''); }}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleNukeAll}
                disabled={nukeConfirmText.trim() !== NUKE_CONFIRM_PHRASE || nuking}
                className="btn-danger flex-1 text-sm disabled:opacity-50"
              >
                {nuking ? 'Wiping...' : 'Permanently Wipe All Users'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
