import { MapPin } from 'lucide-react';

interface HostLocationSectionProps {
  gpsDetecting: boolean;
  gpsDenied: boolean;
  cityAutoText: string;
  onDetectLocation: () => void;
  error?: string;
}

export function HostLocationSection({
  gpsDetecting,
  gpsDenied,
  cityAutoText,
  onDetectLocation,
  error,
}: HostLocationSectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">Location</label>
      <button
        onClick={onDetectLocation}
        disabled={gpsDetecting}
        className="btn-secondary w-full mb-2 flex items-center justify-center gap-2 active:scale-95"
      >
        <MapPin size={16} />
        {gpsDetecting ? 'Detecting...' : 'Auto-detect location'}
      </button>
      {cityAutoText && (
        <input
          type="text"
          value={cityAutoText}
          disabled
          className="input text-muted"
        />
      )}
      {gpsDenied && !cityAutoText && (
        <p className="text-red-500 text-xs mt-1">Location required to continue</p>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
