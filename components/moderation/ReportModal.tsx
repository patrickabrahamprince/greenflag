'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportUser } from '@/lib/supabase/moderation';
import type { ReportReason } from '@/types/moderation';

interface ReportModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake profile' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ userId, open, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await reportUser(userId, reason, details);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Report submitted. Our team will review within 24h.');
    setDetails('');
    setReason('spam');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-[#FAF9F7] rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] text-lg text-[#1A1A1A]">Report User</h3>
          <button onClick={onClose} className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#1A1A1A]/60 mb-2">Reason</label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#E8E6E1] cursor-pointer transition-colors hover:border-[#C9A961]"
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      reason === r.value ? 'border-[#C9A961]' : 'border-[#8E8E93]'
                    }`}
                  >
                    {reason === r.value && <span className="w-2 h-2 rounded-full bg-[#C9A961]" />}
                  </span>
                  <span className="text-sm text-[#1A1A1A]">{r.label}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#1A1A1A]/60 mb-2">Details (optional)</label>
            <textarea
              className="w-full rounded-xl border border-[#E8E6E1] bg-transparent px-3 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 min-h-[80px] resize-none focus:outline-none focus:border-[#C9A961]"
              placeholder="Add any additional context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-[#C9A961] text-white text-xs font-medium uppercase tracking-wide active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
