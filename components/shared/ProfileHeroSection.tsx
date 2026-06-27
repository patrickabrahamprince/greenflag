'use client';

import { ArrowLeft, Flag } from 'lucide-react';
import { ProfileImageCarousel } from './ProfileImageCarousel';

interface ProfileHeroSectionProps {
  photo: string;
  name: string;
  photos: string[];
  photoIdx: number;
  isOwn: boolean;
  onBack: () => void;
  onReport: () => void;
  onPhotoSelect: (idx: number) => void;
}

export function ProfileHeroSection({
  photo,
  name,
  photos,
  photoIdx,
  isOwn,
  onBack,
  onReport,
}: ProfileHeroSectionProps) {
  return (
    <div className="relative w-full aspect-[3/4]">
      <ProfileImageCarousel images={photos} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {!isOwn && (
        <button
          onClick={onReport}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
        >
          <Flag className="w-5 h-5 text-white/60" />
        </button>
      )}
    </div>
  );
}
