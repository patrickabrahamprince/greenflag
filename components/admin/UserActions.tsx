'use client';

import { useState } from 'react';
import { Ban, CheckCircle, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export interface UserActionsProps {
  userId: string;
  isBanned: boolean;
  onRefresh: () => void;
}

export function UserActions({ userId, isBanned, onRefresh }: UserActionsProps) {
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDesc, setCreditDesc] = useState('');
  const [loading, setLoading] = useState(false);

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
        {isBanned ? (
          <button onClick={handleUnban} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" /> Unban
          </button>
        ) : (
          <button onClick={handleBan} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
            <Ban className="w-3.5 h-3.5" /> Ban
          </button>
        )}
        <button onClick={() => setShowCreditModal(true)} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-[#00C853]/10 text-[#00C853] rounded-xl text-xs font-medium hover:bg-[#00C853]/20 transition-colors disabled:opacity-50">
          <Coins className="w-3.5 h-3.5" /> Credit Coins
        </button>
      </div>

      {showCreditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 max-w-md w-full">
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
    </>
  );
}
