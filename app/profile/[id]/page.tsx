'use client';

import { useParams } from 'next/navigation';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { useProfilePage } from '@/hooks/useProfilePage';
import { ProfileHeroSection } from '@/components/shared/ProfileHeroSection';
import { ProfileInfo } from '@/components/shared/ProfileInfo';
import { ProfileActionBar } from '@/components/shared/ProfileActionBar';
import { ReportModal } from '@/components/shared/ReportModal';
import { BlockConfirmModal } from '@/components/shared/BlockConfirmModal';
import { useScreenshotTarget } from '@/lib/hooks/useScreenshotGuard';

export default function ViewProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id || "");
  const {
    user, profile, match, connection, isOwn, loading, connecting,
    showReport, setShowReport,
    reportReason, setReportReason, reportDetails, setReportDetails,
    submittingReport, showBlockConfirm, setShowBlockConfirm, blocking,
    handleMeet, handleReport, handleBlock, router,
  } = useProfilePage(id);

  useScreenshotTarget(!isOwn ? profile?.id : undefined, 'profile');

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!profile) return null;

  const photos = profile.photos || [];

  return (
    <div className="h-dvh overflow-y-auto overscroll-none screen-gradient pb-24">
      <ProfileHeroSection
        name={profile.name}
        photos={photos}
        isOwn={isOwn}
        onBack={() => router.back()}
        onReport={() => setShowReport(true)}
        onBlock={() => setShowBlockConfirm(true)}
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
        smoking={profile.smoking}
        drinking={profile.drinking}
        pets={profile.pets}
        workout={profile.workout}
        zodiac={profile.zodiac}
        educationLevel={profile.education_level}
        familyPlans={profile.family_plans}
        communicationStyle={profile.communication_style}
        anthemTitle={profile.anthem_title}
        anthemArtist={profile.anthem_artist}
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
