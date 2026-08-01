'use client';

import { useRef, useState } from 'react';
import { Upload, X, Lightbulb } from 'lucide-react';

const PHOTO_TIPS = [
  'Lead with a clear, recent photo of your face -- no group shots or sunglasses up front.',
  'Show your life: hobbies, travel, friends -- not just posed close-ups.',
  'Skip heavy filters. Natural light photos get more attention.',
];

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
  const [showTips, setShowTips] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) onAdd(Array.from(files));
    if (inputRef.current) inputRef.current.value = '';
  };

  const renderSlot = (i: number, className: string) => {
    const photo = photos[i];
    return (
      <div
        key={i}
        onClick={() => {
          if (!photo && photos.length < maxPhotos) inputRef.current?.click();
        }}
        className={`rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${className} ${
          photo
            ? 'border-transparent'
            : 'border-[#2A2A2A] hover:border-gold cursor-pointer'
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
          <Upload size={20} className="text-[#9DA0A6]" />
        )}
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        Photos <span className="text-[#9DA0A6] font-normal">({maxPhotos} required)</span>
      </label>
      {maxPhotos === 3 ? (
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-64">
          {renderSlot(0, 'row-span-2')}
          {renderSlot(1, '')}
          {renderSlot(2, '')}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: maxPhotos }).map((_, i) => renderSlot(i, 'aspect-square'))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'photo-upload' : undefined}
        onChange={handleChange}
      />
      <p className="text-xs text-[#9DA0A6] mt-1.5">{photos.length}/{maxPhotos} added</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <button
        type="button"
        onClick={() => setShowTips((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gold mt-3"
      >
        <Lightbulb size={14} />
        How to choose the perfect picture
      </button>
      {showTips && (
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          {PHOTO_TIPS.map((tip) => (
            <li key={tip} className="text-xs text-[#9DA0A6] leading-relaxed">{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
