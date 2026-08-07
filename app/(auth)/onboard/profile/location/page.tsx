'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

// Step 2 of 5 in the profile wizard -- location on its own, split out of
// what used to be a shared age+location screen.
export default function ProfileLocationPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
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

  const resolveCity = useCallback(async (latitude: number, longitude: number) => {
    setLat(latitude);
    setLng(longitude);
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
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
  }, []);

  // Native uses @capacitor/geolocation (real CoreLocation) so the system
  // permission dialog shows the app's actual name -- the plain
  // navigator.geolocation web API triggers WKWebView's own prompt instead,
  // which surfaces the underlying deployment URL (e.g. "greenflag-dusky
  // .vercel.app wants to use your location"), confusing right after the
  // in-app primer already asked the same question in GreenFlag's own voice.
  const detectLocation = useCallback(() => {
    setGpsDetecting(true);
    setGpsDenied(false);

    if (Capacitor.isNativePlatform()) {
      Geolocation.getCurrentPosition({ timeout: 10000 })
        .then((position) => resolveCity(position.coords.latitude, position.coords.longitude))
        .catch(() => { setGpsDetecting(false); setGpsDenied(true); });
      return;
    }

    if (!navigator.geolocation) { setGpsDetecting(false); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => resolveCity(position.coords.latitude, position.coords.longitude),
      () => { setGpsDetecting(false); setGpsDenied(true); },
      { timeout: 10000 }
    );
  }, [resolveCity]);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) detectLocation();
    router.prefetch('/onboard/profile/instagram');
  }, []);

  const handleContinue = () => {
    hapticTap();
    if (!cityValue.trim()) { setError('City is required'); return; }
    setLocation(cityValue.trim(), lat, lng);
    goTo('/onboard/profile/instagram', '/onboarding/instagram.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <OnboardingBackground image="/onboarding/location.jpg" />
      <button
        onClick={() => router.push('/onboard/profile')}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <StepDots current={2} total={6} />

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
    </div>
  );
}
