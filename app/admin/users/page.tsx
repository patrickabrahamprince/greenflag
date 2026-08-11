'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import type { AdminUser } from '@/components/admin/types';
import { UserFilterBar } from '@/components/admin/UserFilterBar';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserPagination } from '@/components/admin/UserPagination';
import { BanUserModal } from '@/components/admin/BanUserModal';
import { RejectUserModal } from '@/components/admin/RejectUserModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';

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
  const [rejectTarget, setRejectTarget] = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [settingAdminId, setSettingAdminId] = useState<string | null>(null);

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

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        toast.success('Application approved');
        await fetchUsers();
      } else {
        toast.error(d.error || 'Failed to approve');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/users/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Application rejected');
        setRejectTarget(null);
        setRejectReason('');
        fetchUsers();
      } else {
        toast.error(d.error || 'Failed to reject');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/users/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: deleteTarget.id,
          confirm_admin_purge: !!deleteTarget.is_admin,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('User deleted');
        setDeleteTarget(null);
        setDeleteConfirmText('');
        fetchUsers();
      } else {
        toast.error(d.message || d.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetAdmin = async (userId: string, grant: boolean) => {
    setSettingAdminId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/set-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(grant ? 'Admin role granted' : 'Admin role revoked');
        await fetchUsers();
      } else {
        toast.error(d.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSettingAdminId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-gray-900">Users</h1>
        <span className="text-xs text-gray-500">{total} total</span>
      </div>

      <UserFilterBar
        search={search} gender={gender} status={status}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onGenderChange={(v) => { setGender(v); setPage(0); }}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <UserManagementTable
            users={users}
            onSetAdmin={handleSetAdmin}
            onBanClick={setBanTarget}
            onApproveClick={(u) => handleApprove(u.id)}
            onRejectClick={setRejectTarget}
            onDeleteClick={setDeleteTarget}
            approvingId={approvingId}
            settingAdminId={settingAdminId}
          />

          {users.length === 0 && (
            <div className="empty-state py-16">
              <Search className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No users found</p>
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

      {rejectTarget && (
        <RejectUserModal
          user={rejectTarget} reason={rejectReason} rejecting={rejecting}
          onReasonChange={setRejectReason} onConfirm={handleReject}
          onClose={() => { setRejectTarget(null); setRejectReason(''); }}
        />
      )}

      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget} confirmText={deleteConfirmText} deleting={deleting}
          onConfirmTextChange={setDeleteConfirmText} onConfirm={handleDelete}
          onClose={() => { setDeleteTarget(null); setDeleteConfirmText(''); }}
        />
      )}
    </div>
  );
}
