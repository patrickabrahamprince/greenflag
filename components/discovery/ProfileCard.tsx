'use client';

import { useState } from 'react';
import { Lock, Instagram, Briefcase, Ruler, ChevronLeft, ChevronRight, MapPin, ImageOff, Flag, MoreVertical, Compass } from 'lucide-react';
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
  active_trip?: { destination: string; start_date: string; vibe: string; id: string };
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
  const isPhotosUnlocked = true;
  const isLocked = false;

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
      <div className="absolute inset-0 bg-[#1C1C1E]">
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
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1C1C1E]">
              <ImageOff className="w-9 h-9 text-white/40" />
              <span className="text-white/50 text-xs font-medium">No photo available</span>
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
              className="bg-white/90 backdrop-blur-xl border border-white/40 text-[#1C1C1E] absolute inset-0 m-auto z-20 flex items-center justify-center gap-1.5 h-10 w-fit px-5 rounded-full active:scale-95 transition-all shadow-xl"
            >
              <Lock className="w-4 h-4 text-[#1C1C1E] shrink-0" />
              <span className="text-[#1C1C1E] text-xs uppercase tracking-wider font-bold whitespace-nowrap">Unlock Photos</span>
            </button>
          )}

          {total > 1 && (
            <>
              <div className="absolute top-safe-top inset-x-4 z-10 flex gap-1.5 pt-3">
                {photos.map((_, segIdx) => (
                  <div key={segIdx} className="flex-1 h-1 rounded-full bg-white/30 backdrop-blur-sm overflow-hidden shadow-xs">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: segIdx <= idx ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx - 1); }}
                aria-label="Previous photo"
                className="absolute left-3 top-[42%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx + 1); }}
                aria-label="Next photo"
                className="absolute right-3 top-[42%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {typeof p.match_percentage === 'number' && (
            <div className="absolute top-safe-top right-4 mt-8 z-10 flex flex-col items-end gap-1.5">
              <div className="bg-white/95 backdrop-blur-md text-[#1C1C1E] border border-white/50 flex items-center gap-1.5 rounded-full px-3 py-1 shadow-md">
                <Flag className="w-3.5 h-3.5 text-[#1C1C1E]" fill="currentColor" />
                <span className="font-bold text-[#1C1C1E] text-xs whitespace-nowrap">
                  {p.match_percentage}% Match
                </span>
              </div>
              {persona === 'woman' && !!interestCounts[p.id] && (
                <span className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-white text-[11px] font-medium whitespace-nowrap shadow-sm">
                  {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'invite' : 'invites'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/2 backdrop-blur-sm pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
          maskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-28 pt-8 z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
            {p.name}{p.age ? `, ${p.age}` : ''}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {p.city_auto && (
              <p className="flex items-center gap-1 font-sans text-xs sm:text-sm text-white/90 font-medium leading-none">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-white" />
                {p.city_auto}
              </p>
            )}
            {p.instagram_url && (
              <a
                href={p.instagram_url.startsWith('http') ? p.instagram_url : `https://instagram.com/${p.instagram_url}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-white/80 font-semibold leading-none hover:underline"
              >
                <Instagram className="w-3.5 h-3.5" />
                {p.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || 'Instagram'}
              </a>
            )}
          </div>
          {p.active_trip && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
              <Compass className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{p.active_trip.destination} • {p.active_trip.start_date}</span>
            </div>
          )}
        </div>

        {(p.job || p.height) && (
          <div className="flex items-center gap-4 flex-wrap">
            {p.job && (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium leading-none">
                <Briefcase className="w-3.5 h-3.5 text-white/60 shrink-0" />
                {p.job}
              </span>
            )}
            {p.height && (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium leading-none">
                <Ruler className="w-3.5 h-3.5 text-white/60 shrink-0" />
                {p.height}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {shownInterests.map((interest: string) => {
            return (
              <span
                key={interest}
                className="px-3.5 py-1 text-xs rounded-full bg-white/15 backdrop-blur-md text-white font-medium border border-white/25 leading-none shadow-xs"
              >
                {interest}
              </span>
            );
          })}
        </div>

        {lookingFor.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/60 text-[11px] font-semibold uppercase tracking-wider leading-none">Looking For</span>
            {lookingFor.map((interest: string) => (
              <span
                key={interest}
                className="px-3 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 font-medium leading-none"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {p.bio && (
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1 leading-none">About</p>
            <p
              className={`text-white/95 text-sm sm:text-base leading-relaxed max-w-md font-normal whitespace-pre-line ${expandedBios.has(p.id) ? '' : 'line-clamp-2'}`}
            >
              {p.bio}
            </p>
            {p.bio.length > 100 && (
              <button
                onClick={() => onBioToggle(p.id)}
                className="text-white text-xs font-bold mt-1 underline"
              >
                {expandedBios.has(p.id) ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onBegin(p.id);
            }}
            aria-label="Connect"
            className="flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-bold bg-white text-[#1C1C1E] hover:bg-stone-100 active:scale-[0.98] shadow-md transition-all duration-150 border border-white cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#1C1C1E]" />
            <span className="text-[13px] tracking-tight font-extrabold">Connect</span>
          </button>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onMoreOptions(p.id);
            }}
            aria-label="More options"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center shrink-0 hover:bg-black/70 active:scale-95 transition-all duration-150 text-white shadow-md cursor-pointer"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

