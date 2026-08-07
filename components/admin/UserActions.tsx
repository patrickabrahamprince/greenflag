'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle, Coins, Check, UserX, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface UserActionsProps {
  userId: string;
  userName: string;
  isBanned: boolean;
  isAdmin?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  onRefresh: () => void;
}

export function UserActions({ userId, userName, isBanned, isAdmin, approvalStatus, onRefresh }: UserActionsProps) {
  const router = useRouter();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDesc, setCreditDesc] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      const d = await res.json();
      if (d.success) { toast.success('Application approved'); onRefresh(); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const d = await res.json();
      if (d.success) { toast.success('Application rejected'); setShowRejectModal(false); setRejectReason(''); onRefresh(); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleBan = async () => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const d = await res.json();
      if (d.success) { toast.success('User banned'); onRefresh(); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, { method: 'POST' });
      const d = await res.json();
      if (d.success) { toast.success('User unbanned'); onRefresh(); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, confirm_admin_purge: !!isAdmin }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('User deleted');
        router.push('/admin/users');
      } else {
        toast.error(d.message || d.error || 'Failed');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleCredit = async () => {
    const amount = parseInt(creditAmount, 10);
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/credit-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description: creditDesc.trim() || 'Admin credit' }),
      });
      const d = await res.json();
      if (d.success) { toast.success(`Credited ${amount} coins`); setShowCreditModal(false); setCreditAmount(''); setCreditDesc(''); onRefresh(); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {approvalStatus === 'pending' && (
          <>
            <button onClick={handleApprove} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50">
              <Check className="w-3.5 h-3.5" /> Approve Application
            </button>
            <button onClick={() => setShowRejectModal(true)} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
              <UserX className="w-3.5 h-3.5" /> Reject Application
            </button>
          </>
        )}
        {isBanned ? (
          <button onClick={handleUnban} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" /> Unban
          </button>
        ) : (
          <button onClick={handleBan} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
            <Ban className="w-3.5 h-3.5" /> Ban
          </button>
        )}
        <button onClick={() => setShowCreditModal(true)} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-[#C9A961]/10 text-[#C9A961] rounded-xl text-xs font-medium hover:bg-[#C9A961]/20 transition-colors disabled:opacity-50">
          <Coins className="w-3.5 h-3.5" /> Credit Coins
        </button>
        <button onClick={() => setShowDeleteModal(true)} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 text-red-500 rounded-xl text-xs font-medium hover:bg-red-600/20 transition-colors disabled:opacity-50">
          <Trash2 className="w-3.5 h-3.5" /> Delete User
        </button>
      </div>

      {showCreditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="dialog-card max-w-md w-full">
            <h3 className="text-lg font-display text-[#EDEADE] mb-4">Credit Coins</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Amount</label>
                <input type="number" className="input w-full" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1">Description</label>
                <input className="input w-full" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} placeholder="e.g. Admin credit" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreditModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleCredit} disabled={!creditAmount || loading} className="btn-primary flex-1 text-sm disabled:opacity-50">Credit</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="dialog-card max-w-md w-full">
            <h3 className="text-lg font-display text-[#EDEADE] mb-4">Reject Application</h3>
            <div className="mb-4">
              <label className="block text-xs text-[#8E8E93] mb-1">Reason *</label>
              <textarea
                className="input min-h-[80px] resize-none w-full"
                placeholder="e.g. Instagram doesn't match photos, incomplete profile..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || loading} className="btn-danger flex-1 text-sm disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="dialog-card max-w-md w-full">
            <h3 className="text-lg font-display text-[#EDEADE] mb-2">Delete User</h3>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Permanently removes {userName}&apos;s account, profile, photos, matches,
                messages, wallet, and transaction history. This cannot be undone.
              </p>
              {isAdmin && <p className="text-xs text-red-400 font-medium mt-2">This account is an admin.</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm text-[#8E8E93] mb-2">
                Type <span className="text-[#EDEADE] font-medium">{userName}</span> to confirm
              </label>
              <input
                className="input w-full"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={userName}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText.trim() !== userName.trim() || loading}
                className="btn-danger flex-1 text-sm disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
