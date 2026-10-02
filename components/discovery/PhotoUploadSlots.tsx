'use client';

import { GripVertical, Lightbulb, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

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
        className={`rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${className} ${photo
          ? 'border-transparent shadow-sm'
          : 'border-dashed border-stone-300 bg-white/70 hover:border-[#1D3B2A] hover:bg-emerald-50/30 active:scale-95 cursor-pointer shadow-xs'
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
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#1D3B2A] text-white rounded-full text-[11px] font-bold shadow-md tracking-wide">
                Primary
              </div>
            )}
            {photo && (
              <div className="absolute bottom-2.5 left-2.5 p-1 bg-black/40 backdrop-blur-sm rounded-md opacity-80 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical size={16} className="text-white" />
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-md"
            >
              <X size={14} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 gap-1.5 transition-transform">
            <div className={`rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200/80 shadow-2xs ${i === 0 ? 'w-10 h-10' : 'w-8 h-8'}`}>
              <Upload size={i === 0 ? 18 : 15} />
            </div>
            <div>
              <span className="block text-xs font-bold text-[#382A21]">
                {i === 0 ? 'Main Cover Photo' : `Photo ${i + 1}`}
              </span>
              {i === 0 && (
                <span className="block text-[10px] text-stone-500 font-medium">
                  Visible on trip cards
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-[#382A21]">
          Photos <span className="text-stone-500 font-normal">({photos.length}/{maxPhotos})</span>
        </label>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
          {maxPhotos - photos.length > 0 ? `${maxPhotos - photos.length} needed` : 'Ready'}
        </span>
      </div>

      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-900 font-medium leading-tight">First photo is your main card. Drag photos to reorder anytime.</p>
      </div>

      {maxPhotos === 3 ? (
        <div className="space-y-3">
          {/* Hero Cover Slot */}
          {renderSlot(0, 'w-full aspect-[16/10] sm:aspect-[16/9]')}

          {/* Secondary Slots */}
          <div className="grid grid-cols-2 gap-3">
            {renderSlot(1, 'aspect-square sm:aspect-[4/3]')}
            {renderSlot(2, 'aspect-square sm:aspect-[4/3]')}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: maxPhotos }).map((_, i) => renderSlot(i, 'aspect-[3/4]'))}
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
      {error && <p className="text-red-600 font-medium text-xs mt-2">{error}</p>}

      <button
        type="button"
        onClick={() => setShowTips((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mt-4 active:scale-95 transition-transform"
      >
        <Lightbulb size={14} className="text-emerald-700" />
        How to choose great travel photos
      </button>
      {showTips && (
        <div className="mt-2.5 p-3.5 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <ul className="space-y-1.5 list-disc list-inside">
            {PHOTO_TIPS.map((tip) => (
              <li key={tip} className="text-xs text-stone-600 leading-relaxed">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
