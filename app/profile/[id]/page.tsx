'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useProfilePage } from '@/hooks/useProfilePage';
import { ProfileHeroSection } from '@/components/shared/ProfileHeroSection';
import { ProfileInfo } from '@/components/shared/ProfileInfo';
import { ProfileActionBar } from '@/components/shared/ProfileActionBar';
import { ReportModal } from '@/components/shared/ReportModal';
import { BlockConfirmModal } from '@/components/shared/BlockConfirmModal';
import { useScreenshotTarget } from '@/lib/hooks/useScreenshotGuard';

export default function ViewProfilePage() {
  const params = useParams();
  const {
    user, profile, match, connection, isOwn, loading, connecting,
    photoIdx, setPhotoIdx, showReport, setShowReport,
    reportReason, setReportReason, reportDetails, setReportDetails,
    submittingReport, showBlockConfirm, setShowBlockConfirm, blocking,
    handleMeet, handleReport, handleBlock, router,
  } = useProfilePage(params.id);

  useScreenshotTarget(!isOwn ? profile?.id : undefined, 'profile');

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!profile) return null;

  const photos = profile.photos || [];
  const photo = photos[photoIdx] || '';

  return (
    <div className="min-h-dvh screen-gradient pb-24">
      <ProfileHeroSection
        photo={photo}
        name={profile.name}
        photos={photos}
        photoIdx={photoIdx}
        isOwn={isOwn}
        onBack={() => router.back()}
        onReport={() => setShowReport(true)}
        onBlock={() => setShowBlockConfirm(true)}
        onPhotoSelect={setPhotoIdx}
      />
      <ProfileInfo
        name={profile.name}
        age={profile.age}
        bio={profile.bio}
        job={profile.job}
        height={profile.height}
        city_auto={profile.city_auto}
        interests={profile.interests}
        lookingForInterests={profile.looking_for_interests}
        quizAnswers={profile.quiz_answers}
        matchPercent={match?.percent}
        matchOverlapping={match?.overlapping}
        teaserPrompt={profile.teaser_prompt}
        teaserAnswer={profile.teaser_answer}
      />
      <div className="px-8 pb-6">
        <ProfileActionBar
          isOwn={isOwn}
          hasConnection={!!connection}
          isGuest={user?.persona === 'man'}
          connecting={connecting}
          onEdit={() => router.push('/profile')}
          onContinue={() => connection && router.push(`/task/${connection.id}`)}
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
      <BlockConfirmModal
        open={showBlockConfirm}
        name={profile.name}
        blocking={blocking}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleBlock}
      />
    </div>
  );
}
