'use client';

import { useState } from 'react';
import { Lock, Instagram, Briefcase, Ruler, Heart, ChevronLeft, ChevronRight, MapPin, ImageOff, Flag, MoreVertical } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

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

interface ProfileCardProps {
  profile: DiscoverProfile;
  persona?: string;
  prefersReducedMotion: boolean;
  cardPhotoIdx: Record<string, number>;
  failedPhotoUrls: Set<string>;
  unlockedPhotoIds: Set<string>;
  expandedBios: Set<string>;
  interestCounts: Record<string, number>;
  cardTouchStart: React.MutableRefObject<Record<string, { x: number; y: number }>>;
  onPhotoChange: (profileId: string, idx: number) => void;
  onPhotoFailed: (url: string) => void;
  onBioToggle: (profileId: string) => void;
  onPhotoUnlockClick: (profileId: string) => void;
  onBegin: (profileId: string) => void;
  onNudge: (profileId: string) => void;
  onGift: (profileId: string) => void;
  onMoreOptions: (profileId: string) => void;
}

export function ProfileCard({
  profile: p,
  persona,
  prefersReducedMotion,
  cardPhotoIdx,
  failedPhotoUrls,
  unlockedPhotoIds,
  expandedBios,
  interestCounts,
  cardTouchStart,
  onPhotoChange,
  onPhotoFailed,
  onBioToggle,
  onPhotoUnlockClick,
  onBegin,
  onNudge,
  onGift,
  onMoreOptions,
}: ProfileCardProps) {
  const photos = (p.photos ?? []).filter(Boolean) as string[];
  const total = photos.length;
  const idx = total > 0 ? ((cardPhotoIdx[p.id] ?? 0) % total + total) % total : 0;
  const src = photos[idx];
  const isPhotosUnlocked = persona === 'woman' || !!p.photosUnlocked || unlockedPhotoIds.has(p.id);
  const isLocked = idx > 0 && !isPhotosUnlocked;

  const goTo = (nextIdx: number) => {
    if (total <= 1) return;
    onPhotoChange(p.id, ((nextIdx % total) + total) % total);
  };

  const MAX_CARD_TAGS = 5;
  const shownInterests = (p.interests_have?.length ? p.interests_have : p.interests ?? []).slice(0, MAX_CARD_TAGS);
  const lookingFor = (p.interests_looking_for?.length ? p.interests_looking_for : p.looking_for_interests ?? [])
    .filter((interest) => !shownInterests.includes(interest))
    .slice(0, Math.max(0, MAX_CARD_TAGS - shownInterests.length));

  return (
    <div className={`snap-start snap-always h-dvh w-full relative overflow-hidden ${prefersReducedMotion ? '' : 'animate-card-enter'}`}>
      <div className="absolute inset-0 bg-black">
        <div
          className="relative w-full h-full overflow-hidden"
          onTouchStart={(e) => {
            cardTouchStart.current[p.id] = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
          onTouchEnd={(e) => {
            const start = cardTouchStart.current[p.id];
            delete cardTouchStart.current[p.id];
            if (!start) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
              goTo(idx + (dx > 0 ? -1 : 1));
            }
          }}
        >
          {!src || failedPhotoUrls.has(src) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-well">
              <ImageOff className="w-9 h-9 text-ink/25" />
              <span className="text-ink/30 text-xs font-medium">No photo available</span>
            </div>
          ) : (
            <img
              src={src}
              alt=""
              className={`w-full h-full object-cover ${isLocked ? 'blur scale-110' : ''}`}
              onError={() => src && onPhotoFailed(src)}
            />
          )}

          {isLocked && (
            <button
              onClick={() => { hapticTap(); onPhotoUnlockClick(p.id); }}
              aria-label="Unlock"
              className="glass-surface absolute inset-0 m-auto z-20 flex items-center justify-center gap-1.5 h-9 w-fit px-4 rounded-full active:scale-95 transition-all shadow-lg"
            >
              <Lock className="w-3.5 h-3.5 text-ink shrink-0" />
              <span className="text-ink text-xs uppercase tracking-wide font-display font-bold whitespace-nowrap">Unlock Photos</span>
            </button>
          )}

          {total > 1 && (
            <>
              <div className="absolute top-safe-top inset-x-3 z-10 flex gap-1 pt-3">
                {photos.map((_, segIdx) => (
                  <div key={segIdx} className="flex-1 h-1 rounded-full bg-ink/20 shadow-[0_0_2px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-200"
                      style={{ width: segIdx <= idx ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx - 1); }}
                aria-label="Previous photo"
                className="absolute left-2 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-ink" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx + 1); }}
                aria-label="Next photo"
                className="absolute right-2 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-ink" />
              </button>
            </>
          )}

          {typeof p.match_percentage === 'number' && (
            <div className="absolute top-safe-top right-3 mt-8 z-10 flex flex-col items-end gap-1">
              <div className="bg-gold flex items-center gap-1 rounded-pill pl-2 pr-2.5 py-1">
                <Flag className="w-3 h-3 text-ink" fill="currentColor" />
                <span className="font-display font-bold text-ink text-xs whitespace-nowrap">
                  {p.match_percentage}%
                </span>
              </div>
              {persona === 'woman' && !!interestCounts[p.id] && (
                <span className="glass-surface rounded-full px-3 py-1 text-ink/80 text-[11px] whitespace-nowrap">
                  Intention from {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'person' : 'people'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-md pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
          maskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-32 pt-10">
        <div>
          <h1 className="font-display text-title text-ink leading-none">
            {p.name}{p.age ? `, ${p.age}` : ''}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {p.city_auto && (
              <p className="flex items-center gap-1 font-sans text-label text-ink/70 leading-none">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {p.city_auto}
              </p>
            )}
            {p.instagram_url && (
              <a
                href={p.instagram_url.startsWith('http') ? p.instagram_url : `https://instagram.com/${p.instagram_url}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-gold font-medium leading-none"
              >
                <Instagram className="w-3.5 h-3.5" />
                {p.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || 'Instagram'}
              </a>
            )}
          </div>
        </div>
        {(p.job || p.height) && (
          <div className="flex items-center gap-4 flex-wrap">
            {p.job && (
              <span className="flex items-center gap-1.5 text-sm text-ink/70 font-medium leading-none">
                <Briefcase className="w-3.5 h-3.5 text-ink/40 shrink-0" />
                {p.job}
              </span>
            )}
            {p.height && (
              <span className="flex items-center gap-1.5 text-sm text-ink/70 font-medium leading-none">
                <Ruler className="w-3.5 h-3.5 text-ink/40 shrink-0" />
                {p.height}
              </span>
            )}
          </div>
        )}
        <div className={persona === 'woman' ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2'}>
          {shownInterests.map((interest: string) => {
            const isMatched = Array.isArray(p.match_reasons) && p.match_reasons.includes(interest);
            const sizeClass = persona === 'woman' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
            return (
              <span
                key={interest}
                className={
                  (isMatched
                    ? `${sizeClass} rounded-full bg-gold text-ink font-medium shadow-[0_2px_10px_rgba(210,4,45,0.4)] leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_16px_rgba(210,4,45,0.6)] active:scale-95`
                    : `glass-surface ${sizeClass} rounded-full text-ink font-medium leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-raised/5 active:scale-95`)
                }
              >
                {interest}
              </span>
            );
          })}
        </div>
        {lookingFor.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-ink/40 text-xs font-semibold uppercase tracking-wide leading-none">Values</span>
            {lookingFor.map((interest: string) => (
              <span
                key={interest}
                className="px-2.5 py-1 text-xs rounded-full border border-raised text-ink/70 font-medium leading-none"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
        {p.bio && (
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1.5 leading-none">The Standard</p>
            <p
              className={`text-ink/80 text-base leading-relaxed max-w-md font-light whitespace-pre-line ${expandedBios.has(p.id) ? '' : 'line-clamp-3'}`}
            >
              {p.bio}
            </p>
            {p.bio.length > 120 && (
              <button
                onClick={() => onBioToggle(p.id)}
                className="text-gold text-xs font-medium mt-1"
              >
                {expandedBios.has(p.id) ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        <div className={persona === 'woman' ? 'flex items-center gap-4 pt-2 shrink-0' : 'flex items-center justify-center gap-4 pt-2 shrink-0'}>
          {persona === 'woman' ? (
            <>
              <button
                onClick={() => onBegin(p.id)}
                aria-label="View Profile"
                className="btn-primary flex-1 h-12 flex items-center justify-center gap-1.5"
              >
                <>
                  <Heart className="w-4 h-4 text-ink" />
                  <span className="text-ink text-xs uppercase tracking-wide font-display font-bold">View Profile</span>
                </>
              </button>
              <button
                onClick={() => onMoreOptions(p.id)}
                aria-label="More options"
                className="w-12 h-12 rounded-full glass-surface flex items-center justify-center flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-ink" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onBegin(p.id)}
                className="btn-primary flex-1 h-12 flex items-center justify-center gap-1.5"
              >
                <>
                  <Heart className="w-4 h-4 text-ink" />
                  <span className="text-ink text-xs uppercase tracking-wide font-display font-bold">Make My Move</span>
                </>
              </button>
              <button
                onClick={() => onGift(p.id)}
                aria-label="Send gift"
                className="w-12 h-12 rounded-full glass-surface flex items-center justify-center flex-shrink-0"
              >
                <span className="text-base">🎁</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
