import { useState } from 'react';
import { Camera, Check, Image } from 'lucide-react';

interface PhotoUploaderProps {
  onUpload: (url: string) => void;
}

export function PhotoUploader({ onUpload }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (source: 'camera' | 'gallery') => {
    const placeholder = `https://images.unsplash.com/photo-${Date.now()}?w=800&h=800&fit=crop`;
    setPreview(placeholder);
    onUpload(placeholder);
  };

  if (preview) {
    return (
      <div className="card p-0 overflow-hidden">
        <div className="aspect-square relative" style={{ background: '#161616' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted/30" />
          </div>
          <div className="absolute bottom-3 left-3 backdrop-blur-sm rounded-lg px-3 py-1.5" style={{ background: 'rgba(8,8,8,0.7)' }}>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-gold" />
              <span className="text-xs text-white font-thin">Photo selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => handleSelect('camera')} className="card flex flex-col items-center justify-center py-12 gap-3 hover:gold-border-left transition-all duration-300">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#161616' }}>
          <Camera className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Camera</span>
        <span className="text-xs text-muted font-thin">Take a photo</span>
      </button>
      <button onClick={() => handleSelect('gallery')} className="card flex flex-col items-center justify-center py-12 gap-3 hover:gold-border-left transition-all duration-300">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#161616' }}>
          <Image className="w-6 h-6 text-gold" />
        </div>
        <span className="text-sm text-white font-medium">Gallery</span>
        <span className="text-xs text-muted font-thin">Choose from library</span>
      </button>
    </div>
  );
}
