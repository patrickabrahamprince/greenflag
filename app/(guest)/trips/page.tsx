'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Zap,
  Info,
  Users,
  Shield,
  MessageCircle,
  Calendar,
  Fuel,
  LocateFixed,
  Radio,
  Loader2,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  Star,
  Award,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface Trip {
  id: number;
  destination: string;
  subtitle: string;
  time: string;
  spots: number;
  totalSpots: number;
  cost: number;
  type: 'green' | 'pink';
  category: 'sunrise' | 'coffee' | 'walk' | 'night' | 'micro' | 'women' | 'flash' | 'weekend';
  distance: string;
  routeTime: string;
  pickupHub: string;
  score: number;
  match: string;
  host: {
    name: string;
    avatar: string;
    level: number;
    verified: boolean;
  };
  vibe: string[];
  coverStyle: {
    bg: string;
    accent: string;
    badge: string;
  };
  pin: { x: number; y: number };
}

interface HeroSlide {
  id: number;
  tag: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  stats: string;
  tripId: number;
  bgGradient: string;
  accentColor: string;
  icon: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: '🌅 DAWN EXPEDITION',
    badgeBg: 'bg-emerald-900/80 text-emerald-300 border-emerald-700/50',
    title: 'Sunrise Above the Clouds',
    subtitle: 'Nandi Hills Fortress convoy with artisanal dawn filter chai',
    stats: '4.9 ★ · 2 Seats Available',
    tripId: 1,
    bgGradient: 'from-[#0d281a] via-[#091e13] to-[#040f09]',
    accentColor: 'text-emerald-400',
    icon: '⛰️',
  },
  {
    id: 2,
    tag: '☕ ARTISAN COFFEE EXPEDITION',
    badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-700/50',
    title: 'Coorg Private Coffee Tasting',
    subtitle: 'Estate walks, fresh single-origin roast & slow photography',
    stats: '4.85 ★ · 1 Spot Left',
    tripId: 2,
    bgGradient: 'from-[#2a1b10] via-[#1c120a] to-[#0e0905]',
    accentColor: 'text-amber-300',
    icon: '☕',
  },
  {
    id: 3,
    tag: '👩 100% FEMALE VERIFIED',
    badgeBg: 'bg-purple-900/80 text-purple-300 border-purple-700/50',
    title: 'Gokarna Beach & Cliff Circle',
    subtitle: 'Sunset yoga, secluded coves & beachside brunch circle',
    stats: '5.0 ★ · Women Safe Circle',
    tripId: 6,
    bgGradient: 'from-[#281330] via-[#1a0c20] to-[#0a040d]',
    accentColor: 'text-purple-300',
    icon: '🌊',
  },
  {
    id: 4,
    tag: '🌌 STARLIGHT TRAVERSE',
    badgeBg: 'bg-indigo-900/80 text-indigo-300 border-indigo-700/50',
    title: 'Skandagiri Midnight Ridge Climb',
    subtitle: 'Ascent under the stars for peak cloud inversions',
    stats: '4.95 ★ · Departs Tonight 11 PM',
    tripId: 4,
    bgGradient: 'from-[#121630] via-[#0b0e20] to-[#04060e]',
    accentColor: 'text-indigo-300',
    icon: '✨',
  },
];

const MARQUEE_ITEMS = [
  '⚡ Aarav confirmed 2 seats on Nandi Sunrise Convoy',
  '🛡️ 100% ID Verified & Escort-Free Protocol active',
  '🔥 Savandurga Flash Roadtrip departs in 2 hours',
  '☕ Meera opened Coorg Coffee Estate Cupping',
  '✨ Ananya joined Gokarna Women Circle',
  '📍 Indiranagar Hub: 18 departures scheduled today',
  '🌟 Top Rated Host Sanya reached Level 15 Explorer',
];

const TRIPS_DATA: Trip[] = [
  {
    id: 1,
    destination: 'Nandi Hills Sunrise Convoy',
    subtitle: 'Dawn cloud bed & heritage fortress drive',
    time: 'Today · 5:30 AM',
    spots: 2,
    totalSpots: 4,
    cost: 800,
    type: 'green',
    category: 'sunrise',
    distance: '54 km',
    routeTime: '1h 15m',
    pickupHub: 'Indiranagar 100ft Rd',
    score: 4.9,
    match: 'Shared affinity: Sunrise roadtrips & filter chai',
    host: { name: 'Aarav M.', avatar: 'A', level: 12, verified: true },
    vibe: ['Chai & Chill', 'Trek & Talk', 'Scenic Drive'],
    coverStyle: {
      bg: 'from-[#172e24] via-[#10241b] to-[#0a1711]',
      accent: 'text-emerald-400',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40',
    },
    pin: { x: 42, y: 22 },
  },
  {
    id: 2,
    destination: 'Coorg Private Coffee Trails',
    subtitle: 'Estate tasting, misty plantation & slow photography',
    time: 'Weekend · Sat 7:00 AM',
    spots: 1,
    totalSpots: 3,
    cost: 2400,
    type: 'pink',
    category: 'coffee',
    distance: '240 km',
    routeTime: '4h 30m',
    pickupHub: 'Koramangala 4th Block',
    score: 4.85,
    match: 'Coffee aficionado · Leica photographer',
    host: { name: 'Meera K.', avatar: 'M', level: 8, verified: true },
    vibe: ['Slow Travel', 'Photo Walks', 'Estate Stay'],
    coverStyle: {
      bg: 'from-[#331822] via-[#240f17] to-[#14080d]',
      accent: 'text-rose-300',
      badge: 'bg-rose-950/80 text-rose-300 border-rose-800/40',
    },
    pin: { x: 74, y: 68 },
  },
  {
    id: 3,
    destination: 'Cubbon Heritage Botanical Walk',
    subtitle: 'Bamboo groves, morning acoustics & artisanal roast',
    time: 'Today · 6:00 PM',
    spots: 3,
    totalSpots: 5,
    cost: 0,
    type: 'green',
    category: 'micro',
    distance: '4.2 km',
    routeTime: '15m',
    pickupHub: 'MG Road Metro Hub',
    score: 4.75,
    match: 'Architects & designers network meetup',
    host: { name: 'Rohan V.', avatar: 'R', level: 5, verified: true },
    vibe: ['City Walks', 'Deep Talks', 'Architecture'],
    coverStyle: {
      bg: 'from-[#2e2617] via-[#201a0f] to-[#120e08]',
      accent: 'text-amber-300',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/40',
    },
    pin: { x: 48, y: 46 },
  },
  {
    id: 4,
    destination: 'Skandagiri Starlight Traverse',
    subtitle: 'Night ridge ascent for peak cloud inversions',
    time: 'Tonight · 11:00 PM',
    spots: 2,
    totalSpots: 6,
    cost: 1200,
    type: 'green',
    category: 'night',
    distance: '62 km',
    routeTime: '1h 30m',
    pickupHub: 'Hebbal Expressway',
    score: 4.95,
    match: 'High-altitude verified mountain hikers',
    host: { name: 'Sanya D.', avatar: 'S', level: 15, verified: true },
    vibe: ['Night Trek', 'Stargazing', 'Adrenaline'],
    coverStyle: {
      bg: 'from-[#191e3b] via-[#101429] to-[#090b17]',
      accent: 'text-indigo-300',
      badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/40',
    },
    pin: { x: 38, y: 16 },
  },
  {
    id: 5,
    destination: 'Araku Daylight Pour-Over & Jazz',
    subtitle: 'Single origin tasting & curated slow conversation',
    time: 'Today · 4:00 PM',
    spots: 1,
    totalSpots: 2,
    cost: 450,
    type: 'pink',
    category: 'micro',
    distance: '2.5 km',
    routeTime: '10m',
    pickupHub: 'Indiranagar 12th Main',
    score: 4.9,
    match: 'Specialty coffee roaster · Vinyl enthusiast',
    host: { name: 'Kabir T.', avatar: 'K', level: 9, verified: true },
    vibe: ['Micro Date', 'Pour Over', 'Indie Vinyl'],
    coverStyle: {
      bg: 'from-[#291e14] via-[#1a130c] to-[#0d0906]',
      accent: 'text-amber-300',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/40',
    },
    pin: { x: 56, y: 42 },
  },
  {
    id: 6,
    destination: 'Gokarna Beach & Cliff Circle',
    subtitle: 'Sunset yoga, secluded coves & beachside brunch circle',
    time: 'Fri · 9:00 PM',
    spots: 2,
    totalSpots: 5,
    cost: 3400,
    type: 'pink',
    category: 'women',
    distance: '480 km',
    routeTime: '8h drive',
    pickupHub: 'Indiranagar Metro Hub',
    score: 5.0,
    match: 'Verified safe women explorers circle',
    host: { name: 'Ananya S.', avatar: 'A', level: 14, verified: true },
    vibe: ['Women-Only', 'Beach Yoga', 'Coastal Trail'],
    coverStyle: {
      bg: 'from-[#2e1330] via-[#1d0c20] to-[#0d040e]',
      accent: 'text-purple-300',
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/40',
    },
    pin: { x: 82, y: 55 },
  },
  {
    id: 7,
    destination: 'Savandurga Monolith Flash Roadtrip',
    subtitle: 'Asia’s largest monolith sunset hike & dhaba dinner',
    time: '⚡ Today · 3:30 PM',
    spots: 1,
    totalSpots: 4,
    cost: 950,
    type: 'green',
    category: 'flash',
    distance: '48 km',
    routeTime: '1h 10m',
    pickupHub: 'HSR Layout BDA',
    score: 4.88,
    match: 'Adrenaline roadtrips & sunset viewpoints',
    host: { name: 'Dev R.', avatar: 'D', level: 11, verified: true },
    vibe: ['Flash Escape', 'Rock Monolith', 'Dhaba Food'],
    coverStyle: {
      bg: 'from-[#2b170c] via-[#1b0e07] to-[#0c0603]',
      accent: 'text-orange-400',
      badge: 'bg-orange-950/80 text-orange-300 border-orange-800/40',
    },
    pin: { x: 28, y: 52 },
  },
  {
    id: 8,
    destination: 'Chikmagalur Mullayanagiri Peak Retreat',
    subtitle: 'Highest peak sunset trek, waterfalls & estate stay',
    time: 'Sat · 6:00 AM',
    spots: 2,
    totalSpots: 4,
    cost: 2800,
    type: 'green',
    category: 'weekend',
    distance: '245 km',
    routeTime: '4h 45m',
    pickupHub: 'Yeshwanthpur Hub',
    score: 4.92,
    match: 'Mountain trails & homestay bonfires',
    host: { name: 'Vikram N.', avatar: 'V', level: 10, verified: true },
    vibe: ['Peak Summit', 'Campfire', 'Estate Stay'],
    coverStyle: {
      bg: 'from-[#14261d] via-[#0d1a13] to-[#060d09]',
      accent: 'text-emerald-300',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40',
    },
    pin: { x: 62, y: 78 },
  },
];


