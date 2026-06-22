'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoinStore, useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';
import type { ProfileData, MatchInfo, ConnectionInfo } from '@/components/shared/profile-types';

export function useProfilePage(id: string | string[]) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
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
    if (balance < 5) {
      toast.error('Not enough coins');
      router.push('/coins');
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: profile.id }),
      });
      const data = await res.json();
      if (data.error === 'insufficient_funds') {
        toast.error('Not enough coins');
        router.push('/coins');
        return;
      }
      if (data.success) {
        useCoinStore.getState().deduct(5);
        toast.success('Connection started!');
        router.push('/connections');
      } else {
        toast.error('Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
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
