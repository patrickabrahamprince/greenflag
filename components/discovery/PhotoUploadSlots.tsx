'use client';

import { useRef, useState } from 'react';
import { Upload, X, Lightbulb, GripVertical } from 'lucide-react';

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
  onReorder?: (fromIdx: number, toIdx: number) => void;
  error?: string;
}

export function PhotoUploadSlots({
  photos,
  maxPhotos,
  onAdd,
  onRemove,
  onReorder,
  error,
}: PhotoUploadSlotsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTips, setShowTips] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && photos.length < maxPhotos) {
      onAdd(Array.from(files).slice(0, maxPhotos - photos.length));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx !== null && draggedIdx !== idx && onReorder) {
      onReorder(draggedIdx, idx);
    }
    setDraggedIdx(null);
  };

  const renderSlot = (i: number, className: string) => {
    const photo = photos[i];
    const isPrimary = i === 0 && photo;
    return (
      <div
        key={i}
        draggable={!!photo}
        onDragStart={() => handleDragStart(i)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(i)}
        onClick={() => {
          if (!photo && photos.length < maxPhotos) inputRef.current?.click();
        }}
        className={`rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${className} ${
          photo
            ? 'border-transparent'
            : 'border-raised hover:border-gold active:scale-95 cursor-pointer'
        } ${draggedIdx === i ? 'opacity-50' : ''}`}
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {isPrimary && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-gold/90 rounded-full text-xs font-medium text-black">
                Primary
              </div>
            )}
            {photo && (
              <div className="absolute bottom-2 left-2 opacity-60 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical size={16} className="text-white" />
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 active:scale-90 transition-all"
            >
              <X size={12} className="text-white" />
            </button>
          </>
        ) : (
          <Upload size={20} className="text-ink/50" />
        )}
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        Photos <span className="text-ink/50 font-normal">({maxPhotos} max - drag to reorder)</span>
      </label>
      <p className="text-xs text-gold/70 mb-3">💡 Your largest photo becomes your primary. Drag photos to reorder.</p>
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
        <p className="text-xs text-red-400">⚠️ Keep photos respectful. Inappropriate photos will result in immediate removal and account ban.</p>
      </div>
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
      <p className="text-xs text-ink/50 mt-1.5">{photos.length}/{maxPhotos} added</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <button
        type="button"
        onClick={() => setShowTips((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-gold mt-3 active:scale-95 transition-transform"
      >
        <Lightbulb size={14} />
        How to choose the perfect picture
      </button>
      {showTips && (
        <ul className="mt-2 space-y-1.5 list-disc list-inside">
          {PHOTO_TIPS.map((tip) => (
            <li key={tip} className="text-xs text-ink/50 leading-relaxed">{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