interface PlaceSearchResult {
  id: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

const POPULAR_NEIGHBORHOODS = [
  { name: 'Indiranagar 100ft Rd', city: 'Bengaluru, Karnataka' },
  { name: 'Koramangala 4th Block', city: 'Bengaluru, Karnataka' },
  { name: 'HSR Layout Sector 1', city: 'Bengaluru, Karnataka' },
  { name: 'MG Road / Church Street', city: 'Bengaluru, Karnataka' },
  { name: 'Whitefield ITPL Main Rd', city: 'Bengaluru, Karnataka' },
  { name: 'Jayanagar 4th Block', city: 'Bengaluru, Karnataka' },
  { name: 'JP Nagar Phase 2', city: 'Bengaluru, Karnataka' },
  { name: 'Hebbal / Airport Expressway', city: 'Bengaluru, Karnataka' },
];

const POPULAR_DESTINATION_CITIES = [
  { name: 'Coorg Coffee Estates', city: 'Karnataka' },
  { name: 'Nandi Hills Fortress', city: 'Chikkaballapur, Karnataka' },
  { name: 'Gokarna Beach Trail', city: 'Uttara Kannada, Karnataka' },
  { name: 'Chikmagalur Peak', city: 'Karnataka' },
  { name: 'Ooty & Nilgiris', city: 'Tamil Nadu' },
  { name: 'Goa Coastal Circle', city: 'North & South Goa' },
  { name: 'Mumbai Sea Link', city: 'Maharashtra' },
  { name: 'Delhi NCR & Gurgaon', city: 'Delhi NCR' },
];

function TripsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Zomato-Style Location State
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Indiranagar, Bengaluru',
    city: 'Bengaluru, Karnataka',
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationGpsScanning, setLocationGpsScanning] = useState(false);

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<'explore' | 'create'>('explore');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeMapPin, setActiveMapPin] = useState<Trip | null>(TRIPS_DATA[0]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Slideshow State
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const slideTouchStartX = useRef<number | null>(null);

  // Auto-advance slideshow every 4.5s
  useEffect(() => {
    if (isSlidePaused || activeTab !== 'explore') return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSlidePaused, activeTab]);

  // Interactive Map Pan & Zoom State with Multi-Touch Pinch Zoom
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState<number>(1);
  const isMapDragging = useRef<boolean>(false);
  const mapDragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapPanStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchDistanceStart = useRef<number | null>(null);
  const pinchZoomStart = useRef<number>(1);

  const handleMapPointerDown = (clientX: number, clientY: number) => {
    isMapDragging.current = true;
    mapDragStart.current = { x: clientX, y: clientY };
    mapPanStart.current = { x: mapPan.x, y: mapPan.y };
  };

  const handleMapPointerMove = (clientX: number, clientY: number) => {
    if (!isMapDragging.current) return;
    const dx = clientX - mapDragStart.current.x;
    const dy = clientY - mapDragStart.current.y;
    const newX = Math.max(-240, Math.min(240, mapPanStart.current.x + dx));
    const newY = Math.max(-180, Math.min(180, mapPanStart.current.y + dy));
    setMapPan({ x: newX, y: newY });
  };

  const handleMapPointerUp = () => {
    isMapDragging.current = false;
  };

  const handleMapTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isMapDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDistanceStart.current = dist;
      pinchZoomStart.current = mapZoom;
    } else if (e.touches.length === 1) {
      handleMapPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistanceStart.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / pinchDistanceStart.current;
      const newZoom = Math.max(0.65, Math.min(2.6, pinchZoomStart.current * scale));
      setMapZoom(newZoom);
    } else if (e.touches.length === 1) {
      handleMapPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMapTouchEnd = () => {
    pinchDistanceStart.current = null;
    handleMapPointerUp();
  };

  const handleMapWheel = (e: React.WheelEvent) => {
    const zoomFactor = -e.deltaY * 0.0015;
    setMapZoom((z) => Math.max(0.65, Math.min(2.6, z + zoomFactor)));
  };

  // Bulletproof Location Detection with Native Permissions & Multi-tier Fallbacks
  const detectCurrentLocation = async () => {
    setLocationGpsScanning(true);
    hapticTap();
    try {
      let lat: number | null = null;
      let lng: number | null = null;

      // 1. Try Native Capacitor Geolocation with permissions
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            await Geolocation.requestPermissions({ permissions: ['location'] });
          }
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          try {
            const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 8000 });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {}
        }
      }

      // 2. Try HTML5 Browser Geolocation
      if (lat === null && typeof window !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 9000,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 7000,
              });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {}
        }
      }

      // 3. Fallback to IP Geolocation if GPS is unavailable
      if (lat === null) {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lng = ipData.longitude;
            }
            const city = ipData.city || 'Bengaluru';
            const region = ipData.region || 'Karnataka';
            setSelectedLocation({
              name: `${city}, ${region}`,
              city: `${city}, ${region}`,
            });
            hapticSuccess();
            toast.success(`📍 Located in ${city}!`, {
              style: { background: '#141414', color: '#FAF7F2' },
            });
            setShowLocationModal(false);
            return;
          }
        } catch {}
      }

      if (lat !== null && lng !== null) {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          const locality = data.locality || data.address?.suburb || data.address?.neighbourhood || data.address?.city || 'Indiranagar';
          const city = data.city || data.address?.city || 'Bengaluru';
          const state = data.state || data.address?.state || 'Karnataka';
          const formattedName = locality !== city ? `${locality}, ${city}` : `${city}, ${state}`;

          setSelectedLocation({
            name: formattedName,
            city: `${city}, ${state}`,
          });
          hapticSuccess();
          toast.success(`📍 Locked to ${locality}!`, {
            style: { background: '#141414', color: '#FAF7F2' },
          });
          setShowLocationModal(false);
          return;
        }
      }

      // Graceful fallback
      setSelectedLocation({
        name: 'Indiranagar, Bengaluru',
        city: 'Bengaluru, Karnataka',
      });
      hapticSuccess();
      toast.success('📍 Set to Indiranagar Hub', {
        style: { background: '#141414', color: '#FAF7F2' },
      });
      setShowLocationModal(false);
    } catch {
      setSelectedLocation({
        name: 'Indiranagar, Bengaluru',
        city: 'Bengaluru, Karnataka',
      });
      toast.success('📍 Set to Indiranagar Hub', {
        style: { background: '#141414', color: '#FAF7F2' },
      });
      setShowLocationModal(false);
    } finally {
      setLocationGpsScanning(false);
    }
  };

  // 5-Step Interactive Form State
  const [createStep, setCreateStep] = useState<number>(1);
  const [createLadder, setCreateLadder] = useState<'micro' | 'day' | 'getaway' | 'crawl'>('day');
  const [createDestination, setCreateDestination] = useState('');
  const [placesResults, setPlacesResults] = useState<PlaceSearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchPlacesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [createPickup, setCreatePickup] = useState('Indiranagar 100ft Rd, Bengaluru');
  const [gpsScanning, setGpsScanning] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [createDate, setCreateDate] = useState('This Saturday');
  const [createTimeSlot, setCreateTimeSlot] = useState('🌅 Dawn Sunrise · 5:30 AM');
  const [createType, setCreateType] = useState<'green' | 'pink' | 'women'>('green');
  const [createGroupSize, setCreateGroupSize] = useState('2-4');
  const [createRide, setCreateRide] = useState('🚗 Private Car · 3 Spots');
  const [createCost, setCreateCost] = useState<number>(800);
  const [createVibes, setCreateVibes] = useState<string[]>(['Chai & Chill', 'Trek & Talk', 'Scenic Drive']);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDestinationType = (val: string) => {
    setCreateDestination(val);
    if (searchPlacesTimeoutRef.current) {
      clearTimeout(searchPlacesTimeoutRef.current);
    }
    if (!val.trim() || val.trim().length < 2) {
      setPlacesResults([]);
      setIsSearchingPlaces(false);
      return;
    }
    setIsSearchingPlaces(true);
    searchPlacesTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setPlacesResults(data.results || []);
        } else {
          setPlacesResults([]);
        }
      } catch {
        setPlacesResults([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 280);
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    hapticTap();
    setCreateDestination(place.fullText || place.mainText);
    setPlacesResults([]);
  };

  const detectUserLocation = useCallback(async () => {
    hapticTap();
    setGpsScanning(true);
    setGpsDetected(false);

    const resolveCoords = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address;
          const locality =
            addr?.neighbourhood ||
            addr?.suburb ||
            addr?.city_district ||
            addr?.city ||
            addr?.town ||
            'Indiranagar, Bengaluru';
          setCreatePickup(`${locality}, Bengaluru`);
          setGpsDetected(true);
          hapticSuccess();
          toast.success(`📍 Located: ${locality}`, {
            style: { background: '#141414', color: '#FAF7F2', border: '1px solid rgba(255,255,255,0.1)' },
          });
        } else {
          setCreatePickup('Indiranagar 100ft Rd, Bengaluru');
          setGpsDetected(true);
        }
      } catch {
        setCreatePickup('Indiranagar 100ft Rd, Bengaluru');
        setGpsDetected(true);
      } finally {
        setGpsScanning(false);
      }
    };

    if (Capacitor.isNativePlatform()) {
      Geolocation.getCurrentPosition({ timeout: 10000 })
        .then((pos) => resolveCoords(pos.coords.latitude, pos.coords.longitude))
        .catch(() => {
          setGpsScanning(false);
          setCreatePickup('Indiranagar 100ft Rd, Bengaluru');
          toast('Location locked to Indiranagar Hub', {
            icon: '📍',
            style: { background: '#141414', color: '#FAF7F2' },
          });
        });
      return;
    }

    if (!navigator.geolocation) {
      setGpsScanning(false);
      setCreatePickup('Indiranagar 100ft Rd, Bengaluru');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolveCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setGpsScanning(false);
        setCreatePickup('Indiranagar 100ft Rd, Bengaluru');
        toast('Location locked to Indiranagar Hub', {
          icon: '📍',
          style: { background: '#141414', color: '#FAF7F2' },
        });
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (searchParams.get('tab') === 'create') {
      setActiveTab('create');
    } else {
      setActiveTab('explore');
    }
  }, [searchParams]);

  const filteredTrips = TRIPS_DATA.filter((trip) => {
    if (selectedFilter === 'Dates' && trip.type !== 'pink') return false;
    if (selectedFilter === 'Buddies' && trip.type !== 'green') return false;
    if (selectedFilter === 'Women-Only' && trip.category !== 'women') return false;
    if (selectedFilter === 'Sunrise' && trip.category !== 'sunrise') return false;
    if (selectedFilter === 'Coffee' && trip.category !== 'coffee' && trip.category !== 'micro') return false;
    if (selectedFilter === 'Night' && trip.category !== 'night') return false;
    if (selectedFilter === 'Flash' && trip.category !== 'flash') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      trip.destination.toLowerCase().includes(q) ||
      trip.subtitle.toLowerCase().includes(q) ||
      trip.host.name.toLowerCase().includes(q) ||
      trip.pickupHub.toLowerCase().includes(q) ||
      trip.vibe.some((v) => v.toLowerCase().includes(q))
    );
  });

  const toggleVibe = (tag: string) => {
    hapticTap();
    setCreateVibes((prev) =>
      prev.includes(tag) ? prev.filter((v) => v !== tag) : [...prev, tag]
    );
  };

  const handlePublish = () => {
    hapticSuccess();
    setIsPublished(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex flex-col font-sans relative overflow-x-hidden text-[#18181B] max-w-md mx-auto select-none antialiased">
      
      {/* Luxury Subtle Atmosphere Light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-gradient-to-b from-[#EFE9DF]/80 via-[#FAF8F5]/40 to-transparent pointer-events-none z-0" />
      <div className="fixed -top-20 -left-20 w-72 h-72 bg-[#E3DAC9]/40 rounded-full blur-3xl pointer-events-none" />

      {/* ================= EDITORIAL TOP BRAND HEADER & SWITCHER ================= */}
      <header className="px-5 pt-[max(12px,env(safe-area-inset-top,12px))] pb-2 bg-[#FAF8F5]/95 backdrop-blur-2xl sticky top-0 z-30 border-b border-[#18181B]/[0.05]">
        
        {/* Zomato-Style Location Bar */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setShowLocationModal(true);
            }}
            className="flex items-center gap-2 text-left group active:scale-[0.98] transition cursor-pointer max-w-[260px]"
          >
            <div className="w-7 h-7 rounded-full bg-[#1A382B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 font-[800] text-[13px] text-[#18181B] leading-none">
                <span className="truncate">{selectedLocation.name}</span>
                <span className="text-[9px] text-[#18181B]/40">▼</span>
              </div>
              <div className="text-[10px] text-[#18181B]/50 font-medium truncate mt-0.5">
                {selectedLocation.city}
              </div>
            </div>
          </button>

          <div className="flex bg-[#EDE8DF] p-0.5 rounded-xl gap-0.5 border border-[#18181B]/[0.04]">
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setActiveTab('explore');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white text-[#18181B] shadow-xs'
                  : 'text-[#18181B]/50 hover:text-[#18181B]'
              }`}
            >
              Discover
            </button>
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setActiveTab('create');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#18181B] text-white shadow-xs'
                  : 'text-[#18181B]/50 hover:text-[#18181B]'
              }`}
            >
              Host
            </button>
          </div>
        </div>

        {/* Subtle Live Marquee Ticker */}
        <div className="w-full bg-[#F0ECE1] py-1 px-2.5 rounded-full overflow-hidden border border-[#18181B]/[0.06] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex items-center gap-6 whitespace-nowrap text-[10px] font-medium text-[#18181B]/70">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5">
                  {item}
                  <span className="text-[#18181B]/30 mx-1">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col pb-36 z-10">
        
        {/* ================= VIEW 1: DISCOVER ================= */}
        {activeTab === 'explore' && (
          <div className="h-full flex flex-col animate-fade-in space-y-4 pt-2">
            
            {/* Search Bar & Clean Filter Chips */}
            <div className="px-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#18181B]/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search escapes, destinations, or hosts..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-[#18181B]/[0.08] text-[12px] placeholder:text-[#18181B]/35 font-medium text-[#18181B] focus:outline-none focus:border-[#18181B]/40 shadow-xs"
                />
              </div>

              {/* Minimalist Filter Chips */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-0.5">
                {['All', 'Sunrise', 'Coffee', 'Dates', 'Buddies', 'Women-Only'].map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedFilter(filter);
                      }}
                      className={`shrink-0 h-6 px-3 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                        selectedFilter === filter
                          ? 'bg-[#18181B] text-white shadow-xs'
                          : 'bg-white border border-[#18181B]/[0.08] text-[#18181B]/60 hover:text-[#18181B]'
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* ================= SLEEK FEATURED SLIDESHOW ================= */}
            <div className="px-5">
              <div 
                className="relative rounded-[22px] overflow-hidden shadow-sm border border-[#18181B]/[0.08] select-none cursor-pointer"
                onMouseEnter={() => setIsSlidePaused(true)}
                onMouseLeave={() => setIsSlidePaused(false)}
                onTouchStart={(e) => {
                  setIsSlidePaused(true);
                  slideTouchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  setIsSlidePaused(false);
                  if (slideTouchStartX.current !== null) {
                    const diff = e.changedTouches[0].clientX - slideTouchStartX.current;
                    if (diff > 40) {
                      setHeroSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
                      hapticTap();
                    } else if (diff < -40) {
                      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
                      hapticTap();
                    }
                    slideTouchStartX.current = null;
                  }
                }}
              >
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === heroSlideIndex;
                  const slideTrip = TRIPS_DATA.find((t) => t.id === slide.tripId) || TRIPS_DATA[0];
                  return (
                    <div
                      key={slide.id}
                      onClick={() => {
                        hapticTap();
                        setSelectedTrip(slideTrip);
                      }}
                      className={`p-4 bg-gradient-to-br ${slide.bgGradient} text-white transition-opacity duration-300 relative flex flex-col justify-between min-h-[140px] ${
                        isActive ? 'block opacity-100' : 'hidden opacity-0'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${slide.badgeBg}`}>
                          {slide.tag}
                        </span>
                        <span className="text-[10px] text-white/70 font-semibold">{slide.stats}</span>
                      </div>

                      <div className="my-1.5">
                        <h3 className="font-[800] text-[16px] text-white leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-[11px] text-white/70 truncate mt-0.5">
                          {slide.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          {HERO_SLIDES.map((_, dotIdx) => (
                            <div
                              key={dotIdx}
                              className={`h-1 rounded-full transition-all ${
                                dotIdx === heroSlideIndex ? 'w-4 bg-white' : 'w-1 bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-white flex items-center gap-0.5">
                          View Trip <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= INTERACTIVE EDITORIAL MAP CANVAS ================= */}
            <div className="px-5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="text-[12px] font-[800] text-[#18181B]">Explore Nearby Routes</span>
                </div>
                <span className="text-[10px] text-[#18181B]/45 font-medium">Pinch to zoom</span>
              </div>

              <div 
                className="relative h-[220px] bg-[#E8EDE6] overflow-hidden rounded-[24px] border border-[#18181B]/[0.08] shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] select-none cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={(e) => handleMapPointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMapPointerMove(e.clientX, e.clientY)}
                onMouseUp={handleMapPointerUp}
                onMouseLeave={handleMapPointerUp}
                onTouchStart={handleMapTouchStart}
                onTouchMove={handleMapTouchMove}
                onTouchEnd={handleMapTouchEnd}
                onWheel={handleMapWheel}
              >
                {/* Map World Layer */}
                <div
                  className="absolute inset-[-150px] transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  {/* Subtle Grid */}
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#18181B 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Roads & Topo */}
                  <div className="absolute inset-0 p-5 pointer-events-none">
                    <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 300 C 250 180, 450 500, 800 350" fill="none" stroke="#FFFFFF" strokeWidth="16" />
                      <path d="M 180 0 C 220 280, 320 400, 400 800" fill="none" stroke="#CBD5E1" strokeWidth="10" />
                      <path d="M 450 0 C 400 250, 580 420, 540 800" fill="none" stroke="#FFFFFF" strokeWidth="12" />
                      <ellipse cx="320" cy="380" rx="80" ry="60" fill="rgba(186, 230, 253, 0.6)" stroke="#93C5FD" strokeWidth="1.5" />
                    </svg>

                    {/* Central User Location */}
                    <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-ping absolute" />
                      <div className="w-5 h-5 rounded-full bg-emerald-600 border border-white shadow-xs flex items-center justify-center text-white text-[8px] font-bold">
                        📍
                      </div>
                    </div>
                  </div>

                  {/* Map Pins */}
                  {filteredTrips.map((trip) => {
                    const isSelected = activeMapPin?.id === trip.id;
                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          hapticTap();
                          setActiveMapPin(trip);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 pointer-events-auto ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110 active:scale-95'
                        }`}
                        style={{ left: `${trip.pin.x}%`, top: `${trip.pin.y}%` }}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold whitespace-nowrap mb-0.5 shadow-sm border ${
                            isSelected 
                              ? 'bg-[#18181B] text-white border-white'
                              : trip.type === 'pink'
                              ? 'bg-rose-600 text-white border-rose-300'
                              : 'bg-[#1A382B] text-white border-emerald-300'
                          }`}>
                            ₹{trip.cost}
                          </div>
                          <div className={`w-6 h-6 rounded-full border text-white flex items-center justify-center text-[10px] font-bold shadow-sm ${
                            isSelected ? 'border-emerald-400 bg-black' : 'border-white bg-[#18181B]'
                          }`}>
                            {trip.type === 'pink' ? '✦' : '●'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Floating Zoom Buttons */}
                <div className="absolute right-2.5 top-2.5 z-30 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticTap();
                      setMapZoom((z) => Math.min(2.4, z + 0.25));
                    }}
                    className="w-6 h-6 bg-white rounded-full shadow-xs flex items-center justify-center font-bold text-[11px] border border-[#18181B]/[0.08]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticTap();
                      setMapZoom((z) => Math.max(0.7, z - 0.25));
                    }}
                    className="w-6 h-6 bg-white rounded-full shadow-xs flex items-center justify-center font-bold text-[11px] border border-[#18181B]/[0.08]"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>

            {/* ================= CLEAN PIN ACTIVITY OVERVIEW CARD ================= */}
            {activeMapPin && (
              <div className="px-5">
                <div className="p-3.5 bg-white rounded-[20px] border border-[#18181B]/[0.08] shadow-sm flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                        activeMapPin.category === 'women'
                          ? 'bg-purple-100 text-purple-900'
                          : activeMapPin.type === 'pink'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {activeMapPin.category === 'women' ? 'Women Safe' : activeMapPin.type === 'pink' ? 'Curated Date' : 'Roadtrip'}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">• {activeMapPin.time}</span>
                    </div>

                    <h4 className="font-[800] text-[14px] text-[#18181B] truncate mt-0.5">
                      {activeMapPin.destination}
                    </h4>
                    
                    <div className="text-[10px] text-[#18181B]/55 truncate mt-0.5 flex items-center gap-1">
                      <span>Host: {activeMapPin.host.name} (★{activeMapPin.score})</span>
                      <span>•</span>
                      <strong className="text-[#18181B]">₹{activeMapPin.cost}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSelectedTrip(activeMapPin);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#18181B] text-white font-bold text-[11px] shrink-0 active:scale-95 transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>View Plan</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= SECTION 1: 🌟 CURATED ESCAPES ================= */}
            <div className="px-5 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-[800] text-[#18181B]">
                  🌟 Trending Escapes
                </h3>
                <span className="text-[10px] text-[#18181B]/45 font-semibold">
                  {filteredTrips.length} Available
                </span>
              </div>

              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
              >
                {filteredTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSelectedTrip(trip);
                    }}
                    className="snap-start shrink-0 w-[260px] text-left bg-white rounded-[20px] border border-[#18181B]/[0.07] shadow-xs overflow-hidden active:scale-[0.985] transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className={`p-3 bg-gradient-to-br ${trip.coverStyle.bg} text-white`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.2 rounded-full border ${trip.coverStyle.badge}`}>
                          {trip.type === 'pink' ? 'Date' : 'Roadtrip'}
                        </span>
                        <span className="text-[10px] font-bold text-white/90">★ {trip.score}</span>
                      </div>
                      <h4 className="font-[800] text-[14px] text-white truncate mt-2">
                        {trip.destination}
                      </h4>
                      <p className="text-[10px] text-white/70 truncate">{trip.subtitle}</p>
                    </div>

                    <div className="p-3 flex items-center justify-between border-t border-[#18181B]/[0.05]">
                      <div>
                        <div className="text-[9px] text-[#18181B]/45 uppercase font-bold">Split</div>
                        <div className="text-[12px] font-[800] text-[#18181B]">
                          {trip.cost === 0 ? 'Free' : `₹${trip.cost}`}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {trip.totalSpots - trip.spots} spots left
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ================= SECTION 2: ☕ MICRO DATES ================= */}
            <div className="px-5 pt-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-[800] text-[#18181B]">
                  ☕ Daylight Micro Dates
                </h3>
                <span className="text-[10px] text-[#18181B]/45 font-semibold">1-on-1 Cafe Meets</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TRIPS_DATA.filter((t) => t.category === 'micro' || t.category === 'coffee').slice(0, 2).map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSelectedTrip(trip);
                    }}
                    className="p-3 rounded-[18px] bg-white border border-[#18181B]/[0.07] shadow-xs text-left active:scale-[0.98] transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                          {trip.category === 'micro' ? '☕ 60m' : '🌱 Estate'}
                        </span>
                        <span className="text-[9px] font-bold text-stone-600">★ {trip.score}</span>
                      </div>
                      <h4 className="font-[800] text-[12px] text-[#18181B] truncate">
                        {trip.destination}
                      </h4>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#18181B]/[0.05] flex items-center justify-between text-[10px]">
                      <span className="text-[#18181B]/45">{trip.time.split('·')[0]}</span>
                      <strong className="text-[#18181B]">{trip.cost === 0 ? 'Free' : `₹${trip.cost}`}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ================= SECTION 3: 👩 WOMEN-ONLY SAFE CIRCLES ================= */}
            <div className="px-5 pt-1">
              <div className="p-3.5 rounded-[20px] bg-[#221028] text-white shadow-xs border border-purple-800/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">👩</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-purple-300">
                      Women-Only Circle
                    </span>
                  </div>
                  <h4 className="font-[800] text-[13px] text-white mt-0.5">Gokarna Coastal Yoga & Trail</h4>
                  <p className="text-[10px] text-purple-200/70">Verified safe female lead · ₹3,400 / person</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    const gokarnaTrip = TRIPS_DATA.find((t) => t.category === 'women') || TRIPS_DATA[0];
                    setSelectedTrip(gokarnaTrip);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-purple-950 font-bold text-[10px] active:scale-95 transition shadow-xs cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: HOST AN ESCAPE (5-STEP WIZARD) ================= */}
        {activeTab === 'create' && (
          <div className="px-5 pt-3.5 flex flex-col justify-between animate-fade-in">
            <div>
              {/* Header Navigation with Luxury Ticker */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {createStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setCreateStep((s) => Math.max(1, s - 1));
                      }}
                      className="w-7 h-7 rounded-full bg-white border border-[#18181B]/[0.08] flex items-center justify-center text-[#18181B] font-bold text-xs shadow-xs transition active:scale-90 cursor-pointer"
                    >
                      ←
                    </button>
                  )}
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/60">
                    STEP {createStep.toString().padStart(2, '0')} / 05
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScoreInfo(!showScoreInfo)}
                  className="w-7 h-7 rounded-full bg-white border border-[#18181B]/[0.08] flex items-center justify-center cursor-pointer hover:bg-black/5 transition shadow-xs"
                >
                  <Info className="w-3.5 h-3.5 text-[#18181B]/60" />
                </button>
              </div>

              {/* Fine Segmented Hairline Progress */}
              <div className="grid grid-cols-5 gap-1.5 mb-5 mt-1.5">
                {[1, 2, 3, 4, 5].map((st) => (
                  <div key={st} className="h-1 rounded-full overflow-hidden bg-[#18181B]/[0.08]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        st <= createStep ? 'bg-[#18181B] w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {showScoreInfo && (
                <div className="mb-4 p-4 rounded-2xl bg-[#18181B] text-[#FAF8F5] text-[11px] leading-relaxed animate-fade-in shadow-xl border border-white/10">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>GreenFlag Trust Protocol</span>
                  </div>
                  Verified hosts with accurate pickup spots and prompt communication unlock 5x priority placement on the curated map.
                </div>
              )}

              {/* ---------------- QUESTION 1: EXPERIENCE FORMAT ---------------- */}
              {createStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                      What format are you hosting?
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Select the cadence. Trust and comfort build in graduated steps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 mt-4">
                    {[
                      {
                        id: 'micro',
                        label: 'Micro Date / Cafe Meet',
                        sub: '60 min casual artisan coffee in daylight',
                        icon: '☕',
                        badge: 'PUBLIC VENUE ONLY',
                      },
                      {
                        id: 'day',
                        label: 'Day Date / Sunrise Roadtrip',
                        sub: '1-day scenic drive, hill fortress or viewpoint',
                        icon: '⛰️',
                        badge: 'HIGH DEMAND',
                      },
                      {
                        id: 'getaway',
                        label: 'Weekend Retreat / Getaway',
                        sub: '2-3 days coffee estate, trekking or camping',
                        icon: '🏕️',
                        badge: 'VERIFIED ID REQUIRED',
                      },
                      {
                        id: 'crawl',
                        label: 'Artisan Food & Cafe Crawl',
                        sub: '2-3 hours curated culinary spots with a buddy',
                        icon: '🥐',
                        badge: 'SOCIAL CASUAL',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          hapticTap();
                          setCreateLadder(item.id as any);
                        }}
                        className={`p-4 rounded-[22px] border text-left transition-all relative flex items-center gap-3.5 cursor-pointer active:scale-[0.99] ${
                          createLadder === item.id
                            ? 'border-[#18181B] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-[#18181B]'
                            : 'border-[#18181B]/[0.08] bg-white/80 hover:border-[#18181B]/20'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#18181B]/[0.06] flex items-center justify-center text-[20px] shadow-inner shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-[800] text-[14px] text-[#18181B]">
                              {item.label}
                            </span>
                            {createLadder === item.id && (
                              <div className="w-4 h-4 bg-[#18181B] rounded-full flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-[#18181B]/55 mt-0.5 leading-snug">
                            {item.sub}
                          </p>
                          <span className="inline-block text-[8px] font-bold tracking-[0.15em] uppercase text-[#18181B]/40 mt-1.5">
                            {item.badge}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 2: LOCATION & GPS SCAN ---------------- */}
              {createStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                      Where are you starting from?
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Auto-scan your neighborhood GPS or pick a designated public meetup landmark.
                    </p>
                  </div>

                  {/* High-End Dark Emerald Luxury Radar Card */}
                  <div className="rounded-[24px] bg-[#12221A] p-5 text-white shadow-xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                          {gpsScanning ? (
                            <Radio className="w-5 h-5 animate-spin text-[#D4AF37]" />
                          ) : (
                            <LocateFixed className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300/70">
                            NEIGHBORHOOD SCAN
                          </div>
                          <div className="text-[15px] font-[800] tracking-tight mt-0.5 truncate max-w-[200px]">
                            {gpsScanning ? 'Resolving coordinates...' : createPickup || 'Select starting hub'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between relative z-10">
                      <span className="text-[10px] text-white/70 font-medium">
                        {gpsDetected ? '✓ High precision coordinate locked' : 'Instant 1-tap locality scan'}
                      </span>
                      <button
                        type="button"
                        disabled={gpsScanning}
                        onClick={detectUserLocation}
                        className="px-3.5 py-1.5 rounded-full bg-white text-[#12221A] text-[11px] font-bold shadow-md hover:bg-emerald-50 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                      >
                        {gpsScanning ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-[#12221A] border-r-transparent animate-spin" />
                            <span>Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            <span>{gpsDetected ? 'Rescan' : 'Auto Scan GPS'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Manual Pickup Spot Landmark Input */}
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                      STARTING PICKUP LANDMARK
                    </label>
                    <div className="mt-1.5 relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#18181B]/40" />
                      <input
                        type="text"
                        value={createPickup}
                        onChange={(e) => {
                          setCreatePickup(e.target.value);
                          setGpsDetected(false);
                        }}
                        placeholder="e.g. Indiranagar 100ft Rd, Sony Signal Koramangala..."
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white border border-[#18181B]/[0.1] font-semibold text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]/40 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Curated Popular Starting Hubs */}
                  <div>
                    <span className="text-[9px] font-bold text-[#18181B]/40 uppercase tracking-[0.15em]">
                      Curated Bengaluru Pickup Hubs
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        'Indiranagar 100ft Rd',
                        'Koramangala 4th Block',
                        'HSR Layout BDA',
                        'MG Road Metro',
                        'Whitefield ITPL',
                        'Hebbal Esteem Mall',
                        'JP Nagar 6th Phase',
                      ].map((spot) => (
                        <button
                          key={spot}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreatePickup(`${spot}, Bengaluru`);
                            setGpsDetected(false);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide border transition cursor-pointer ${
                            createPickup.toLowerCase().includes(spot.toLowerCase())
                              ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                              : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70 hover:border-[#18181B]/20'
                          }`}
                        >
                          📍 {spot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 3: DATE OR A TRIP & GOOGLE MAPS SEARCH ---------------- */}
              {createStep === 3 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                      Are you planning a date or a trip?
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Select your intent and search the destination using Google Maps.
                    </p>
                  </div>

                  {/* Date vs Trip Primary Choice Cards */}
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                      CHOOSE ESCAPE INTENT
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {[
                        {
                          id: 'pink',
                          title: 'A Date ✦',
                          sub: '1-on-1 romantic spark & curated ambiance',
                          badge: 'DATE EXPERIENCE',
                          borderActive: 'border-[#331822] bg-[#FAF5F7] ring-1 ring-[#331822]',
                          badgeBg: 'text-rose-900 bg-rose-100/60',
                        },
                        {
                          id: 'green',
                          title: 'A Trip ⛰️',
                          sub: 'Scenic roadtrip, summit trek & sights',
                          badge: 'EXPLORATION',
                          borderActive: 'border-[#12221A] bg-[#F4F8F5] ring-1 ring-[#12221A]',
                          badgeBg: 'text-emerald-900 bg-emerald-100/60',
                        },
                        {
                          id: 'buddies',
                          title: 'Buddies ●',
                          sub: 'Chill social weekend & new conversations',
                          badge: 'SOCIAL CIRCLE',
                          borderActive: 'border-[#18181B] bg-[#F8F7F5] ring-1 ring-[#18181B]',
                          badgeBg: 'text-zinc-900 bg-zinc-200/60',
                        },
                        {
                          id: 'women',
                          title: 'Women-Only 👩',
                          sub: 'Verified safe circle for women explorers',
                          badge: 'PRIVATE CIRCLE',
                          borderActive: 'border-[#291833] bg-[#F7F4F9] ring-1 ring-[#291833]',
                          badgeBg: 'text-purple-900 bg-purple-100/60',
                        },
                      ].map((opt) => {
                        const isSelected =
                          (opt.id === 'buddies' && createType === 'green') ||
                          createType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              hapticTap();
                              setCreateType(opt.id === 'buddies' ? 'green' : (opt.id as any));
                            }}
                            className={`p-3.5 rounded-[20px] border text-left transition cursor-pointer active:scale-95 flex flex-col justify-between relative ${
                              isSelected
                                ? `${opt.borderActive} shadow-xs`
                                : 'bg-white border-[#18181B]/[0.08] hover:border-[#18181B]/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-[800] text-[14px] text-[#18181B]">
                                {opt.title}
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-[#18181B] flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-[#18181B]/60 font-medium mt-1 leading-snug">
                              {opt.sub}
                            </p>
                            <div className="mt-2.5">
                              <span
                                className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full ${opt.badgeBg}`}
                              >
                                {opt.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Google Maps Search Input */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        SEARCH DESTINATION VIA GOOGLE MAPS
                      </label>
                      <span className="text-[9px] font-bold text-emerald-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700" /> Live Search
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#18181B]/40" />
                      <input
                        type="text"
                        value={createDestination}
                        onChange={(e) => handleDestinationType(e.target.value)}
                        placeholder="Type any mountain peak, cafe, estate, resort..."
                        className="w-full h-12 pl-10 pr-10 rounded-2xl bg-white border border-[#18181B]/[0.12] font-semibold text-[14px] text-[#18181B] focus:outline-none focus:border-[#18181B] shadow-xs"
                      />
                      {isSearchingPlaces ? (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-[#18181B]/40 animate-spin" />
                        </div>
                      ) : createDestination ? (
                        <button
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateDestination('');
                            setPlacesResults([]);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[#18181B]/60 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      ) : null}
                    </div>

                    {/* Google Maps Live Search Results Dropdown */}
                    {placesResults.length > 0 && (
                      <div className="mt-2 rounded-2xl bg-white border border-[#18181B]/[0.1] shadow-xl overflow-hidden animate-fade-in divide-y divide-[#18181B]/[0.05] z-30">
                        <div className="px-3.5 py-1.5 bg-[#FAF8F5] flex items-center justify-between">
                          <span className="text-[9px] font-bold text-[#18181B]/45 uppercase tracking-wider">
                            📍 Google Maps Results
                          </span>
                          <span className="text-[9px] text-[#18181B]/40 font-medium">Tap to confirm</span>
                        </div>
                        {placesResults.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlace(place)}
                            className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#FAF8F5] transition cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-xl bg-[#FAF8F5] text-[#18181B] flex items-center justify-center shrink-0 mt-0.5 border border-[#18181B]/[0.06]">
                              <MapPin className="w-3 h-3 text-[#18181B]/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#18181B] truncate">
                                {place.mainText}
                              </div>
                              <div className="text-[10px] text-[#18181B]/50 truncate font-normal">
                                {place.secondaryText}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {createDestination && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#12221A] bg-[#F2F6F3] px-3.5 py-2 rounded-xl border border-emerald-900/10">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-900">Destination:</span>
                        <span className="font-bold text-[#18181B] truncate">{createDestination}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 4: TIMEFRAME & GROUP ---------------- */}
              {createStep === 4 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                      When & how are you going?
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Set date, departure slot, squad size, and transport mode.
                    </p>
                  </div>

                  {/* Day Picker */}
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                      DAY / TIMEFRAME
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {[
                        'Today',
                        'Tomorrow',
                        'This Saturday',
                        'This Sunday',
                        'Next Weekend',
                        'Flexible',
                      ].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateDate(d);
                          }}
                          className={`h-9 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center justify-center ${
                            createDate === d
                              ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                              : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70 hover:border-[#18181B]/20'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                      STARTING TIME SLOT
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {[
                        '🌅 Dawn Sunrise · 5:30 AM',
                        '☀️ Morning Roast · 8:30 AM',
                        '🌆 Sunset Drive · 4:30 PM',
                        '🌌 Night Traverse · 10:00 PM',
                      ].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateTimeSlot(slot);
                          }}
                          className={`p-2.5 rounded-xl border text-[11px] font-semibold text-left transition cursor-pointer flex items-center justify-between ${
                            createTimeSlot === slot
                              ? 'bg-white border-[#18181B] ring-1 ring-[#18181B] shadow-xs text-[#18181B] font-bold'
                              : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/65 hover:border-[#18181B]/20'
                          }`}
                        >
                          <span>{slot}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Size & Transport */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        SQUAD SIZE
                      </label>
                      <div className="space-y-1.5 mt-1.5">
                        {[
                          { id: '1-on-1', label: '1-on-1 (2 Total)' },
                          { id: '2-4', label: 'Squad (3-4 Members)' },
                          { id: '5+', label: 'Group (5+ Members)' },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => {
                              hapticTap();
                              setCreateGroupSize(sz.id);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-[11px] font-bold text-left transition cursor-pointer ${
                              createGroupSize === sz.id
                                ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                                : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        TRANSPORTATION
                      </label>
                      <div className="space-y-1.5 mt-1.5">
                        {[
                          '🚗 Driving Private Car',
                          '🏍️ Cruising Motorcycle',
                          '🚕 Split Cabs / Uber',
                          '🚙 Need a Ride / Co-host',
                        ].map((ride) => (
                          <button
                            key={ride}
                            type="button"
                            onClick={() => {
                              hapticTap();
                              setCreateRide(ride);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-[11px] font-medium text-left transition cursor-pointer ${
                              createRide === ride
                                ? 'bg-[#18181B] text-white border-[#18181B] font-bold shadow-xs'
                                : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70'
                            }`}
                          >
                            {ride}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 5: VIBES & SPLIT COST + BOARDING PASS ---------------- */}
              {createStep === 5 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                      What's the vibe & estimated split?
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Set atmosphere tags and the fair estimated shared cost per participant.
                    </p>
                  </div>

                  {/* Vibe Tags */}
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                      ATMOSPHERE & VIBE TAGS
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        'Chai & Chill',
                        'Trek & Talk',
                        'Slow Travel',
                        'Photo Walks',
                        'City Walks',
                        'Deep Talks',
                        'Sunset Views',
                        'Food Crawl',
                        'Scenic Drive',
                        'Night Trek',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleVibe(tag)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide border transition cursor-pointer ${
                            createVibes.includes(tag)
                              ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                              : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70 hover:border-[#18181B]/20'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Cost Split */}
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        ESTIMATED COST SPLIT / PERSON
                      </label>
                      <span className="text-[13px] font-[800] text-[#12221A] bg-[#EAF2EC] px-3 py-0.5 rounded-full border border-emerald-900/10">
                        {createCost === 0 ? 'Complimentary' : `₹${createCost}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {[
                        { v: 0, l: 'Free' },
                        { v: 400, l: '₹400' },
                        { v: 800, l: '₹800' },
                        { v: 1500, l: '₹1.5k' },
                        { v: 2800, l: '₹2.8k' },
                      ].map((c) => (
                        <button
                          key={c.v}
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setCreateCost(c.v);
                          }}
                          className={`py-2 rounded-xl border text-center text-[11px] font-bold transition cursor-pointer ${
                            createCost === c.v
                              ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                              : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/70 hover:border-[#18181B]/20'
                          }`}
                        >
                          {c.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ================= LUXURY BOARDING PASS PREVIEW ================= */}
                  <div className="rounded-[26px] bg-white border border-[#18181B]/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden mt-3">
                    
                    {/* Top Gold Foil Bar */}
                    <div className="bg-[#18181B] px-4 py-2.5 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                          GREENFLAG BOARDING PASS
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                        {createType === 'pink' ? '✦ Curated Date' : createType === 'women' ? '👩 Women Circle' : '● Roadtrip'}
                      </span>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#18181B]/40">
                            DEPARTURE HUB
                          </div>
                          <div className="text-[13px] font-[800] text-[#18181B] truncate max-w-[170px]">
                            {createPickup.split(',')[0]}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#18181B]/40">
                          <div className="w-8 h-[1px] bg-[#18181B]/20" />
                          <ArrowRight className="w-3.5 h-3.5 text-[#18181B]/60" />
                          <div className="w-8 h-[1px] bg-[#18181B]/20" />
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#18181B]/40">
                            DESTINATION
                          </div>
                          <div className="text-[13px] font-[800] text-[#18181B] truncate max-w-[140px]">
                            {createDestination.split(',')[0] || 'Trek Viewpoint'}
                          </div>
                        </div>
                      </div>

                      {/* Perforated Divider */}
                      <div className="relative my-3.5">
                        <div className="border-t border-dashed border-[#18181B]/15" />
                        <div className="absolute -left-6 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
                        <div className="absolute -right-6 -top-2 w-4 h-4 rounded-full bg-[#FAF8F5]" />
                      </div>

                      {/* Ticket Footer Metadata */}
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <span className="text-[#18181B]/40 block font-semibold">SCHEDULE</span>
                          <span className="font-bold text-[#18181B]">{createDate}</span>
                        </div>
                        <div>
                          <span className="text-[#18181B]/40 block font-semibold">TIME</span>
                          <span className="font-bold text-[#18181B] truncate">{createTimeSlot.split('·')[1] || '5:30 AM'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#18181B]/40 block font-semibold">SPLIT / PERS</span>
                          <span className="font-[800] text-[#12221A]">
                            {createCost === 0 ? 'Free' : `₹${createCost}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= FLOATING DEDICATED ACTIONS ================= */}
            <div className="fixed bottom-20 inset-x-5 max-w-md mx-auto z-40 bg-[#FAF8F5]/90 backdrop-blur-2xl p-2 rounded-[24px] border border-[#18181B]/[0.08] shadow-[0_16px_36px_-8px_rgba(24,24,27,0.18)] flex gap-2">
              {createStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setCreateStep((s) => Math.max(1, s - 1));
                  }}
                  className="h-12 px-5 rounded-2xl bg-white border border-[#18181B]/[0.1] font-bold text-[13px] active:scale-95 transition cursor-pointer hover:bg-black/5"
                >
                  Back
                </button>
              )}

              {createStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setCreateStep((s) => Math.min(5, s + 1));
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#18181B] text-white font-[800] text-[13px] tracking-wide shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Step {createStep + 1}</span>
                  <ChevronRight className="w-4 h-4 text-white/70" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex-1 h-12 rounded-2xl bg-[#18181B] text-[#FAF8F5] font-[800] text-[13px] tracking-wide shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Publish Private Escape</span>
                </button>
              )}
            </div>

            {/* Confetti / Published Success Overlay */}
            {isPublished && (
              <div className="fixed inset-0 z-[110] bg-[#FAF8F5]/98 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#18181B] flex items-center justify-center shadow-xl mb-4 border border-white/20">
                  <Check className="w-8 h-8 text-white" />
                </div>
                
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#18181B]/50">
                  GREENFLAG ESCAPE PUBLISHED
                </span>
                <h3 className="text-[24px] font-[800] tracking-[-0.02em] text-[#18181B] mt-1">
                  Your Escape is Live
                </h3>
                <p className="text-[13px] text-[#18181B]/60 font-normal mt-2 leading-relaxed max-w-[290px]">
                  Your {createDestination || 'Bengaluru'} escape has been dispatched to 240 verified explorers in your radius.
                </p>

                {/* Priority Placement Boost Card */}
                <div className="mt-6 w-full max-w-[320px] bg-[#18181B] rounded-[24px] p-5 text-left text-white shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[13px] text-[#D4AF37]">
                      <Zap className="w-4 h-4" />
                      <span>Priority Placement</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10">
                      ₹49
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-2 leading-relaxed">
                    Elevate this escape to the top of the map radar. 87% of boosted escapes receive 3+ member applications within the hour.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Priority placement activated!', {
                        style: { background: '#141414', color: '#FAF7F2' },
                      });
                      setIsPublished(false);
                      setActiveTab('explore');
                      setCreateStep(1);
                    }}
                    className="mt-4 w-full h-11 rounded-xl bg-white text-[#18181B] font-bold text-[12px] shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    Activate Priority Placement
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublished(false);
                    setActiveTab('explore');
                    setCreateStep(1);
                  }}
                  className="mt-4 w-full max-w-[320px] h-11 rounded-xl border border-[#18181B]/[0.1] font-semibold text-[13px] text-[#18181B] active:scale-95 transition cursor-pointer"
                >
                  Return to Discover
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= SLIDE-UP EDITORIAL DETAILS SHEET ================= */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in max-w-md mx-auto">
          <div className="bg-[#FAF8F5] w-full rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)] pb-[env(safe-area-inset-bottom,12px)] border-t border-white/20">
            
            {/* Sheet Header Hero Cover */}
            <div
              className={`h-[190px] relative bg-gradient-to-br ${selectedTrip.coverStyle.bg} p-5 flex flex-col justify-end shrink-0 text-white`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <button
                  type="button"
                  onClick={() => setSelectedTrip(null)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 active:scale-90 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="h-8 px-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedTrip.totalSpots - selectedTrip.spots} spots available</span>
                </div>
              </div>

              <div className="relative z-10 text-white">
                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 ${selectedTrip.coverStyle.badge}`}>
                  {selectedTrip.type === 'pink' ? '✦ Curated Date' : '● Verified Roadtrip'}
                </span>
                <h2 className="text-[22px] font-[800] text-white leading-tight tracking-[-0.01em]">
                  {selectedTrip.destination}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-[12px] text-white/80">
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span>{selectedTrip.time} · ₹{selectedTrip.cost}/person split</span>
                </div>
              </div>
            </div>

            {/* Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-4">
              
              {/* 3-Stop Curated Timeline */}
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                  CURATED TIMELINE & ITINERARY
                </div>
                <div className="mt-3 relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-[#18181B]/15" />
                  {[
                    { time: '5:30 AM', place: 'Indiranagar Metro / Public Cafe', note: 'Coffee meet & gear check' },
                    { time: '7:00 AM', place: `${selectedTrip.destination}`, note: 'Scenic viewpoint & cloud bed' },
                    { time: '11:00 AM', place: 'Foothills Breakfast & Roast', note: 'Relaxed wrap & drop back' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex gap-3 pb-3.5 last:pb-0">
                      <div className="absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full bg-[#18181B] border-2 border-white flex items-center justify-center shadow-xs" />
                      <div className="flex-1 bg-white rounded-2xl p-3 border border-[#18181B]/[0.06] shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#18181B] text-white">
                            {step.time}
                          </span>
                          <span className="text-[10px] text-[#18181B]/50">{step.note}</span>
                        </div>
                        <div className="font-bold text-[12px] text-[#18181B] mt-1">
                          {step.place}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Trust Profile Card */}
              <div className="rounded-[22px] border border-[#18181B]/[0.08] bg-white p-4 shadow-xs flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[16px]">
                    {selectedTrip.host.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-[#18181B] truncate">{selectedTrip.host.name}</span>
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#FAF8F5] border border-[#18181B]/[0.08] font-bold text-[#18181B]/70">
                      Lvl {selectedTrip.host.level}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['Government ID Verified', '8x On-Time Host', '5.0 Trust'].map((badge) => (
                      <span
                        key={badge}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-[#F2F6F3] text-emerald-950 font-semibold border border-emerald-900/10"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#18181B]/[0.08] flex items-center justify-center relative shrink-0">
                  <span className="font-extrabold text-[12px]">{selectedTrip.score}</span>
                </div>
              </div>

              {/* Cost Split Breakdown */}
              <div className="rounded-[22px] bg-white border border-[#18181B]/[0.08] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                    TRANSPARENT SPLIT BREAKDOWN
                  </span>
                  <span className="text-[12px] font-bold text-[#18181B]">₹{selectedTrip.cost}/person</span>
                </div>
                <div className="space-y-1.5 text-[12px]">
                  {[
                    { k: 'Fuel & Tolls (120km roundtrip)', v: 320 },
                    { k: 'Entry passes & reserved parking', v: 180 },
                    { k: 'Artisanal roast & breakfast pool', v: 300 },
                  ].map((row) => (
                    <div key={row.k} className="flex justify-between text-[#18181B]/70">
                      <span>{row.k}</span>
                      <span className="font-semibold text-[#18181B]">₹{row.v}</span>
                    </div>
                  ))}
                  <div className="h-[1px] bg-[#18181B]/[0.08] my-2" />
                  <div className="flex justify-between font-bold text-[13px] text-[#18181B]">
                    <span>Total per participant</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] text-white text-[11px]">
                      ₹{selectedTrip.cost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Safety Badge */}
              <div className="rounded-2xl bg-[#F2F6F3] border border-emerald-900/10 p-3 flex gap-3 items-center">
                <Shield className="w-5 h-5 text-emerald-800 shrink-0" />
                <div className="text-[11px] leading-relaxed text-emerald-950 font-medium">
                  <strong>Safe by Design:</strong> Public meetup hubs only. Verified identities. Live GPS trip coordinates shared with trusted contacts.
                </div>
              </div>
            </div>

            {/* Bottom Join Actions */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#18181B]/[0.08] shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    hapticSuccess();
                    toast.success('Joined as Buddy! ●', {
                      style: { background: '#141414', color: '#FAF7F2' },
                    });
                    setSelectedTrip(null);
                  }}
                  className="flex-1 h-12 rounded-2xl bg-white border border-[#18181B]/[0.12] font-bold text-[13px] text-[#18181B] active:scale-95 transition cursor-pointer shadow-xs"
                >
                  Join as Buddy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticSuccess();
                    toast.success('Requested as Date! ✦', {
                      style: { background: '#141414', color: '#FAF7F2' },
                    });
                    setSelectedTrip(null);
                  }}
                  className="flex-[1.5] h-12 rounded-2xl bg-[#18181B] text-white font-bold text-[13px] tracking-wide shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✦ Request as Date</span>
                </button>
              </div>
              <div className="text-center text-[10px] text-[#18181B]/40 mt-2 font-medium">
                Host approves all requests · Zero charges until confirmed
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= ZOMATO-STYLE LOCATION SELECTOR MODAL ================= */}
      {showLocationModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-end sm:items-center justify-center z-[120] p-0 sm:p-4 animate-fade-in">
          <div className="bg-[#FAF8F5] rounded-t-[32px] sm:rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-[#18181B]/[0.08] max-h-[85vh] flex flex-col animate-slide-up">
            
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-3 border-b border-[#18181B]/[0.08] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1A382B] text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-[800] text-[16px] text-[#18181B]">Select Location</h3>
                  <p className="text-[11px] text-[#18181B]/55 font-medium">Find trips and meetups starting near you</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#18181B] transition active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Location Body */}
            <div className="flex-1 overflow-y-auto pt-4 space-y-4 no-scrollbar">
              
              {/* Search Location Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#18181B]/40" />
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Search area, landmark, or city..."
                  className="w-full h-11 pl-10 pr-4 bg-white rounded-2xl border border-[#18181B]/[0.1] text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#18181B] shadow-xs"
                />
              </div>

              {/* 🎯 1-Tap GPS Auto-Scan Button */}
              <button
                type="button"
                disabled={locationGpsScanning}
                onClick={detectCurrentLocation}
                className="w-full p-3.5 rounded-2xl bg-[#E8EDE6] border border-emerald-800/20 text-[#1A382B] flex items-center justify-between active:scale-[0.99] transition shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1A382B] text-white flex items-center justify-center">
                    {locationGpsScanning ? (
                      <Radio className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    ) : (
                      <LocateFixed className="w-4 h-4 text-emerald-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-[800] text-[13px] text-[#1A382B]">Use Current Location</div>
                    <div className="text-[11px] text-emerald-900/70 font-medium">Using GPS auto-detection</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-800" />
              </button>

              {/* ⭐️ Popular Neighborhoods in Bengaluru */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#18181B]/50 mb-2 px-1">
                  Popular Hubs in Bengaluru
                </div>
                <div className="bg-white rounded-[22px] border border-[#18181B]/[0.08] divide-y divide-[#18181B]/[0.05] overflow-hidden shadow-xs">
                  {POPULAR_NEIGHBORHOODS.filter((n) =>
                    n.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
                  ).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        setSelectedLocation(item);
                        setShowLocationModal(false);
                        toast.success(`📍 Switched to ${item.name}`, {
                          style: { background: '#141414', color: '#FAF7F2' },
                        });
                      }}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-black/5 active:bg-black/10 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1A382B] shrink-0" />
                        <div>
                          <div className="font-[800] text-[13px] text-[#18181B]">{item.name}</div>
                          <div className="text-[10px] text-[#18181B]/45 font-medium">{item.city}</div>
                        </div>
                      </div>
                      {selectedLocation.name === item.name && (
                        <Check className="w-4 h-4 text-emerald-700 font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🏙️ Weekend Destinations & Other Cities */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#18181B]/50 mb-2 px-1">
                  Weekend Escapes & Top Destinations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_DESTINATION_CITIES.filter((c) =>
                    c.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
                  ).map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        setSelectedLocation(dest);
                        setShowLocationModal(false);
                        toast.success(`📍 Switched to ${dest.name}`, {
                          style: { background: '#141414', color: '#FAF7F2' },
                        });
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#18181B]/[0.08] text-left hover:border-black/20 active:scale-95 transition cursor-pointer shadow-xs"
                    >
                      <div className="font-bold text-[12px] text-[#18181B] truncate">{dest.name}</div>
                      <div className="text-[10px] text-[#18181B]/50 truncate mt-0.5">{dest.city}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <TripsContent />
    </Suspense>
  );
}
