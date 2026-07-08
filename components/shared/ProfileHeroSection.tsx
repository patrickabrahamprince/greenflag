'use client';

import { ArrowLeft, Flag, UserX } from 'lucide-react';
import { ProfileImageCarousel } from './ProfileImageCarousel';

interface ProfileHeroSectionProps {
  photo: string;
  name: string;
  photos: string[];
  photoIdx: number;
  isOwn: boolean;
  onBack: () => void;
  onReport: () => void;
  onBlock: () => void;
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
  onBlock,
}: ProfileHeroSectionProps) {
  return (
    <div className="relative w-full aspect-[3/4]">
      <ProfileImageCarousel images={photos} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {!isOwn && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={onBlock}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
          >
            <UserX className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={onReport}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
          >
            <Flag className="w-5 h-5 text-white/70" />
          </button>
        </div>
      )}

      <div className="absolute bottom-8 left-8 z-10 pointer-events-none">
        <h1 className="font-['Playfair_Display'] text-5xl text-white">{name}</h1>
      </div>
    </div>
  );
}
