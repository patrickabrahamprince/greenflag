'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  Coffee, 
  Heart, 
  Shield, 
  Check, 
  Sparkles,
  Navigation,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  Compass
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useOnboardingStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Goa', 'Hyderabad',
  'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Manali', 'Coorg', 'Ooty', 'Mysore'
];

const ONBOARDING_SLIDES = [
  {
    badge: 'TRAVEL TRIPS + DATING',
    title: 'Meet People.\nTravel Together.\nDate on the Way.',
    desc: 'Weekend road trips, sunrise drives, and coffee walks with verified travelers.',
  },
  {
    badge: 'NATURAL CHEMISTRY',
    title: "Skip superficial swipes.\nConnect over real trips.",
    desc: 'Chemistry builds naturally over scenic mountain routes, beach retreats, and coffee stops.',
  },
  {
    badge: 'SAFE BY DESIGN',
    title: '100% ID Verified.\nDaylight first meets.',
    desc: 'Govt ID verification, public cafe meets, and women-only buddy circles.',
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setGlobalUser = useUserStore((s) => s.setUser);
  const setOnboardingLocation = useOnboardingStore((s) => s.setLocation);

  const [slide, setSlide] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [searchedLocationDetails, setSearchedLocationDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Fast prefetch next route
  useEffect(() => {
    router.prefetch('/trips');
    router.prefetch('/discover');
  }, [router]);

  const detectLocation = async () => {
    setGpsDetecting(true);
    hapticTap();
    try {
      let lat = 12.9716;
      let lng = 77.5946;

      if (Capacitor.isNativePlatform()) {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            setHasPermission(false);
            setGpsDetecting(false);
            toast.error('Location permission needed to locate you automatically.');
            return;
          }
        }
        setHasPermission(true);
        const position = await Geolocation.getCurrentPosition({ timeout: 6000, enableHighAccuracy: true });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } else if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000, enableHighAccuracy: true });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setHasPermission(true);
      }

      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data?.address;
      if (address) {
        const cityOrTown = address.city || address.town || address.suburb || address.county || address.state || 'Bangalore';
        const neighborhood = address.neighbourhood || address.suburb || address.road || '';
        const fullDetail = neighborhood ? `${neighborhood}, ${cityOrTown}` : cityOrTown;
        
        setSelectedCity(cityOrTown);
        setSearchedLocationDetails(`Searched: ${fullDetail} (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
        toast.success(`📍 Located: ${fullDetail}`);
      } else {
        setSelectedCity('Bangalore');
        setSearchedLocationDetails(`Searched: Bangalore (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
        toast.success('📍 Located: Bangalore');
      }
    } catch (err) {
      console.warn('GPS detection skipped or failed:', err);
      setSelectedCity('Bangalore');
      setSearchedLocationDetails('Searched: Bangalore (Default)');
      toast.success('📍 Location set to Bangalore');
    } finally {
      setGpsDetecting(false);
    }
  };

  const handleFinish = async () => {
    hapticSuccess();
    setCompleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          city: selectedCity,
          onboarding_completed: true,
          approval_status: 'approved',
          review_started_at: new Date().toISOString(),
        }).eq('id', user.id);

        const storeUser = useUserStore.getState().user;
        if (storeUser) {
          setGlobalUser({
            ...storeUser,
            city: selectedCity,
            onboarding_completed: true,
            approval_status: 'approved',
          });
        }
      }
      setOnboardingLocation(selectedCity, null, null);
    } catch (e) {
      console.error('Onboarding complete error:', e);
    }
    router.replace('/trips');
  };

  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-dvh w-full bg-white flex flex-col justify-between font-[Inter] relative overflow-hidden text-[#1C1C1E] max-w-md mx-auto select-none pt-safe-top pb-safe-bottom">
      
      {/* 1. TOP HEADER & WHERE ARE YOU LOCATED HERO CARD */}
      <div className="px-5 pt-4 z-20 space-y-3">
        
        {/* Brand Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              GF
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#1C1C1E]">GreenFlag</span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200/60">
            {slide + 1} of {ONBOARDING_SLIDES.length}
          </span>
        </div>

        {/* PROMINENT TOP LOCATION BOX */}
        <div className="bg-[#F9FAFB] rounded-3xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1C1C1E]" />
                Where are you located?
              </div>
              <div className="text-[16px] font-bold text-[#1C1C1E] mt-0.5">
                {selectedCity}
              </div>
            </div>

            {/* LOCATE ME GPS BUTTON */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={gpsDetecting}
              className="px-3.5 py-2 rounded-full bg-[#1C1C1E] hover:bg-black active:scale-95 transition text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {gpsDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-white" />
                  <span>Locate Me</span>
                </>
              )}
            </button>
          </div>

          {/* Searched Location Feedback Details */}
          {searchedLocationDetails && (
            <div className="bg-white rounded-2xl px-3 py-2 border border-stone-200/80 flex items-center justify-between text-[11px] text-[#1C1C1E] animate-fade-in font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1E]" />
                <span className="truncate">{searchedLocationDetails}</span>
              </div>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 shrink-0 ml-2">
                ✓ Verified
              </span>
            </div>
          )}

          {/* City Selector Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {INDIAN_CITIES.slice(0, 6).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  hapticTap();
                  setSelectedCity(city);
                  setSearchedLocationDetails(`Searched: ${city} (Manual)`);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                  selectedCity === city
                    ? 'bg-[#1C1C1E] text-white shadow-2xs font-bold'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {city}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-stone-500 border border-stone-200 shrink-0 hover:text-black"
            >
              + More
            </button>
          </div>

          {/* Privacy & Permission Notice */}
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 pt-0.5">
            <Lock className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Privacy protected: Exact GPS coordinates are never shown to other users.</span>
          </div>
        </div>

        {/* Segmented Slide Indicators */}
        <div className="flex gap-1.5 pt-1">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                hapticTap();
                setSlide(idx);
              }}
              className="h-1 flex-1 rounded-full overflow-hidden bg-stone-200 cursor-pointer"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  idx === slide ? 'w-full bg-[#1C1C1E]' : idx < slide ? 'w-full bg-stone-400' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. VISUAL SLIDE CONTENT (Explore Luxury Style) */}
      <div className="px-5 py-3 flex-1 flex flex-col justify-center">
        
        {/* Slide 0: Live Escapes preview */}
        {slide === 0 && (
          <div className="bg-[#F9FAFB] rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Weekend Getaway
              </span>
              <span className="text-[10px] font-bold text-[#1C1C1E] bg-white px-2.5 py-1 rounded-full border border-stone-200">
                ⭐ 4.9 Superhost
              </span>
            </div>
            <h2 className="text-[18px] font-extrabold text-[#1C1C1E]">
              Nandi Hills Sunrise Drive & Coffee Walk
            </h2>
            <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
              <span className="flex items-center gap-1">📍 Near {selectedCity}</span>
              <span>•</span>
              <span>☕ Breakfast Included</span>
              <span>•</span>
              <span>🚗 Convoy Meetup</span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <div className="flex -space-x-2">
                {['🧑‍🦱', '👩', '🧔', '👱‍♀️'].map((emoji, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-[#F9FAFB] flex items-center justify-center text-xs shadow-2xs">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-stone-700">4 Verified Travelers</span>
            </div>
          </div>
        )}

        {/* Slide 1: Real Chemistry */}
        {slide === 1 && (
          <div className="bg-[#F9FAFB] rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-3.5 animate-fade-in">
            {[
              { icon: '☕', title: '1. Coffee & Cafe Meet', desc: '60 min quick daylight connection' },
              { icon: '🚗', title: '2. Scenic Day Drive', desc: 'Half-day drive with road trip buddy' },
              { icon: '🏕️', title: '3. Weekend Escape', desc: 'Coorg or Gokarna group retreat' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 border border-stone-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-base">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#1C1C1E]">{step.title}</div>
                  <div className="text-[11px] text-stone-500 font-medium">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slide 2: Safety First */}
        {slide === 2 && (
          <div className="bg-[#F9FAFB] rounded-3xl p-5 border border-stone-200 shadow-2xs space-y-3 animate-fade-in">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] text-white flex items-center justify-center mx-auto mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="text-[15px] font-extrabold text-[#1C1C1E]">100% Verified Members</div>
              <p className="text-[12px] text-stone-500 mt-0.5">Safety & authenticity is built into every step.</p>
            </div>
            <div className="space-y-2 pt-1">
              {['Government ID Checked', 'Facial Biometric Match', 'Women-Safe Buddy Circles', 'Daylight First Meets'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-[12px] font-semibold text-stone-700 bg-white p-2.5 rounded-2xl border border-stone-200/80">
                  <div className="w-4 h-4 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM ACTIONS (Solid Luxury Black Capsules) */}
      <div className="px-5 pt-3 pb-6 space-y-3 z-20">
        <div className="space-y-1">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600 border border-stone-200/80">
            {ONBOARDING_SLIDES[slide].badge}
          </div>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] leading-tight whitespace-pre-line">
            {ONBOARDING_SLIDES[slide].title}
          </h1>
          <p className="text-[12px] text-stone-500 font-medium">
            {ONBOARDING_SLIDES[slide].desc}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          {slide > 0 && (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setSlide((s) => s - 1);
              }}
              className="h-12 px-5 rounded-full border border-stone-300 font-bold text-xs text-[#1C1C1E] bg-white active:scale-95 transition cursor-pointer"
            >
              Back
            </button>
          )}

          <button
            type="button"
            disabled={completing}
            onClick={() => {
              if (slide < ONBOARDING_SLIDES.length - 1) {
                hapticTap();
                setSlide((s) => s + 1);
              } else {
                handleFinish();
              }
            }}
            className="flex-1 h-12 rounded-full bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition cursor-pointer"
          >
            {completing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading Escapes...</span>
              </span>
            ) : slide < ONBOARDING_SLIDES.length - 1 ? (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Explore Escapes in {selectedCity}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ALL CITIES SEARCH MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[16px] font-extrabold text-[#1C1C1E]">Select City</div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-stone-400 hover:text-black font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-xs font-semibold text-[#1C1C1E] focus:outline-none focus:border-[#1C1C1E]"
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedCity(city);
                    setSearchedLocationDetails(`Searched: ${city} (Manual)`);
                    setShowLocationModal(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#1C1C1E] text-white shadow-2xs font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="w-full py-3 bg-[#1C1C1E] text-white font-bold rounded-full text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
