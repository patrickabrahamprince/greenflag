'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

// Step 1 of the profile wizard -- date of birth + location only. Splitting
// what used to be one long form (DOB, location, Instagram, bio, photos)
// into one-thing-per-screen steps is a well-documented completion lever;
// each field group now lives on its own route under /onboard/profile/*.
export default function ProfileBasicsPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const name = useOnboardingStore((s) => s.name);
  const dob = useOnboardingStore((s) => s.dob);
  const city = useOnboardingStore((s) => s.city);
  const setBasics = useOnboardingStore((s) => s.setBasics);

  const [dobValue, setDobValue] = useState(dob);
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

  // Real age from a birthdate, not a self-typed number -- checks
  // month/day too so a boundary birthday doesn't wrongly admit/reject.
  const computeAge = (dobStr: string): number | null => {
    if (!dobStr) return null;
    const birth = new Date(dobStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;
    return years;
  };

  const handleContinue = () => {
    const e: Record<string, string> = {};
    const ageNum = computeAge(dobValue);
    if (!dobValue || ageNum === null) e.dob = 'Date of birth is required';
    else if (ageNum < 18) e.dob = 'You must be 18+';
    else if (ageNum > 100) e.dob = 'Please enter a valid date of birth';
    if (!cityValue.trim()) e.city = 'City is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setBasics(dobValue, cityValue.trim(), lat, lng);
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
            <label className="block text-sm font-medium text-ink mb-1.5">Date of birth</label>
            <div className="relative">
              <input
                type="date"
                value={dobValue}
                onChange={(e) => { setDobValue(e.target.value); setErrors((p) => ({ ...p, dob: '' })); }}
                data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-dob' : undefined}
                className={`input pr-8 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.dob ? 'border-red-500' : ''}`}
              />
              <Calendar size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
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
