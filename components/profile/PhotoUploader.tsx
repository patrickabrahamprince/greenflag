// /components/profile/PhotoUploader.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useImageCrop } from '@/hooks/useImageCrop';
import { uploadPhoto, deletePhoto, reorderPhotos } from '@/lib/supabase/profile';
import type { Photo } from '@/types/profile';

interface PhotoUploaderProps {
  initialPhotos: Photo[];
  maxPhotos?: number;
  onChange?: (photos: Photo[]) => void;
}

export function PhotoUploader({ initialPhotos, maxPhotos = 6, onChange }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    imageSrc,
    crop,
    zoom,
    setCrop,
    setZoom,
    setImage,
    onCropComplete,
    getCroppedImg,
    reset: resetCrop,
  } = useImageCrop();

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const triggerChange = (updated: Photo[]) => {
    setPhotos(updated);
    if (onChange) onChange(updated);
  };

  const handleSlotClick = (position: number) => {
    setUploadingPosition(position);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (uploadingPosition === null) return;
    setUploadingPosition(null);

    toast.loading('Processing image...', { id: 'photo-upload' });
    try {
      const croppedBlob = await getCroppedImg();
      const croppedFile = new File([croppedBlob], `crop_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      const nextPosition = photos.length;
      const newPhoto = await uploadPhoto(croppedFile, nextPosition);
      
      const updated = [...photos, newPhoto].sort((a, b) => a.position - b.position);
      triggerChange(updated);
      toast.success('Photo uploaded successfully!', { id: 'photo-upload' });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to upload photo', { id: 'photo-upload' });
    } finally {
      resetCrop();
    }
  };

  const handleDelete = async (photoId: string) => {
    toast.loading('Deleting photo...', { id: 'photo-delete' });
    try {
      await deletePhoto(photoId);
      const remaining = photos.filter((p) => p.id !== photoId);
      
      // Auto-reorder positions
      const updatedIds = remaining.map((p) => p.id);
      await reorderPhotos(updatedIds);
      
      // Re-fetch or re-map locally
      const updated = remaining.map((p, idx) => ({
        ...p,
        position: idx,
        is_primary: idx === 0,
      }));

      triggerChange(updated);
      toast.success('Photo deleted successfully!', { id: 'photo-delete' });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete photo', { id: 'photo-delete' });
    }
  };

  // HTML5 Drag and Drop Reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...photos];
    const [removed] = list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, removed);

    // Optimistic UI update
    const optimistic = list.map((p, idx) => ({
      ...p,
      position: idx,
      is_primary: idx === 0,
    }));
    setPhotos(optimistic);
    setDraggedIndex(null);

    // Persist position changes in Database
    try {
      const ids = optimistic.map((p) => p.id);
      await reorderPhotos(ids);
      triggerChange(optimistic);
    } catch (err: any) {
      console.error('Reordering failed:', err);
      toast.error('Reordering sync failed.');
    }
  };

  return (
    <div className="w-full bg-[#FAF9F7] p-6 rounded-xl border border-[#E8E6E1]">
      <h3 className="font-['Playfair_Display'] text-sm italic font-bold text-[#1A1A1A] mb-1">
        Profile Photos
      </h3>
      <p className="text-[10px] text-[#1A1A1A]/40 mb-4">
        Drag and drop slots to reorder. The first photo will be your main display cover.
      </p>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Grid: 2 cols on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 aspect-[2/3] sm:aspect-[3/2] w-full">
        {Array.from({ length: maxPhotos }).map((_, idx) => {
          const photo = photos.find((p) => p.position === idx);

          if (photo) {
            return (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                className={`relative group rounded-lg overflow-hidden border bg-white aspect-square cursor-grab active:cursor-grabbing ${
                  idx === 0 ? 'border-2 border-[#C9A961] ring-2 ring-[#C9A961]/20' : 'border-[#E8E6E1]'
                }`}
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C9A961] text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
                {/* Delete overlay */}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5 text-white hover:text-red-500 transition-colors" />
                </button>
              </div>
            );
          }

          // Render upload placeholder slot only if it's the next sequential slot
          const isNextAvailableSlot = idx === photos.length;

          return (
            <div
              key={`empty-${idx}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              onClick={() => isNextAvailableSlot && handleSlotClick(idx)}
              className={`aspect-square border border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                isNextAvailableSlot
                  ? 'border-[#C9A961]/40 hover:border-[#C9A961] bg-white cursor-pointer'
                  : 'border-[#E8E6E1] bg-gray-50 opacity-40 cursor-not-allowed'
              }`}
            >
              {isNextAvailableSlot ? (
                <>
                  <Plus className="w-6 h-6 text-[#C9A961]" />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#C9A961] mt-1">
                    Upload
                  </span>
                </>
              ) : (
                <span className="text-[9px] text-[#1A1A1A]/30">Slot {idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Crop Modal Portal Overlay */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4">
          <div className="relative flex-1 w-full min-h-[300px]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="bg-[#FAF9F7] p-4 flex flex-col gap-4 max-w-sm mx-auto w-full rounded-xl mt-4">
            <h4 className="text-center font-['Playfair_Display'] text-sm italic font-bold text-[#1A1A1A]">
              Position & Zoom Cover
            </h4>
            <div className="flex gap-2">
              <button
                onClick={resetCrop}
                className="flex-1 py-2 border border-[#E8E6E1] text-[#1A1A1A]/60 font-bold uppercase text-[10px] tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 py-2 bg-[#C9A961] text-white font-bold uppercase text-[10px] tracking-wider"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
