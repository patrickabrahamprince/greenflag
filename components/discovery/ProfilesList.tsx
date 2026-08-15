'use client';

import { ProfileCard } from './ProfileCard';

interface DiscoverProfile {
  id: string;
  name: string;
  age?: number;
  city?: string;
  city_auto?: string;
  bio?: string;
  job?: string;
  height?: string;
  photos?: string[];
  interests?: string[];
  interests_have?: string[];
  looking_for_interests?: string[];
  interests_looking_for?: string[];
  blur_key?: string;
  instagram_url?: string;
  match_percentage?: number;
  match_reasons?: string[];
  photosUnlocked?: boolean;
}

interface ProfilesListProps {
  profiles: DiscoverProfile[];
  persona?: string;
  prefersReducedMotion: boolean;
  cardPhotoIdx: Record<string, number>;
  failedPhotoUrls: Set<string>;
  unlockedPhotoIds: Set<string>;
  expandedBios: Set<string>;
  interestCounts: Record<string, number>;
  cardTouchStart: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  lastProfileRef: React.RefObject<HTMLDivElement>;
  onPhotoChange: (profileId: string, idx: number) => void;
  onPhotoFailed: (url: string) => void;
  onBioToggle: (profileId: string) => void;
  onPhotoUnlockClick: (profileId: string) => void;
  onBegin: (profileId: string) => void;
  onNudge: (profileId: string) => void;
  onGift: (profileId: string) => void;
  onMoreOptions: (profileId: string, name: string) => void;
}

export function ProfilesList({
  profiles,
  persona,
  prefersReducedMotion,
  cardPhotoIdx,
  failedPhotoUrls,
  unlockedPhotoIds,
  expandedBios,
  interestCounts,
  cardTouchStart,
  lastProfileRef,
  onPhotoChange,
  onPhotoFailed,
  onBioToggle,
  onPhotoUnlockClick,
  onBegin,
  onNudge,
  onGift,
  onMoreOptions,
}: ProfilesListProps) {
  return (
    <>
      {profiles.map((p, i) => (
        <div key={p.id} ref={i === profiles.length - 1 ? lastProfileRef : null} data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}>
          <ProfileCard
            profile={p}
            persona={persona}
            prefersReducedMotion={prefersReducedMotion}
            cardPhotoIdx={cardPhotoIdx}
            failedPhotoUrls={failedPhotoUrls}
            unlockedPhotoIds={unlockedPhotoIds}
            expandedBios={expandedBios}
            interestCounts={interestCounts}
            cardTouchStart={cardTouchStart}
            onPhotoChange={onPhotoChange}
            onPhotoFailed={onPhotoFailed}
            onBioToggle={onBioToggle}
            onPhotoUnlockClick={onPhotoUnlockClick}
            onBegin={onBegin}
            onNudge={onNudge}
            onGift={onGift}
            onMoreOptions={(profileId) => onMoreOptions(profileId, p.name)}
          />
        </div>
      ))}
    </>
  );
}
