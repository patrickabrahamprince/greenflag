'use client';

import { GripVertical, Lightbulb, Upload, X, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

const PHOTO_TIPS = [
  'Lead with a clear, smiling photo of your face -- solo shots in natural light work best.',
  'Highlight your travels, weekend getaways, and cafe adventures.',
  'Keep photos unfiltered and authentic for higher connection rates.',
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
        className={`rounded-3xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${className} ${
          photo
            ? 'border-transparent shadow-md'
            : 'border-dashed border-stone-300/90 bg-white hover:border-[#141414] hover:bg-stone-50/80 active:scale-[0.98] cursor-pointer shadow-xs'
        } ${draggedIdx === i ? 'opacity-50 scale-95' : ''}`}
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {isPrimary && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-[#141414] text-[#CEFF00] rounded-full text-[11px] font-[900] shadow-lg tracking-wider uppercase border border-[#CEFF00]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#CEFF00]" />
                <span>Primary Cover</span>
              </div>
            )}
            {photo && (
              <div className="absolute bottom-3 left-3 p-1.5 bg-[#141414]/60 backdrop-blur-md rounded-xl opacity-80 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing border border-white/20">
                <GripVertical size={16} className="text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-[#141414]/75 hover:bg-[#141414] text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg border border-white/20"
              aria-label="Remove photo"
            >
              <X size={15} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 gap-2 transition-transform">
            <div className={`rounded-full bg-stone-100 flex items-center justify-center text-stone-700 border border-stone-200 shadow-xs ${i === 0 ? 'w-12 h-12' : 'w-10 h-10'}`}>
              <Upload size={i === 0 ? 20 : 16} />
            </div>
            <div>
              <span className="block text-[13px] font-[800] text-[#141414]">
                {i === 0 ? 'Main Featured Photo' : `Trip Photo ${i + 1}`}
              </span>
              {i === 0 && (
                <span className="block text-[11px] text-stone-500 font-medium mt-0.5">
                  Shown on discovery cards & escapes
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-[800] text-[#141414]">
          Photos <span className="text-stone-500 font-normal">({photos.length}/{maxPhotos})</span>
        </label>
        <span className={`text-[11px] font-[800] px-3 py-1 rounded-full uppercase tracking-wider ${
          maxPhotos - photos.length > 0 
            ? 'bg-amber-100/80 text-amber-900 border border-amber-200' 
            : 'bg-[#CEFF00]/40 text-[#141414] border border-[#141414]/20'
        }`}>
          {maxPhotos - photos.length > 0 ? `${maxPhotos - photos.length} Needed` : 'Complete'}
        </span>
      </div>

      <div className="bg-stone-100/90 border border-stone-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5">
        <Lightbulb className="w-4 h-4 text-[#141414] shrink-0" />
        <p className="text-xs text-[#141414]/80 font-medium leading-tight">
          Your first photo is your travel card cover. Hold and drag to reorder.
        </p>
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
      {error && <p className="text-rose-600 font-bold text-xs mt-2">{error}</p>}

      <button
        type="button"
        onClick={() => setShowTips((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-[800] text-[#141414] mt-3 active:scale-95 transition-transform"
      >
        <Sparkles size={14} className="text-[#141414]" />
        <span>Photo tips for maximum sparks & travel invites</span>
      </button>

      {showTips && (
        <div className="mt-2.5 p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <ul className="space-y-2 list-disc list-inside">
            {PHOTO_TIPS.map((tip) => (
              <li key={tip} className="text-xs text-stone-600 leading-relaxed font-medium">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

