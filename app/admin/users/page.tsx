'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Eye, LayoutDashboard, Ban, Shield, X, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  city_auto?: string;
  created_at: string;
  last_active?: string;
  is_banned: boolean;
  is_admin: boolean;
  photos: string[];
  email: string;
  role: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (gender) params.set('gender', gender);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      const res = await fetch(`/api/admin/users?${params}`);
      const d = await res.json();
      if (d.users) { setUsers(d.users); setTotal(d.total); }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, gender, status, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async () => {
    if (!banTarget || !banReason.trim()) return;
    setBanning(true);
    try {
      const res = await fetch(`/api/admin/users/${banTarget.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('User banned');
        setBanTarget(null);
        setBanReason('');
        fetchUsers();
      } else {
        toast.error(d.error || 'Failed to ban');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setBanning(false);
    }
  };

  const handleSetAdmin = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/set-admin`, {
        method: 'POST',
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Admin role granted');
        fetchUsers();
      } else {
        toast.error(d.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-[#EDEADE]">Users</h1>
        <span className="text-xs text-[#8E8E93]">{total} total</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <input
            className="input pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input max-w-[130px]"
          value={gender}
          onChange={(e) => { setGender(e.target.value); setPage(0); }}
        >
          <option value="">All genders</option>
          <option value="host">Host</option>
          <option value="guest">Guest</option>
        </select>
        <select
          className="input max-w-[130px]"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#8E8E93] text-xs uppercase border-b border-white/10">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Gender</th>
                  <th className="text-left py-3 px-2">City</th>
                  <th className="text-left py-3 px-2">Joined</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Debug</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {u.photos?.[0] ? (
                            <img src={u.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-[#8E8E93]">{u.name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[#EDEADE] font-medium text-xs">{u.name}</p>
                          <p className="text-[#8E8E93] text-[10px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-[#8E8E93] text-xs capitalize">{u.gender}</td>
                    <td className="py-3 px-2 text-[#8E8E93] text-xs">{u.city_auto || '-'}</td>
                    <td className="py-3 px-2 text-[#8E8E93] text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      {u.is_banned ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Banned</span>
                      ) : u.is_admin ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">Admin</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => router.push(`/admin/users/${u.id}/matches`)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                      >
                        View Matches
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => router.push(`/profile/${u.id}`)}
                          className="btn-ghost text-xs p-1.5"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {u.role === 'host' && (
                          <button
                            onClick={() => router.push(`/admin/host-dashboard/${u.id}`)}
                            className="btn-ghost text-xs p-1.5 text-[#D4AF37]"
                            title="Host Dashboard"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!u.is_admin && (
                          <button
                            onClick={() => handleSetAdmin(u.id)}
                            className="btn-ghost text-xs p-1.5 text-blue-400"
                            title="Make Admin"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!u.is_banned && (
                          <button
                            onClick={() => setBanTarget(u)}
                            className="btn-ghost text-xs p-1.5 text-red-400"
                            title="Ban User"
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

          {users.length === 0 && (
            <div className="empty-state py-16">
              <Search className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
              <p className="text-[#8E8E93] text-sm">No users found</p>
            </div>
          )}

          {total > 20 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary text-xs py-2 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs text-[#8E8E93]">
                Page {page + 1} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * 20 >= total}
                className="btn-secondary text-xs py-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {banTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-display text-[#EDEADE]">Ban User</h3>
              </div>
              <button onClick={() => { setBanTarget(null); setBanReason(''); }} className="btn-ghost p-1">
                <X className="w-5 h-5 text-[#8E8E93]" />
              </button>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-400 font-medium mb-1">You are banning:</p>
              <p className="text-[#EDEADE] font-medium">{banTarget.name} ({banTarget.email})</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-[#8E8E93] mb-2">Reason for ban *</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="e.g. Fake profile, inappropriate behavior..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setBanTarget(null); setBanReason(''); }}
                className="btn-secondary flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim() || banning}
                className="btn-danger flex-1 text-sm"
              >
                {banning ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
