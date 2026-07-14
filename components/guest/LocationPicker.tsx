import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';

interface LocationPickerProps {
  onLocation: (location: string) => void;
}

export function LocationPicker({ onLocation }: LocationPickerProps) {
  const [shared, setShared] = useState(false);
  const handleShare = () => { setShared(true); onLocation('27.1751° N, 78.0421° E'); };

  if (shared) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <MapPin className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-ink font-medium">Location shared</p>
            <p className="text-xs text-muted font-thin">27.1751° N, 78.0421° E</p>
          </div>
        </div>
        <Check className="w-5 h-5 text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card p-0 overflow-hidden h-48 flex items-center justify-center" style={{ background: '#1C1C1E' }}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted/30 mx-auto mb-2" />
          <p className="text-xs text-muted font-thin">Map preview placeholder</p>
        </div>
      </div>
      <button onClick={handleShare} className="btn-primary w-full flex items-center justify-center gap-2">
        <MapPin className="w-4 h-4" />
        Share Location
      </button>
    </div>
  );
}
