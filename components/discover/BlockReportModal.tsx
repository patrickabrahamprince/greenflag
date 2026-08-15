'use client';

import { useState } from 'react';
import { X, Flag, Ban, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlockReportModalProps {
  profileId: string;
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BlockReportModal({ profileId, profileName, isOpen, onClose }: BlockReportModalProps) {
  const [action, setAction] = useState<'block' | 'report' | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    { value: 'fake_profile', label: 'Fake profile' },
    { value: 'inappropriate_content', label: 'Inappropriate content' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' },
  ];

  const handleBlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_id: profileId }),
      });

      if (!res.ok) throw new Error('Failed to block');
      toast.success(`${profileName} blocked`);
      onClose();
    } catch (err) {
      toast.error('Failed to block user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_id: profileId,
          reason: reportReason,
          details: reportDetails || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to report');
      toast.success('Report submitted');
      onClose();
    } catch (err) {
      toast.error('Failed to submit report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-[100] flex items-end">
      <div className="bg-card w-full rounded-t-2xl p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">What's wrong?</h2>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink active:scale-90 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {!action ? (
          <div className="space-y-3">
            <button
              onClick={() => setAction('report')}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-raised hover:bg-raised/20 active:scale-95 transition-all"
            >
              <Flag size={20} className="text-amber-500" />
              <div className="text-left">
                <p className="font-semibold text-ink">Report {profileName}</p>
                <p className="text-xs text-ink/50">They broke community guidelines</p>
              </div>
            </button>

            <button
              onClick={() => setAction('block')}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-raised hover:bg-raised/20 active:scale-95 transition-all"
            >
              <Ban size={20} className="text-red-500" />
              <div className="text-left">
                <p className="font-semibold text-ink">Block {profileName}</p>
                <p className="text-xs text-ink/50">You won't see them again</p>
              </div>
            </button>
          </div>
        ) : action === 'report' ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 rounded-lg flex gap-2 text-xs text-amber-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>Reports help keep GreenFlag safe. Our team will review this.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink/70">What's the issue?</label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label key={reason.value} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-raised/20">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={reportReason === reason.value}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {reportReason === 'other' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink/70">Tell us more (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="What happened?"
                  maxLength={500}
                  className="w-full bg-raised/50 border border-raised rounded-lg p-3 text-sm text-ink placeholder:text-ink/40 resize-none"
                  rows={3}
                />
                <p className="text-[10px] text-ink/40">{reportDetails.length}/500</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setAction(null)}
                className="flex-1 py-3 rounded-lg bg-raised/50 text-ink font-semibold active:scale-95 transition-transform"
              >
                Back
              </button>
              <button
                onClick={handleReport}
                disabled={loading || !reportReason}
                className="flex-1 py-3 rounded-lg bg-amber-500 text-white font-semibold active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Submit Report'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 rounded-lg flex gap-2 text-xs text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{profileName} won't be able to see your profile or message you.</p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setAction(null)}
                className="flex-1 py-3 rounded-lg bg-raised/50 text-ink font-semibold active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-red-500 text-white font-semibold active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Block'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
