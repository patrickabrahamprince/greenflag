'use client';

import { ArrowLeft, Flag } from 'lucide-react';

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
  onPhotoSelect,
}: ProfileHeroSectionProps) {
  return (
    <div className="relative w-full aspect-[3/4]">
      {photo && (
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-avatar.svg';
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

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

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => onPhotoSelect(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === photoIdx ? 'bg-[#D4AF37] w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
