'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import type { AdminUser } from '@/components/admin/types';
import { UserFilterBar } from '@/components/admin/UserFilterBar';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserPagination } from '@/components/admin/UserPagination';
import { BanUserModal } from '@/components/admin/BanUserModal';

const PAGE_SIZE = 20;

export default function AdminUsers() {
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
      const res = await fetch(`/api/admin/users/${userId}/set-admin`, { method: 'POST' });
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

      <UserFilterBar
        search={search} gender={gender} status={status}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onGenderChange={(v) => { setGender(v); setPage(0); }}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#00C853]" />
        </div>
      ) : (
        <>
          <UserManagementTable users={users} onSetAdmin={handleSetAdmin} onBanClick={setBanTarget} />

          {users.length === 0 && (
            <div className="empty-state py-16">
              <Search className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
              <p className="text-[#8E8E93] text-sm">No users found</p>
            </div>
          )}

          <UserPagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      {banTarget && (
        <BanUserModal
          user={banTarget} reason={banReason} banning={banning}
          onReasonChange={setBanReason} onConfirm={handleBan}
          onClose={() => { setBanTarget(null); setBanReason(''); }}
        />
      )}
    </div>
  );
}
