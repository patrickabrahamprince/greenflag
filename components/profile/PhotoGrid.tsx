// /components/profile/PhotoGrid.tsx

'use client';

import type { Photo } from '@/types/profile';
import { PhotoUploader } from './PhotoUploader';

interface PhotoGridProps {
  photos: Photo[];
  editable?: boolean;
  onChange?: (photos: Photo[]) => void;
}

export function PhotoGrid({ photos, editable = false, onChange }: PhotoGridProps) {
  if (editable) {
    return <PhotoUploader initialPhotos={photos} onChange={onChange} />;
  }

  // Filter and sort active photos
  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

  if (sortedPhotos.length === 0) {
    return (
      <div className="w-full aspect-square bg-[#F0EDE9] rounded-xl flex items-center justify-center border border-[#E8E6E1]">
        <span className="font-['Playfair_Display'] italic text-xs text-[#1A1A1A]/40 font-bold">
          No photos uploaded
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 aspect-[2/3] sm:aspect-[3/2] w-full">
      {Array.from({ length: 6 }).map((_, idx) => {
        const photo = sortedPhotos.find((p) => p.position === idx);

        if (photo) {
          return (
            <div
              key={photo.id}
              className={`relative rounded-lg overflow-hidden border bg-white aspect-square border-[#E8E6E1] ${
                idx === 0 ? 'border-2 border-[#C9A961] ring-2 ring-[#C9A961]/10' : ''
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-[#C9A961] text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          );
        }

        // Empty slot placeholder for other profiles (blank layout fill)
        return (
          <div
            key={`empty-placeholder-${idx}`}
            className="aspect-square bg-gray-50 border border-dashed border-[#E8E6E1] rounded-lg opacity-30"
          />
        );
      })}
    </div>
  );
}
