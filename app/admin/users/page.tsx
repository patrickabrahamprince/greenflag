'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Eye, LayoutDashboard, Trash2, AlertTriangle, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: '1', name: 'Aarav Sharma', phone: '+91 98765 43210', email: 'aarav@example.com', created_at: '2026-06-01T10:00:00Z', role: 'guest', wallet_balance: 15 },
  { id: '2', name: 'Ananya Gupta', phone: '+91 98765 43211', email: 'ananya@example.com', created_at: '2026-06-02T11:00:00Z', role: 'host', wallet_balance: 0 },
  { id: '3', name: 'Rohan Patel', phone: '+91 98765 43212', email: 'rohan@example.com', created_at: '2026-06-03T12:00:00Z', role: 'guest', wallet_balance: 5 },
  { id: '4', name: 'Ishita Verma', phone: '+91 98765 43213', email: 'ishita@example.com', created_at: '2026-06-04T13:00:00Z', role: 'host', wallet_balance: 50 },
  { id: '5', name: 'Karan Singh', phone: '+91 98765 43214', email: 'karan@example.com', created_at: '2026-06-05T14:00:00Z', role: 'guest', wallet_balance: 10 },
  { id: '6', name: 'Maya Joshi', phone: '+91 98765 43215', email: 'maya@example.com', created_at: '2026-06-06T15:00:00Z', role: 'guest', wallet_balance: 0 },
  { id: '7', name: 'Arjun Nair', phone: '+91 98765 43216', email: 'arjun@example.com', created_at: '2026-06-07T16:00:00Z', role: 'host', wallet_balance: 120 },
  { id: '8', name: 'Diya Malhotra', phone: '+91 98765 43217', email: 'diya@example.com', created_at: '2026-06-08T17:00:00Z', role: 'guest', wallet_balance: 3 },
  { id: '9', name: 'Vivaan Kapoor', phone: '+91 98765 43218', email: 'vivaan@example.com', created_at: '2026-06-09T18:00:00Z', role: 'host', wallet_balance: 200 },
  { id: '10', name: 'Sara Khan', phone: '+91 98765 43219', email: 'sara@example.com', created_at: '2026-06-10T19:00:00Z', role: 'guest', wallet_balance: 25 },
];

export default function AdminUsers() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [purging, setPurging] = useState(false);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const openDelete = (userId: string) => {
    setDeleting(userId);
    setConfirmInput('');
  };

  const closeDelete = () => {
    setDeleting(null);
    setConfirmInput('');
  };

  const targetUser = deleting ? users.find((u) => u.id === deleting) : null;
  const confirmMatch = confirmInput === targetUser?.phone;

  const handlePurge = async () => {
    if (!deleting || !confirmMatch) return;
    setPurging(true);
    try {
      const res = await fetch('/api/admin/users/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: deleting }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted ${data.deleted_tables.length} tables`);
        setUsers((prev) => prev.filter((u) => u.id !== deleting));
        closeDelete();
      } else {
        toast.error(data.error || 'Purge failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Users</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          className="input pl-10"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase border-b border-border">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Joined</th>
              <th className="text-left py-3 px-2">Role</th>
              <th className="text-right py-3 px-2">Coins</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-surface/50">
                <td className="py-3 px-2 text-white font-medium">{user.name}</td>
                <td className="py-3 px-2 text-muted text-xs">{user.phone}</td>
                <td className="py-3 px-2 text-muted text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs capitalize">{user.role}</span>
                </td>
                <td className="py-3 px-2 text-right text-white">{user.wallet_balance}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 justify-end">
                    {user.role === 'host' && (
                      <button
                        onClick={() => router.push(`/admin/host-dashboard/${user.id}`)}
                        className="btn-ghost text-xs p-1.5 text-gold"
                        title="View Dashboard"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className="btn-ghost text-xs p-1.5" title="View Data">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDelete(user.id)}
                      className="btn-ghost text-xs p-1.5 text-red-500 hover:text-red-400"
                      title="Hard Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state py-16">
          <Search className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No users found</p>
        </div>
      )}

      {deleting && targetUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-display text-white">Hard Delete User</h3>
              </div>
              <button onClick={closeDelete} className="btn-ghost p-1">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-400 font-medium mb-1">This deletes ALL data for:</p>
              <p className="text-white font-medium">{targetUser.phone}</p>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-muted">
                This action <span className="text-red-400">cannot be undone</span>. It will permanently delete:
              </p>
              <ul className="text-xs text-muted space-y-1 ml-4 list-disc">
                <li>Profile photos from storage</li>
                <li>All submissions and messages</li>
                <li>All connections and transactions</li>
                <li>Wallet balance and profile</li>
                <li>The user account itself</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">
                Type <span className="text-white font-mono">{targetUser.phone}</span> to confirm:
              </label>
              <input
                className="input"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={targetUser.phone}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeDelete} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={!confirmMatch || purging}
                className="btn-danger flex-1 text-sm"
              >
                {purging ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
