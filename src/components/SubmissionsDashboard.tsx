'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ---------- Preview Modal ----------
function PreviewModal({ proofUrl, proofType, onClose }: { proofUrl: string; proofType: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative mx-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold" onClick={onClose}>
          ✕
        </button>
        <div className="flex justify-center items-center mt-4">
          {proofType === 'photo' && (
            <Image src={proofUrl} alt="Proof" width={400} height={400} className="object-contain max-h-[70vh] rounded" />
          )}
          {proofType === 'video' && (
            <video src={proofUrl} controls className="max-w-full max-h-[70vh] rounded" />
          )}
          {proofType === 'voice' && (
            <audio src={proofUrl} controls className="w-full mt-4" />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Actions Component ----------
function SubmissionActions({ submission }: { submission: any }) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleApprove() {
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to approve');
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason) return alert('Please provide a reason');
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/submissions/${submission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: rejectReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to reject');
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBanUser() {
    if (!confirm('Ban the user who submitted?')) return;
    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/users/${submission.user_id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inappropriate submission' }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to ban user');
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <button
        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
        onClick={handleApprove}
        disabled={processing}
      >
        Approve
      </button>
      <button
        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
        onClick={() => setShowReject(true)}
        disabled={processing}
      >
        Reject
      </button>
      <button
        className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
        onClick={handleBanUser}
        disabled={processing}
      >
        Ban User
      </button>
      {submission.connection_id && (
        <Link
          href={`/admin/chat/${submission.connection_id}`}
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm font-medium"
        >
          View Chat
        </Link>
      )}

      {showReject && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h3 className="text-lg font-medium mb-2 text-gray-900">Reject Reason</h3>
            <textarea
              className="w-full border p-2 rounded mb-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a constructive reason..."
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowReject(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleReject}
                disabled={processing}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Client Wrapper Component ----------
export default function SubmissionsDashboard({ initialSubmissions }: { initialSubmissions: any[] }) {
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);

  // Real-time subscription for instant table reload on inserts
  useEffect(() => {
    const channel = supabase.channel('public:submissions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => {
        window.location.reload();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = initialSubmissions.filter((s: any) => {
    if (filter === 'photos') return s.proof_type === 'photo';
    if (filter === 'videos') return s.proof_type === 'video';
    if (filter === 'voice') return s.proof_type === 'voice';
    if (filter === 'old') return new Date(s.created_at).getTime() < Date.now() - 60 * 60 * 1000;
    return true;
  });

  return (
    <section className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Pending Submissions</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'photos', 'videos', 'voice', '>1hr old'].map((f) => (
          <button
            key={f}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              (f === '>1hr old' ? filter === 'old' : filter === f)
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-50 border border-gray-300'
            }`}
            onClick={() => setFilter(f === '>1hr old' ? 'old' : f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Man</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Woman</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No pending submissions found.
                </td>
              </tr>
            ) : (
              filtered.map((s: any) => {
                const ageMs = Date.now() - new Date(s.created_at).getTime();
                const ageLabel =
                  ageMs < 60_000
                    ? `${Math.round(ageMs / 1000)}s ago`
                    : ageMs < 3_600_000
                    ? `${Math.round(ageMs / 60_000)}m ago`
                    : `${Math.round(ageMs / 3_600_000)}h ago`;
                const rowClass = ageMs > 24 * 3_600_000 ? 'bg-red-50' : '';

                return (
                  <tr key={s.id} className={rowClass}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.proof_type === 'photo' ? (
                        <div className="relative w-16 h-16 rounded overflow-hidden cursor-pointer border border-gray-200">
                          <img
                            src={s.proof_url}
                            alt="proof"
                            className="object-cover w-full h-full"
                            onClick={() => setPreview({ url: s.proof_url, type: s.proof_type })}
                          />
                        </div>
                      ) : s.proof_type === 'video' ? (
                        <button
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setPreview({ url: s.proof_url, type: s.proof_type })}
                        >
                          <span>▶️ Video</span>
                        </button>
                      ) : (
                        <button
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => setPreview({ url: s.proof_url, type: s.proof_type })}
                        >
                          <span>🔊 Voice</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold">{s.guest_name || s.profiles?.name || '—'}</div>
                      <div className="text-xs text-gray-500">{s.guest_phone || s.profiles?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {s.host_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {s.day_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {ageLabel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SubmissionActions submission={s} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {preview && (
        <PreviewModal
          proofUrl={preview.url}
          proofType={preview.type}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
