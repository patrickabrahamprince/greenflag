'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { PermissionPrimer } from '@/components/shared/PermissionPrimer';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

// Step 2 of 5 in the profile wizard -- location on its own, split out of
// what used to be a shared age+location screen.
export default function ProfileLocationPage() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const setLocation = useOnboardingStore((s) => s.setLocation);

  const [cityValue, setCityValue] = useState(city);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [showLocationPrimer, setShowLocationPrimer] = useState(false);

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
    if (!age) { router.replace('/onboard/profile'); return; }
    // Firing the native location prompt cold (no explanation) tends to get
    // reflexively denied -- show the benefit first and let detectLocation()
    // run only once they've actively opted in.
    if (!city) setShowLocationPrimer(true);
  }, []);

  const handleContinue = () => {
    if (!cityValue.trim()) { setError('City is required'); return; }
    setLocation(cityValue.trim(), lat, lng);
    router.push('/onboard/profile/instagram');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <button
        onClick={() => router.push('/onboard/profile')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <StepDots current={2} total={5} />

        <h1 className="font-display text-3xl text-ink mb-3">
          Where are you{gpsDetecting ? ' (detecting...)' : ''}?
        </h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Helps us show you people nearby.
        </p>

        <input
          type="text"
          value={cityValue}
          onChange={(e) => { setCityValue(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
          placeholder={gpsDetecting ? 'Detecting location...' : 'Your city'}
          autoFocus
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-city' : undefined}
          className={`input w-full text-lg ${error ? 'border-red-500' : ''}`}
        />
        {gpsDenied && (
          <p className="text-amber-400 text-xs mt-2">
            We couldn&apos;t detect your city — please enter it manually, or{' '}
            <button type="button" onClick={detectLocation} className="underline underline-offset-2 hover:text-amber-300">
              try again
            </button>.
          </p>
        )}
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-location-continue' : undefined}
        className="btn-primary w-full py-4 mb-safe-bottom max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>

      <PermissionPrimer
        open={showLocationPrimer}
        icon={<MapPin className="w-6 h-6 text-gold" />}
        title="Find your city automatically?"
        description="We'll suggest your city so you don't have to type it. We never share your exact location — just the city name."
        confirmLabel="Enable Location"
        skipLabel="I'll type it"
        onConfirm={() => { setShowLocationPrimer(false); detectLocation(); }}
        onSkip={() => setShowLocationPrimer(false)}
      />
    </div>
  );
}
