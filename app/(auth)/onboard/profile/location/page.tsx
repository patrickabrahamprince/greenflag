'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Navigation, Loader2, Lock, MapPin, Search } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useOnboardingStore } from '@/lib/store';
import { StepDots } from '@/components/shared/StepDots';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Goa', 'Hyderabad',
  'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Manali', 'Coorg', 'Ooty'
];

export default function ProfileLocationPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const setLocation = useOnboardingStore((s) => s.setLocation);

  const [cityValue, setCityValue] = useState(city || 'Bangalore');
  const [searchedDetail, setSearchedDetail] = useState<string | null>(null);
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
      const address = data?.address;
      if (!address) {
        setGpsDenied(true);
        return;
      }
      const parts = [address.city || address.town || address.county || address.suburb, address.state].filter(Boolean);
      const detected = parts.join(', ');
      const match = INDIAN_CITIES.find((c) => detected.toLowerCase().includes(c.toLowerCase()));
      const display = match || detected || 'Bangalore';
      setCityValue(display);
      setSearchedDetail(`Searched: ${detected} (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`);
      toast.success(`📍 Located: ${display}`);
    } catch {
      setGpsDenied(true);
    } finally {
      setGpsDetecting(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setGpsDetecting(true);
    setGpsDenied(false);

    try {
      if (Capacitor.isNativePlatform()) {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            setGpsDetecting(false);
            setGpsDenied(true);
            toast.error('Location permission needed');
            return;
          }
        }
        const position = await Geolocation.getCurrentPosition({ timeout: 6000, enableHighAccuracy: true });
        resolveCity(position.coords.latitude, position.coords.longitude);
        return;
      }

      if (!navigator.geolocation) {
        setGpsDetecting(false);
        setGpsDenied(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolveCity(position.coords.latitude, position.coords.longitude),
        () => {
          setGpsDetecting(false);
          setGpsDenied(true);
        },
        { timeout: 6000 }
      );
    } catch {
      setGpsDetecting(false);
      setGpsDenied(true);
    }
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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-between px-5 pt-safe-top pb-safe-bottom bg-white text-[#1C1C1E]">
      <OnboardingBackground image="/onboarding/location.jpg" />
      
      <div>
        {/* Header navigation */}
        <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/onboard/profile')}
            className="text-[#1C1C1E] bg-[#F4F4F5] hover:bg-stone-200 border border-stone-200 shadow-2xs active:scale-90 transition-all p-2.5 rounded-full"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="max-w-md mx-auto w-full mb-3">
          <StepDots current={2} total={6} />
        </div>
      </div>

      {/* Main Location Card at the Top */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-[#F9FAFB] border border-stone-200 rounded-3xl p-6 shadow-2xs space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-lg">
              📍
            </div>

            {/* Locate Me GPS Button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={gpsDetecting}
              className="px-3.5 py-2 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              {gpsDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Locate Me</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1">
              Where are you located?
            </h1>
            <p className="text-stone-500 text-xs font-medium">
              We match you with road trips, getaways, and singles starting near you.
            </p>
          </div>

          {/* Searched / Found Location Feedback */}
          {searchedDetail && (
            <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-stone-200 flex items-center justify-between text-xs text-[#1C1C1E] font-semibold animate-fade-in">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#1C1C1E]" />
                <span className="truncate">{searchedDetail}</span>
              </div>
              <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 font-bold shrink-0 ml-2">
                ✓ Verified
              </span>
            </div>
          )}

          {/* City Selection dropdown */}
          <div className="space-y-1.5">
            <select
              value={cityValue}
              onChange={(e) => { 
                setCityValue(e.target.value); 
                setSearchedDetail(`Searched: ${e.target.value} (Manual)`);
                setError(''); 
              }}
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-city' : undefined}
              className={`w-full rounded-2xl px-4 py-3.5 text-base font-bold text-[#1C1C1E] bg-white border transition-all duration-200 focus:outline-none focus:border-[#1C1C1E] ${
                error ? 'border-red-500 bg-red-50/30' : 'border-stone-200'
              }`}
            >
              <option value="">Select your city</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Popular City Quick Chips */}
          <div className="pt-2 border-t border-stone-200/80">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Popular Cities</span>
            <div className="flex flex-wrap gap-1.5">
              {INDIAN_CITIES.slice(0, 8).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setCityValue(c);
                    setSearchedDetail(`Searched: ${c} (Manual)`);
                    setError('');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer ${
                    cityValue === c
                      ? 'bg-[#1C1C1E] text-white font-bold shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Primer */}
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Privacy: Exact GPS coordinates are never displayed to other users.</span>
          </div>

        </div>
      </div>

      <button
        onClick={handleContinue}
        data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-location-continue' : undefined}
        className="w-full py-4 max-w-md mx-auto rounded-full bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-sm mb-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
