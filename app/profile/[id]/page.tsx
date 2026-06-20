'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Briefcase, Ruler, Instagram, Loader2, Flag, X } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProfileData {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  instagram_url?: string;
  interests: string[];
  looking_for_interests: string[];
  role: string;
  gender: string;
}

interface MatchInfo {
  percent: number;
  overlapping: string[];
  viewerIsHost: boolean;
}

interface ConnectionInfo {
  id: string;
  status: string;
}

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
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
        const res = await fetch(`/api/profile/${params.id}`);
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
  }, [params.id, router]);

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
        router.push(`/connections`);
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
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reported_id: profile!.id, reason: reportReason, details: reportDetails }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Report submitted');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!profile) return null;

  const photos = profile.photos || [];
  const photo = photos[photoIdx] || '';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="relative w-full aspect-[3/4]">
        {photo && (
          <img src={photo} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {!isOwn && (
          <button
            onClick={() => setShowReport(true)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
          >
            <Flag className="w-5 h-5 text-white/60" />
          </button>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === photoIdx ? 'bg-[#D4AF37] w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 -mt-20 relative z-10">
        <div className="flex items-end gap-3 mb-1">
          <h1 className="font-display text-3xl text-[#EDEADE]">
            {profile.name}, {profile.age}
          </h1>
          {match && (
            <div className="flex items-center gap-1 bg-[#D4AF37]/20 backdrop-blur-md rounded-full px-3 py-1">
              <span className="text-[#D4AF37] text-sm font-bold">{match.percent}%</span>
              <span className="text-[#D4AF37]/60 text-xs">
                {match.viewerIsHost ? 'match' : 'match'}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#EDEADE]/60">
          {profile.city_auto && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.city_auto}</span>
            </div>
          )}
          {profile.job && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{profile.job}</span>
            </div>
          )}
          {profile.height && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>{profile.height}</span>
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="text-[#EDEADE]/80 text-sm mt-4 leading-relaxed">{profile.bio}</p>
        )}

        {match && match.overlapping.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-[#EDEADE]/40 uppercase tracking-wider mb-2">Shared Interests</p>
            <div className="flex flex-wrap gap-2">
              {match.overlapping.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full text-xs border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs text-[#EDEADE]/40 uppercase tracking-wider mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">
            {(profile.interests || []).map((interest) => {
              const isMatch = match?.overlapping.includes(interest);
              return (
                <span
                  key={interest}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    isMatch
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'border-white/10 bg-white/5 text-[#EDEADE]/70'
                  }`}
                >
                  {interest}
                </span>
              );
            })}
          </div>
        </div>

        {profile.instagram_url && (
          <a
            href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://instagram.com/${profile.instagram_url.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-4 text-[#EDEADE]/50 hover:text-[#EDEADE]/80 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-sm">{profile.instagram_url}</span>
          </a>
        )}

        <div className="mt-8">
          {isOwn ? (
            <button
              onClick={() => router.push('/profile')}
              className="w-full h-14 rounded-full border border-white/20 bg-white/5 text-[#EDEADE] font-medium backdrop-blur-md active:scale-95 transition-all duration-200"
            >
              Edit Profile
            </button>
          ) : connection ? (
            <button
              onClick={() => router.push(`/${profile.name.toLowerCase()}`)}
              className="w-full h-14 rounded-full bg-[#D4AF37] text-[#0A0A0A] font-medium active:scale-95 transition-all duration-200"
            >
              Continue to Tasks
            </button>
          ) : user?.gender === 'guest' ? (
            <button
              onClick={handleMeet}
              disabled={connecting}
              className="w-full h-14 rounded-full bg-[#D4AF37] text-[#0A0A0A] font-medium active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</>
              ) : (
                'Meet Her Standard'
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full h-14 rounded-full border border-white/10 bg-white/5 text-[#EDEADE]/40 font-medium cursor-not-allowed"
            >
              Awaiting Application
            </button>
          )}
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display text-[#EDEADE]">Report User</h3>
              <button onClick={() => { setShowReport(false); setReportReason(''); setReportDetails(''); }} className="btn-ghost p-1">
                <X className="w-5 h-5 text-[#8E8E93]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8E8E93] mb-2">Reason</label>
                <select
                  className="input"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Fake profile">Fake profile</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8E8E93] mb-2">Details (optional)</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Add any additional context..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
              </div>
              <button
                onClick={handleReport}
                disabled={!reportReason || submittingReport}
                className="btn-primary w-full active:scale-95 disabled:opacity-50"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
