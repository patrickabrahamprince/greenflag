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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/location.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/profile')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={2} total={6} />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 font-bold text-xl">
            📍
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">
            Where are you based?
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            Helps us match you with road trips and travel buddies starting nearby.
          </p>

          {gpsDetecting ? (
            <div className="w-full text-base bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl px-5 py-4 flex items-center gap-3 text-emerald-950 font-semibold shadow-xs animate-pulse">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-700 border-r-transparent animate-spin" />
              <span>Detecting your city...</span>
            </div>
          ) : cityValue && !gpsDenied ? (
            <div className="w-full bg-emerald-50/80 border-2 border-emerald-300/80 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#382A21]">{cityValue}</span>
                <span className="text-xs bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-full">✓ Found</span>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="text-emerald-800 text-xs font-bold hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={cityValue}
                onChange={(e) => { setCityValue(e.target.value); setError(''); }}
                data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-city' : undefined}
                className={`w-full rounded-2xl px-5 py-4 text-lg font-bold text-[#382A21] bg-stone-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#1D3B2A] focus:ring-4 focus:ring-emerald-500/10 ${
                  error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
                }`}
              >
                <option value="">Select your city</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {gpsDenied && (
            <p className="text-stone-500 text-xs mt-3">
              Couldn&apos;t auto-detect city — pick from below or{' '}
              <button type="button" onClick={detectLocation} className="text-emerald-800 font-bold underline">
                retry GPS
              </button>.
            </p>
          )}
          {error && <p className="text-red-600 text-xs font-semibold mt-2">{error}</p>}

          <div className="mt-5 pt-4 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2.5">Popular Hubs</span>
            <div className="flex flex-wrap gap-2">
              {['Bangalore', 'Mumbai', 'Delhi', 'Goa', 'Pune', 'Hyderabad', 'Jaipur', 'Manali'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { hapticTap(); setCityValue(c); setError(''); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    cityValue === c
                      ? 'bg-[#1D3B2A] text-white shadow-xs'
                      : 'bg-stone-100 text-[#382A21] hover:bg-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-location-continue' : undefined}
        className="btn-primary w-full py-4 max-w-md mx-auto flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
