const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

interface GuestFieldsSectionProps {
  city: string;
  instagramHandle: string;
  onCityChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  errors: Record<string, string>;
}

export function GuestFieldsSection({
  city,
  instagramHandle,
  onCityChange,
  onInstagramChange,
  errors,
}: GuestFieldsSectionProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">City</label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className={`input ${errors.city ? 'input-error' : ''}`}
        >
          <option value="">Select your city</option>
          {INDIAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Instagram Handle <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="text-muted text-sm">@</span>
          </div>
          <input
            type="text"
            value={instagramHandle}
            onChange={(e) => onInstagramChange(e.target.value)}
            placeholder="username"
            className={`input pl-8 ${errors.instagram ? 'input-error' : ''}`}
          />
        </div>
        {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
      </div>
    </>
  );
}
