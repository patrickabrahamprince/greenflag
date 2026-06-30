import { Upload, X } from 'lucide-react';

interface PhotoUploadSectionProps {
  photos: string[];
  photoSlots: number;
  isHost: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
  error?: string;
}

export function PhotoUploadSection({
  photos,
  photoSlots,
  isHost,
  onUpload,
  onRemove,
  error,
}: PhotoUploadSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        Photos {isHost ? '(3 required)' : '(3-6 required)'}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: photoSlots }).map((_, i) => {
          const photo = photos[i];
          const canAdd = isHost ? photos.length < 3 : photos.length < 6;
          return (
            <div
              key={i}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                photo
                  ? 'border-transparent'
                  : canAdd
                  ? 'border-[#E8E6E1] hover:border-gold cursor-pointer'
                  : 'border-[#E8E6E1] opacity-50'
              }`}
              onClick={() => { if (!photo && canAdd) document.getElementById(`photo-input-${i}`)?.click(); }}
            >
              {photo ? (
                <>
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </>
              ) : (
                <Upload size={20} className="text-muted" />
              )}
              <input
                id={`photo-input-${i}`}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onUpload}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-1">{photos.length}/{photoSlots} photos</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
