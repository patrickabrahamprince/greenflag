'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['value'];

interface UseBlockReportArgs {
  profileId: string;
  profileName: string;
  onDone: () => void;
}

export function useBlockReport({ profileId, profileName, onDone }: UseBlockReportArgs) {
  const [reportReason, setReportReason] = useState<ReportReason | ''>('');
  const [reportDetails, setReportDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setReportReason('');
    setReportDetails('');
  }, []);

  const handleBlock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_id: profileId }),
      });
      if (!res.ok) throw new Error('Failed to block');
      toast.success(`${profileName} blocked`);
      onDone();
    } catch (err) {
      toast.error('Failed to block user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profileId, profileName, onDone]);

  const handleReport = useCallback(async () => {
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
      onDone();
    } catch (err) {
      toast.error('Failed to submit report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [profileId, reportReason, reportDetails, onDone]);

  return {
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    loading,
    handleBlock,
    handleReport,
    reset,
  };
}
