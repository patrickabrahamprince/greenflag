'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';
import type { ProfileData, MatchInfo, ConnectionInfo } from '@/components/shared/profile-types';

export function useProfilePage(id: string | string[]) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [isOwn, setIsOwn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
          setMatch(data.match);
          setConnection(data.connection);
          setIsOwn(data.isOwnProfile);
        } else {
          toast.error('Profile not found');
          router.back();
        }
      } catch {
        toast.error('Failed to load profile');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, router]);

  const handleMeet = async () => {
    if (!profile) return;
    setConnecting(true);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: profile.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error === 'insufficient_funds') {
          toast.error('Not enough coins');
          router.push('/coins');
          return;
        }
        throw new Error(err.error || 'Failed to like profile');
      }
      const { matchId } = await res.json();
      if (matchId) {
        router.push(`/task/${matchId}`);
      } else {
        toast.success("You've met her Standard");
        router.back();
      }
    } catch (e) {
      toast.error((e as Error).message || 'Something went wrong');
    } finally {
      setConnecting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) { toast.error('Select a reason'); return; }
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reported_id: profile!.id, reason: reportReason, details: reportDetails }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Report submitted. Our team will review within 24h.');
        setShowReport(false);
        setReportReason('');
        setReportDetails('');
      } else {
        toast.error(d.error || 'Failed to submit');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingReport(false);
    }
  };

  return {
    user,
    profile,
    match,
    connection,
    isOwn,
    loading,
    connecting,
    photoIdx,
    setPhotoIdx,
    showReport,
    setShowReport,
    reportReason,
    setReportReason,
    reportDetails,
    setReportDetails,
    submittingReport,
    handleMeet,
    handleReport,
    router,
  };
}
