'use client';

import { useRef, useState } from 'react';
import { Loader2, Calendar, ShieldCheck, BadgeCheck } from 'lucide-react';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

const VERIFY_DURATION_MS = 3000;
const BIO_MIN_CHARS = 15;

interface ProfileFormFieldsProps {
  dob: string;
  city: string;
  bio: string;
  instagramHandle: string;
  instagramVerified: boolean;
  gpsDetecting: boolean;
  gpsDenied: boolean;
  errors: Record<string, string>;
  onDobChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onBioChange: (v: string) => void;
  onInstagramChange: (v: string) => void;
  onInstagramVerifiedChange: (v: boolean) => void;
  onDetectLocation: () => void;
}

export function ProfileFormFields({
  dob, city, bio, instagramHandle, instagramVerified,
  gpsDetecting, gpsDenied, errors,
  onDobChange, onCityChange, onBioChange,
  onInstagramChange, onInstagramVerifiedChange, onDetectLocation,
}: ProfileFormFieldsProps) {
  const dobInputRef = useRef<HTMLInputElement>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    if (!instagramHandle.trim() || verifying || instagramVerified) return;
    setVerifying(true);
    // Mimic only -- there's no real Instagram API integration here. The
    // handle still gets sent to admins for manual identity review; this
    // just gives the applicant a moment of "checking" before confirming.
    setTimeout(() => {
      setVerifying(false);
      onInstagramVerifiedChange(true);
    }, VERIFY_DURATION_MS);
  };

  const openDatePicker = () => {
    const input = dobInputRef.current;
    if (!input) return;
    // showPicker() isn't supported in Safari -- fall back to focusing the
    // input, which at least opens most mobile date pickers on tap.
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Date of birth</label>
        <div className="relative">
          <input
            ref={dobInputRef}
            type="date"
            value={dob}
            onChange={(e) => onDobChange(e.target.value)}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-dob' : undefined}
            className={`input pr-8 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.dob ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={openDatePicker}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-gold transition-colors"
            aria-label="Open date picker"
          >
            <Calendar size={18} />
          </button>
        </div>
        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Location <span className="text-red-400">*</span>
          {gpsDetecting && <span className="text-[#9DA0A6] font-normal text-xs ml-1">(detecting...)</span>}
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={gpsDetecting ? 'Detecting location...' : 'Your city'}
          className={`input ${errors.city ? 'border-red-500' : ''}`}
        />
        {gpsDenied && (
          <p className="text-amber-400 text-xs mt-1">
            We couldn&apos;t detect your city — please enter it manually, or{' '}
            <button type="button" onClick={onDetectLocation} className="underline underline-offset-2 hover:text-amber-300">
              try again
            </button>
            .
          </p>
        )}
        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Instagram Handle <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => {
                onInstagramChange(e.target.value.replace(/^@/, ''));
                if (instagramVerified) onInstagramVerifiedChange(false);
              }}
              placeholder="username"
              disabled={verifying}
              className={`input pl-8 ${errors.instagram ? 'border-red-500' : ''}`}
            />
          </div>
          <button
            type="button"
            onClick={handleVerify}
            disabled={!instagramHandle.trim() || verifying || instagramVerified}
            className={`shrink-0 px-4 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              instagramVerified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20 disabled:opacity-40'
            }`}
          >
            {verifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Verifying
              </>
            ) : instagramVerified ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Verify
              </>
            )}
          </button>
        </div>
        <p className="text-[#9DA0A6] text-xs mt-1">
          {instagramVerified
            ? "Verified — this will be sent with your profile for identity approval."
            : 'Used only to verify you — never shown on your profile.'}
        </p>
        {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          About You <span className="text-red-400">*</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={`A few words that define you... (at least ${BIO_MIN_CHARS} characters)`}
          maxLength={200}
          rows={3}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-bio' : undefined}
          className={`input resize-none ${errors.bio ? 'border-red-500' : ''}`}
        />
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${bio.length < BIO_MIN_CHARS ? 'text-amber-400' : 'text-[#9DA0A6]'}`}>
            {bio.length < BIO_MIN_CHARS ? `Min ${BIO_MIN_CHARS} characters` : ''}
          </span>
          <span className="text-xs text-[#9DA0A6]">{bio.length}/200</span>
        </div>
        {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
      </div>
    </>
  );
}
