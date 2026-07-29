'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

const MIN_AGE = 18;
// Matches the live DB check constraint on profiles.age (age >= 18 AND
// age <= 60) -- validating a wider range client-side would just let
// someone hit a raw constraint-violation error on submit instead of a
// friendly inline message.
const MAX_AGE = 60;

// Step 1 of the profile wizard -- age + location only. Splitting what
// used to be one long form (DOB, location, Instagram, bio, photos) into
// one-thing-per-screen steps is a well-documented completion lever; each
// field group now lives on its own route under /onboard/profile/*.
// Asking age directly instead of a full date-of-birth picker is one less
// piece of friction -- identity is verified separately via Instagram.
export default function ProfileBasicsPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const setBasics = useOnboardingStore((s) => s.setBasics);

  const [ageValue, setAgeValue] = useState(age ? String(age) : '');
  const [cityValue, setCityValue] = useState(city);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsDetecting(true);
    setGpsDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          const address = data.address;
          if (!address) { setGpsDenied(true); return; }
          const parts = [address.city || address.town || address.county, address.state].filter(Boolean);
          const detected = parts.join(', ');
          if (detected) {
            const match = INDIAN_CITIES.find((c) => detected.toLowerCase().includes(c.toLowerCase()));
            const display = match || detected;
            setCityValue(display);
            toast.success(`Location found: ${display}`);
          } else {
            setGpsDenied(true);
          }
        } catch {
          setGpsDenied(true);
        } finally {
          setGpsDetecting(false);
        }
      },
      () => { setGpsDetecting(false); setGpsDenied(true); },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!city) detectLocation();
  }, []);

  const handleContinue = () => {
    const e: Record<string, string> = {};
    const ageNum = Number(ageValue);
    if (!ageValue.trim() || !Number.isInteger(ageNum)) e.age = 'How old are you?';
    else if (ageNum < MIN_AGE) e.age = 'You must be 18+';
    else if (ageNum > MAX_AGE) e.age = 'Please enter a valid age';
    if (!cityValue.trim()) e.city = 'City is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setBasics(ageNum, cityValue.trim(), lat, lng);
    router.push('/onboard/profile/instagram');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/name')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <StepDots current={1} total={4} />

        <h1 className="text-xl font-display font-semibold text-ink mb-6">
          {persona === 'woman' ? `Make Your Entrance, ${name}` : `Nice To Meet You, ${name}`}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">How old are you?</label>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              value={ageValue}
              onChange={(e) => { setAgeValue(e.target.value); setErrors((p) => ({ ...p, age: '' })); }}
              placeholder="Your age"
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-age' : undefined}
              className={`input ${errors.age ? 'border-red-500' : ''}`}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Location <span className="text-red-400">*</span>
              {gpsDetecting && <span className="text-[#9DA0A6] font-normal text-xs ml-1">(detecting...)</span>}
            </label>
            <input
              type="text"
              value={cityValue}
              onChange={(e) => { setCityValue(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
              placeholder={gpsDetecting ? 'Detecting location...' : 'Your city'}
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-city' : undefined}
              className={`input ${errors.city ? 'border-red-500' : ''}`}
            />
            {gpsDenied && (
              <p className="text-amber-400 text-xs mt-1">
                We couldn&apos;t detect your city — please enter it manually, or{' '}
                <button type="button" onClick={detectLocation} className="underline underline-offset-2 hover:text-amber-300">
                  try again
                </button>.
              </p>
            )}
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-basics-continue' : undefined}
        className="btn-primary w-full py-4 mb-6 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
