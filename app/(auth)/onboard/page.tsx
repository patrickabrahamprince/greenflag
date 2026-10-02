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
  Users, 
  Sparkles,
  Navigation,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useOnboardingStore } from '@/lib/store';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Goa', 'Hyderabad',
  'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Manali', 'Coorg'
];

const ONBOARDING_SLIDES = [
  {
    badge: 'TRAVEL TRIPS + DATING',
    title: 'Meet People.\nTravel Together.\nDate on the Way.',
    desc: 'Not another superficial swipe app. Real weekend getaways, sunrise drives, and coffee dates with verified travelers.',
    accent: 'from-emerald-400 to-teal-600',
  },
  {
    badge: 'NATURAL SPARKS',
    title: "You don't swipe\nbios. You share\nreal getaways.",
    desc: 'Romantic chemistry happens naturally over scenic drives, beach sunsets, and cozy homestays.',
    accent: 'from-orange-400 to-rose-500',
  },
  {
    badge: 'SAFE BY DESIGN',
    title: 'Every traveler\nverified. First\nmeets in daylight.',
    desc: 'Zero catfishing. 100% ID verification, public cafe meets, and verified female-only travel buddy circles.',
    accent: 'from-violet-500 to-indigo-600',
  },
  {
    badge: 'TRAVEL CHEMISTRY',
    title: 'Start with coffee,\nspark a connection,\nunlock getaways.',
    desc: 'From quick 60-min cafe dates to weekend road trips to Coorg and Gokarna — explore at your pace.',
    accent: 'from-amber-400 to-orange-600',
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setGlobalUser = useUserStore((s) => s.setUser);
  const setOnboardingLocation = useOnboardingStore((s) => s.setLocation);

  const [slide, setSlide] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // Touch & Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isInteracting = useRef<boolean>(false);

  // Auto-advance timer only when user is NOT interacting
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isInteracting.current && !showLocationModal) {
        setSlide((s) => (s + 1) % ONBOARDING_SLIDES.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [showLocationModal]);

  const onTouchStartHandler = (e: React.TouchEvent | React.MouseEvent) => {
    isInteracting.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchEndX.current = clientX;
  };

  const onTouchMoveHandler = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchEndX.current = clientX;
  };

  const onTouchEndHandler = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      hapticTap();
      setSlide((s) => Math.min(s + 1, ONBOARDING_SLIDES.length - 1));
    } else if (isRightSwipe) {
      hapticTap();
      setSlide((s) => Math.max(s - 1, 0));
    }

    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => {
      isInteracting.current = false;
    }, 3000);
  };

  const detectLocation = async () => {
    setGpsDetecting(true);
    hapticTap();
    try {
      let lat = 12.9716;
      let lng = 77.5946;

      if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({ timeout: 8000 });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } else if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.address;
      if (address) {
        const detected = address.city || address.town || address.county || address.state || 'Bangalore';
        setSelectedCity(detected);
        toast.success(`📍 Located in ${detected}`);
      } else {
        setSelectedCity('Bangalore');
      }
    } catch {
      setSelectedCity('Bangalore');
      toast.success('Location set to Bangalore');
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
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col justify-between font-[Inter] relative overflow-hidden text-black max-w-md mx-auto select-none">
      {/* Background radial dots and ambient gradients */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-gradient-to-br from-rose-200 via-orange-200 to-amber-200 rounded-full blur-[80px] opacity-60 pointer-events-none" />

      {/* Top Segmented Progress Bar & Location indicator */}
      <div className="pt-[max(16px,env(safe-area-inset-top,16px))] px-6 z-20">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-xs font-bold text-black/80 backdrop-blur-md active:scale-95 transition shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedCity}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full">Change</span>
          </button>

          <span className="text-xs font-bold text-black/40">
            {slide + 1} / {ONBOARDING_SLIDES.length}
          </span>
        </div>

        <div className="flex gap-1.5">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                hapticTap();
                setSlide(idx);
              }}
              className="h-1 flex-1 rounded-full overflow-hidden bg-black/10 cursor-pointer"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  idx === slide ? 'w-full bg-black' : idx < slide ? 'w-full bg-black/30' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Swipeable Visual Interactive Stage */}
      <div 
        className="relative flex-1 min-h-[320px] max-h-[420px] mx-4 mt-3 rounded-[32px] overflow-hidden border border-black/5 shadow-sm bg-white cursor-grab active:cursor-grabbing touch-pan-y"
        onTouchStart={onTouchStartHandler}
        onTouchMove={onTouchMoveHandler}
        onTouchEnd={onTouchEndHandler}
        onMouseDown={onTouchStartHandler}
        onMouseMove={onTouchMoveHandler}
        onMouseUp={onTouchEndHandler}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${ONBOARDING_SLIDES[slide].accent} opacity-[0.12] transition-all duration-500`}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* SLIDE 0: LIVE TRIP MAP */}
        {slide === 0 && (
          <div className="absolute inset-0 p-6 flex items-center justify-center animate-fade-in">
            <div className="relative w-full h-full">
              <div className="absolute inset-2 bg-white rounded-[24px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                <div className="w-full h-full relative bg-[#f8faf8]">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white border-y border-black/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-white border-x border-black/10" />

                  {/* Aarav Pin */}
                  <div className="absolute left-[30%] top-[35%]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg flex items-center justify-center text-white animate-[bounce_2s_infinite]">
                      🧑
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45" />
                  </div>

                  {/* Animated Dash Route */}
                  <svg className="absolute left-[35%] top-[45%] w-[30%] h-[20%] overflow-visible">
                    <path
                      d="M 0 0 Q 30 20 60 10"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  </svg>

                  {/* Meera Pin */}
                  <div className="absolute right-[28%] top-[48%]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg flex items-center justify-center text-white animate-[bounce_2s_0.3s_infinite]">
                      👩
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-3.5 py-1.5 rounded-full font-bold tracking-wide shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE IN {selectedCity.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: 3-STEP TRIP FLOW */}
        {slide === 1 && (
          <div className="absolute inset-0 p-5 flex flex-col justify-center gap-3 animate-fade-in">
            {[
              { icon: <MapPin className="w-5 h-5" />, label: 'Join Road Trips & Dates', color: 'from-amber-400 to-orange-500', step: '1', sub: 'Choose plans matching your vibe' },
              { icon: <Coffee className="w-5 h-5" />, label: 'Meet on the Journey', color: 'from-emerald-400 to-teal-500', step: '2', sub: 'Travel & connect in real life' },
              { icon: <Heart className="w-5 h-5" />, label: 'Spark & Keep In Touch', color: 'from-rose-400 to-pink-500', step: '3', sub: 'Real chemistry without ghosting' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04]"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md relative shrink-0`}
                >
                  {item.icon}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px]">{item.label}</div>
                  <div className="text-[11px] text-black/50">{item.sub}</div>
                </div>
                {idx < 2 && <ArrowRight className="w-4 h-4 text-black/20 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* SLIDE 2: SAFE BY DESIGN BADGES */}
        {slide === 2 && (
          <div className="absolute inset-0 flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-[260px] bg-white rounded-[28px] p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)] border border-black/5 relative">
              <div className="w-16 h-16 mx-auto rounded-[20px] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_12px_24px_-6px_rgba(16,185,129,0.4)] mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2.5">
                {[
                  'Face Verified Explorers',
                  'Govt ID Checked',
                  'Women-Only Group Circles',
                  'Live SOS & Location Share',
                ].map((txt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[12px] font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
              <div className="absolute -top-2.5 -right-2.5 bg-black text-white text-[9px] px-2.5 py-1 rounded-full font-bold shadow">
                SAFE
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: TRUST LADDER TIMELINE */}
        {slide === 3 && (
          <div className="absolute inset-0 p-6 flex items-center animate-fade-in">
            <div className="w-full relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-300 via-orange-400 to-rose-400 rounded-full" />
              {[
                { l: 'Level 1: Micro Date', d: '60 min coffee / breakfast', c: 'from-amber-300 to-orange-400', e: 'Public cafe' },
                { l: 'Level 2: Day Trip', d: 'Nandi Hills, Trekking', c: 'from-emerald-400 to-teal-500', e: 'Group of 4' },
                { l: 'Level 3: Weekend Getaway', d: 'Coorg, Gokarna, Ooty', c: 'from-violet-400 to-fuchsia-500', e: 'Verified rating 4.5+' },
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-3 mb-4 last:mb-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.c} shadow-md flex items-center justify-center text-white font-bold text-[11px] z-10 border-[2.5px] border-white shrink-0`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-3 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.1)] border border-black/[0.04]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-[12px]">{item.l}</div>
                        <div className="text-[10px] text-black/50">{item.d}</div>
                      </div>
                      <div className="text-[9px] px-2 py-0.5 rounded-full bg-black/5 font-medium">
                        {item.e}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swipe Hint overlay */}
        <div className="absolute bottom-2 inset-x-0 flex justify-between px-4 text-black/20 pointer-events-none">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-black/30">Swipe to flip</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Text & Actions Area */}
      <div className="bg-white rounded-t-[32px] px-6 pt-5 pb-[max(24px,env(safe-area-inset-bottom,24px))] flex flex-col shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.08)] border-t border-black/5 z-20">
        <div className="inline-flex self-start px-3 py-1 rounded-full bg-black/[0.06] text-[10px] font-bold tracking-widest mb-2.5">
          {ONBOARDING_SLIDES[slide].badge}
        </div>
        <h1 className="text-[26px] font-[800] leading-[1.05] tracking-tight whitespace-pre-line">
          {ONBOARDING_SLIDES[slide].title}
        </h1>
        <p className="text-[13px] leading-[1.4] text-black/60 mt-2 font-[450]">
          {ONBOARDING_SLIDES[slide].desc}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setSlide((s) => (s > 0 ? s - 1 : ONBOARDING_SLIDES.length - 1));
            }}
            className="h-[50px] px-5 rounded-full border border-black/10 font-semibold text-[14px] active:scale-[0.96] transition cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            disabled={completing}
            onClick={() => {
              if (slide === ONBOARDING_SLIDES.length - 1) {
                setShowLocationModal(true);
              } else {
                hapticTap();
                setSlide((s) => s + 1);
              }
            }}
            className="flex-1 h-[50px] rounded-full bg-black text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] active:scale-[0.98] transition cursor-pointer"
          >
            {completing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : slide === ONBOARDING_SLIDES.length - 1 ? (
              'Set Location & Start'
            ) : (
              'Next'
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide indicator dots */}
        <div className="flex justify-center gap-2 mt-4">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                hapticTap();
                setSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === slide ? 'w-7 bg-black' : 'w-1.5 bg-black/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Location Selection & Auto-Scan Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-black/10 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>

            <h3 className="font-[800] text-xl text-black text-center mb-1">
              Where are you located?
            </h3>
            <p className="text-xs text-black/60 text-center mb-4 leading-relaxed">
              We&apos;ll show road trips, meetups, and travel dates happening near you.
            </p>

            {/* Auto Scan GPS Button */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={gpsDetecting}
              className="w-full py-3.5 px-4 mb-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs cursor-pointer"
            >
              {gpsDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
                  <span>Scanning GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-emerald-700" />
                  <span>Auto-Scan My Location (GPS)</span>
                </>
              )}
            </button>

            {/* City Search Box */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or location..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-black/10 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Quick City Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar mb-5">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setSelectedCity(city);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer ${
                    selectedCity === city
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-stone-100 text-black/80 hover:bg-stone-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-black font-bold rounded-full text-xs transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLocationModal(false);
                  handleFinish();
                }}
                disabled={completing}
                className="flex-1 py-3 bg-[#1D3B2A] hover:bg-[#14281c] text-white font-bold rounded-full text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              >
                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Explore'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
