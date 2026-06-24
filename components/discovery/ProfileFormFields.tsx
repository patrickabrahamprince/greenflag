'use client';

interface ProfileFormFieldsProps {
  name: string;
  age: string;
  city: string;
  bio: string;
  errors: Record<string, string>;
  onNameChange: (v: string) => void;
  onAgeChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onBioChange: (v: string) => void;
}

export function ProfileFormFields({
  name, age, city, bio, errors,
  onNameChange, onAgeChange, onCityChange, onBioChange,
}: ProfileFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Name</label>
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
        <label className="block text-sm font-medium text-white mb-1.5">Age</label>
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
        <label className="block text-sm font-medium text-white mb-1.5">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Your city"
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-city' : undefined}
          className={`input ${errors.city ? 'border-red-500' : ''}`}
        />
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
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
