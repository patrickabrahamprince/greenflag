'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { useProfilePage } from '@/hooks/useProfilePage';
import { ProfileHeroSection } from '@/components/shared/ProfileHeroSection';
import { ProfileInfo } from '@/components/shared/ProfileInfo';
import { ProfileActionBar } from '@/components/shared/ProfileActionBar';
import { ReportModal } from '@/components/shared/ReportModal';
import { BlockConfirmModal } from '@/components/shared/BlockConfirmModal';
import { useScreenshotTarget } from '@/lib/hooks/useScreenshotGuard';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

export default function ViewProfilePage() {
  const params = useParams();
  const {
    user, profile, match, connection, isOwn, loading, connecting,
    photoIdx, setPhotoIdx, showReport, setShowReport,
    reportReason, setReportReason, reportDetails, setReportDetails,
    submittingReport, showBlockConfirm, setShowBlockConfirm, blocking,
    handleMeet, handleReport, handleBlock, refetch, router,
  } = useProfilePage(params.id);

  useScreenshotTarget(!isOwn ? profile?.id : undefined, 'profile');

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(refetch);

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!profile) return null;

  const photos = profile.photos || [];
  const photo = photos[photoIdx] || '';

  return (
    <div
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="h-dvh overflow-y-auto overscroll-none screen-gradient pb-24"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: pullDistance }}
      >
        <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
      </div>
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
