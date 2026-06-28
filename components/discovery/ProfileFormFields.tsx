'use client';

import { Loader2 } from 'lucide-react';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;

interface ProfileFormFieldsProps {
  name: string;
  age: string;
  city: string;
  bio: string;
  instagramHandle: string;
  gpsDetecting: boolean;
  gpsDenied: boolean;
  errors: Record<string, string>;
  onNameChange: (v: string) => void;
  onAgeChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onBioChange: (v: string) => void;
  onInstagramChange: (v: string) => void;
  onDetectLocation: () => void;
}

export function ProfileFormFields({
  name, age, city, bio, instagramHandle,
  gpsDetecting, gpsDenied, errors,
  onNameChange, onAgeChange, onCityChange, onBioChange,
  onInstagramChange, onDetectLocation,
}: ProfileFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your full name"
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-name' : undefined}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Age</label>
        <input
          type="number"
          min={18}
          max={100}
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          placeholder="18"
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age' : undefined}
          className={`input ${errors.age ? 'border-red-500' : ''}`}
        />
        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Location <span className="text-red-400">*</span>
          {gpsDetecting && <span className="text-[#8E8E93] font-normal text-xs ml-1">(detecting...)</span>}
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={gpsDetecting ? 'Detecting location...' : 'Your city'}
          className={`input ${errors.city ? 'border-red-500' : ''}`}
        />
        {gpsDenied && <p className="text-amber-400 text-xs mt-1">Enable location access in your browser settings, or type your city above</p>}
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Instagram Handle <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={instagramHandle}
            onChange={(e) => onInstagramChange(e.target.value.replace(/^@/, ''))}
            placeholder="username"
            className={`input pl-8 ${errors.instagram ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Bio <span className="text-[#8E8E93] font-normal">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={200}
          rows={3}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio' : undefined}
          className="input resize-none"
        />
        <p className="text-xs text-[#8E8E93] mt-1 text-right">{bio.length}/200</p>
        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
      </div>
    </>
  );
}
