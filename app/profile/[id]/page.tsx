'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProfilePage } from '@/hooks/useProfilePage';
import { ProfileHeroSection } from '@/components/shared/ProfileHeroSection';
import { ProfileInfo } from '@/components/shared/ProfileInfo';
import { ProfileActionBar } from '@/components/shared/ProfileActionBar';
import { ReportModal } from '@/components/shared/ReportModal';

export default function ViewProfilePage() {
  const params = useParams();
  const {
    user, profile, match, connection, isOwn, loading, connecting,
    photoIdx, setPhotoIdx, showReport, setShowReport,
    reportReason, setReportReason, reportDetails, setReportDetails,
    submittingReport, handleMeet, handleReport, router,
  } = useProfilePage(params.id);

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
      <ProfileHeroSection
        photo={photo}
        name={profile.name}
        photos={photos}
        photoIdx={photoIdx}
        isOwn={isOwn}
        onBack={() => router.back()}
        onReport={() => setShowReport(true)}
        onPhotoSelect={setPhotoIdx}
      />
      <ProfileInfo
        name={profile.name}
        age={profile.age}
        bio={profile.bio}
        job={profile.job}
        height={profile.height}
        city_auto={profile.city_auto}
        instagram_url={profile.instagram_url}
        interests={profile.interests}
        matchPercent={match?.percent}
        matchOverlapping={match?.overlapping}
      />
      <div className="px-5">
        <ProfileActionBar
          isOwn={isOwn}
          hasConnection={!!connection}
          isGuest={user?.gender === 'man'}
          connecting={connecting}
          onEdit={() => router.push('/profile')}
          onContinue={() => router.push(`/${profile.name.toLowerCase()}`)}
          onMeet={handleMeet}
        />
      </div>
      <ReportModal
        open={showReport}
        reason={reportReason}
        details={reportDetails}
        submitting={submittingReport}
        onClose={() => { setShowReport(false); setReportReason(''); setReportDetails(''); }}
        onReasonChange={setReportReason}
        onDetailsChange={setReportDetails}
        onSubmit={handleReport}
      />
    </div>
  );
}
