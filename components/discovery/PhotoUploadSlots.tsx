'use client';

import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploadSlotsProps {
  photos: string[];
  maxPhotos: number;
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  error?: string;
}

export function PhotoUploadSlots({
  photos,
  maxPhotos,
  onAdd,
  onRemove,
  error,
}: PhotoUploadSlotsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) onAdd(Array.from(files));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">
        Photos <span className="text-[#8E8E93] font-normal">({maxPhotos} required)</span>
      </label>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: maxPhotos }).map((_, i) => {
          const photo = photos[i];
          return (
            <div
              key={i}
              onClick={() => {
                if (!photo && photos.length < maxPhotos) inputRef.current?.click();
              }}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                photo
                  ? 'border-transparent'
                  : 'border-white/10 hover:border-[#C9A961]/30 cursor-pointer'
              }`}
            >
              {photo ? (
                <>
                  <img
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </>
              ) : (
                <Upload size={20} className="text-[#8E8E93]" />
              )}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'photo-upload' : undefined}
        onChange={handleChange}
      />
      <p className="text-xs text-[#8E8E93] mt-1.5">{photos.length}/{maxPhotos} uploaded</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
