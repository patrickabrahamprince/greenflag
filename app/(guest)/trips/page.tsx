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
  ArrowLeft,
  SlidersHorizontal,
  Star,
  Award,
  Bell,
  User,
  ChevronUp,
  ChevronDown,
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
    spots: 0,
    totalSpots: 1,
    cost: 2400,
    type: 'pink',
    category: 'coffee',
    distance: '240 km',
    routeTime: '4h 30m',
    pickupHub: 'Koramangala 4th Block',
    score: 4.85,
    match: 'Coffee aficionado · Leica photographer',
    host: { name: 'Meera K.', avatar: 'M', level: 8, verified: true },
    vibe: ['Slow Travel', 'Photo Talks', 'Estate Stay'],
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
    spots: 0,
    totalSpots: 1,
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
    type: 'green',
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

const generateUpcomingDates = (count = 30) => {
  const list = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    list.push({
      day: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayName,
      date: `${monthName} ${dayNum}`,
      label: `${dayName} · ${monthName} ${dayNum}`,
      iso: d.toISOString().split('T')[0],
    });
  }
  return list;
};

const INITIAL_CALENDAR_DATES = generateUpcomingDates(30);

const TIME_WHEEL_SLOTS = [
  '08:00 am',
  '08:30 am',
  '09:00 am',
  '09:30 am',
  '10:00 am',
  '10:30 am',
  '11:00 am',
  '11:15 am',
  '11:30 am',
  '11:45 am',
  '12:00 pm',
  '12:15 pm',
  '12:30 pm',
  '01:00 pm',
  '01:30 pm',
  '02:00 pm',
  '02:30 pm',
  '03:00 pm',
  '03:30 pm',
  '04:00 pm',
  '04:30 pm',
  '05:00 pm',
  '05:30 pm',
  '06:00 pm',
  '07:00 pm',
  '08:00 pm',
  '09:30 pm',
  '10:00 pm',
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
  const [calendarDateList, setCalendarDateList] = useState(INITIAL_CALENDAR_DATES);
  const [selectedDateCard, setSelectedDateCard] = useState(INITIAL_CALENDAR_DATES[0]?.label || 'Today');
  const [createDate, setCreateDate] = useState(INITIAL_CALENDAR_DATES[0]?.label || 'Today');
  const datePickerInputRef = useRef<HTMLInputElement>(null);

  const handleCustomDatePicked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const pickedDate = new Date(year, month, day);
      const dayName = pickedDate.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = pickedDate.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = pickedDate.getDate();
      const label = `${dayName} · ${monthName} ${dayNum}`;
      
      const newCard = {
        day: dayName,
        date: `${monthName} ${dayNum}`,
        label,
        iso: val,
      };

      setCalendarDateList((prev) => {
        const exists = prev.find((item) => item.label === label);
        if (exists) return prev;
        return [newCard, ...prev];
      });

      setSelectedDateCard(label);
      setCreateDate(label);
      hapticSuccess();
      toast.success(`📅 Escape scheduled for ${label}!`, {
        style: { background: '#141414', color: '#FAF7F2' },
      });
    }
  }, []);

  const [selectedTimeIndex, setSelectedTimeIndex] = useState(9); // '11:45 am'
  const [createTimeSlot, setCreateTimeSlot] = useState('11:45 am');
  const timeWheelRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScroll = useRef(false);

  const handleTimeWheelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;
    const container = e.currentTarget;
    const itemHeight = 44;
    const index = Math.round(container.scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(TIME_WHEEL_SLOTS.length - 1, index));
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setSelectedTimeIndex((prev) => {
        if (prev !== clampedIndex) {
          hapticTap();
          setCreateTimeSlot(TIME_WHEEL_SLOTS[clampedIndex]);
          return clampedIndex;
        }
        return prev;
      });
    }, 60);
  }, []);

  const handleSelectTimeSlot = useCallback((idx: number) => {
    hapticTap();
    setSelectedTimeIndex(idx);
    setCreateTimeSlot(TIME_WHEEL_SLOTS[idx]);
    if (timeWheelRef.current) {
      isProgrammaticScroll.current = true;
      timeWheelRef.current.scrollTo({
        top: idx * 44,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 350);
    }
  }, []);

  useEffect(() => {
    if (createStep === 4 && timeWheelRef.current) {
      isProgrammaticScroll.current = true;
      const targetScroll = selectedTimeIndex * 44;
      timeWheelRef.current.scrollTop = targetScroll;
      const timer = setTimeout(() => {
        if (timeWheelRef.current) {
          timeWheelRef.current.scrollTop = targetScroll;
        }
        isProgrammaticScroll.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [createStep]);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gf-wizard-active', { detail: activeTab === 'create' }));
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gf-wizard-active', { detail: false }));
      }
    };
  }, [activeTab]);

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

      {/* Ambient Top Radiant Sky Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 bg-gradient-to-b from-[#CBE4FC]/90 via-[#E8F2FD]/50 to-transparent pointer-events-none z-0" />

      {/* ================= EDITORIAL TOP BRAND HEADER ================= */}
      <header className="px-6 pt-[max(16px,env(safe-area-inset-top,16px))] pb-2 sticky top-0 z-30 flex items-center justify-between">
        {/* 3D Profile Avatar with Golden Glow Ring */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan';
                }}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Explorer Hub</div>
            <div className="text-[15px] font-[800] text-[#18181B] tracking-tight">{selectedLocation.name.split(',')[0]}</div>
          </div>
        </div>

        {/* Circular Frosted Glass Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-stone-700 hover:bg-white transition cursor-pointer active:scale-95"
            aria-label="Location search"
          >
            <Search className="w-4 h-4 text-stone-700" />
          </button>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              setActiveTab(activeTab === 'explore' ? 'create' : 'explore');
            }}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-stone-700 hover:bg-white transition cursor-pointer active:scale-95"
            aria-label="Menu"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-700" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col pb-36 z-10">
        
        {/* ================= VIEW 1: SCREENSHOT-EXACT HUB & SCHEDULE ================= */}
        {activeTab === 'explore' && (
          <div className="h-full flex flex-col animate-fade-in space-y-5 pt-2">
            
            {/* 1. UPCOMING HEADER & DATE CAPSULES ROW (Screenshot 1 Exact) */}
            <div className="px-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[20px] font-[800] text-[#18181B] tracking-tight">Upcoming</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00E5A3] text-black font-[900] text-[11px] shadow-sm">
                  +3
                </span>
              </div>

              {/* Horizontal Date Capsules */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
                {[
                  { day: 'Sat', num: '20' },
                  { day: 'Sun', num: '21' },
                  { day: 'Mon', num: '22' },
                  { day: 'Tue', num: '23', isHighlight: true },
                  { day: 'Wed', num: '24' },
                  { day: 'Thu', num: '25' },
                ].map((item) => {
                  const isSelected = item.isHighlight;
                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => hapticTap()}
                      className={`flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-[18px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#9D54FF] text-white shadow-lg shadow-[#9D54FF]/30 scale-[1.04]'
                          : 'bg-white/60 hover:bg-white text-stone-700 border border-white/80 shadow-xs'
                      }`}
                    >
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>
                        {item.day}
                      </span>
                      <span className={`text-[15px] font-[800] mt-0.5 ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                        {item.num}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. HORIZONTAL PASTEL BENTO CARDS CAROUSEL (Screenshot 1 Exact) */}
            <div className="px-6">
              <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {/* Mint Card */}
                <div
                  onClick={() => {
                    hapticTap();
                    setSelectedTrip(TRIPS_DATA[0]);
                  }}
                  className="snap-start shrink-0 w-[240px] p-4 rounded-[26px] bg-[#D7F5E8] border border-emerald-200/50 shadow-sm flex flex-col justify-between cursor-pointer active:scale-[0.98] transition min-h-[160px]"
                >
                  <div className="flex items-center justify-between">
                    {/* Overlapping Avatars */}
                    <div className="flex items-center -space-x-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                        alt="Member 1"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                        alt="Member 2"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                        alt="Member 3"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-stone-700 shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                    </div>
                  </div>

                  <div className="my-2">
                    <h3 className="text-[16px] font-[800] text-emerald-950 leading-snug">
                      Nandi Sunrise Cloud Convoy
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-emerald-900/70 pt-2 border-t border-emerald-900/10">
                    <span>Today 9:45am</span>
                    <span className="font-bold text-emerald-950">Priority High</span>
                  </div>
                </div>

                {/* Ice Blue Card */}
                <div
                  onClick={() => {
                    hapticTap();
                    setSelectedTrip(TRIPS_DATA[1]);
                  }}
                  className="snap-start shrink-0 w-[240px] p-4 rounded-[26px] bg-[#DDF0FE] border border-sky-200/50 shadow-sm flex flex-col justify-between cursor-pointer active:scale-[0.98] transition min-h-[160px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                        alt="Host"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-stone-700 shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                    </div>
                  </div>

                  <div className="my-2">
                    <h3 className="text-[16px] font-[800] text-sky-950 leading-snug">
                      Coorg Coffee Estate Drive
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-sky-900/70 pt-2 border-t border-sky-900/10">
                    <span>Today 11:00am</span>
                    <span className="font-bold text-sky-950">1 Spot Left</span>
                  </div>
                </div>

                {/* Lavender Card */}
                <div
                  onClick={() => {
                    hapticTap();
                    setSelectedTrip(TRIPS_DATA[2] || TRIPS_DATA[0]);
                  }}
                  className="snap-start shrink-0 w-[240px] p-4 rounded-[26px] bg-[#F2E8FD] border border-purple-200/50 shadow-sm flex flex-col justify-between cursor-pointer active:scale-[0.98] transition min-h-[160px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                        alt="Lead"
                        className="w-7 h-7 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-stone-700 shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                    </div>
                  </div>

                  <div className="my-2">
                    <h3 className="text-[16px] font-[800] text-purple-950 leading-snug">
                      Gokarna Sunset & Trail
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-purple-900/70 pt-2 border-t border-purple-900/10">
                    <span>This Sat 4:30pm</span>
                    <span className="font-bold text-purple-950">Women Safe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ORGANIC CAPSULE "ADD AN ESCAPE / ADD A TASK" BAR (Screenshot 1 Exact) */}
            <div className="px-6">
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setActiveTab('create');
                  router.replace('/trips?tab=create');
                }}
                className="w-full h-14 bg-[#18181B] text-white rounded-full px-5 flex items-center justify-between shadow-lg active:scale-[0.98] transition cursor-pointer relative overflow-hidden group"
              >
                <span className="text-[14px] font-[700] tracking-wide text-white/90">
                  Host an escape / Add a plan
                </span>
                
                {/* Organic Circular Plus Button on Right */}
                <div className="w-10 h-10 rounded-full bg-white/15 group-hover:bg-[#00E5A3] group-hover:text-black text-white flex items-center justify-center transition-all">
                  <span className="text-[20px] font-bold leading-none">+</span>
                </div>
              </button>
            </div>

            {/* 4. LIVE TRAVEL DATING MAP RADAR (Interactive Bento Map) */}
            <div className="px-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-[800] text-[#18181B] tracking-tight">
                    Live Travel Dating Map
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <span className="text-[11px] font-bold text-stone-500">Bangalore Hub</span>
              </div>

              {/* Bento Map Container */}
              <div className="relative rounded-[28px] overflow-hidden border border-stone-200/80 bg-[#0F172A] text-white shadow-md p-4 min-h-[220px] flex flex-col justify-between">
                {/* Stylized Vector Map Grid & Road Canvas */}
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 70%),
                                      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 28px 28px, 28px 28px',
                  }}
                />

                {/* Animated Route Curved Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 200">
                  <path
                    d="M 40 160 Q 140 40 280 80"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    fill="none"
                    className="opacity-70 animate-pulse"
                  />
                  <path
                    d="M 60 140 Q 180 180 260 120"
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    className="opacity-60"
                  />
                </svg>

                {/* Interactive Map Header Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#00E5A3] animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-300">14 Escapes & Pairs Live</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setShowLocationModal(true);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white hover:bg-white/25 active:scale-95 transition"
                  >
                    Change Hub ▾
                  </button>
                </div>

                {/* Interactive Map Pins (Dating Escapes & Road Trips) */}
                <div className="relative z-10 my-4 h-24 relative">
                  {/* Pin 1: Nandi Hills Sunrise Convoy */}
                  <div
                    onClick={() => {
                      hapticSuccess();
                      setSelectedTrip(TRIPS_DATA[0]);
                    }}
                    className="absolute top-1 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2.5 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5 text-[10px] font-[800] cursor-pointer hover:scale-105 active:scale-95 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>⛰️ Nandi Convoy (3 Pairs)</span>
                  </div>

                  {/* Pin 2: Indiranagar Chai Date */}
                  <div
                    onClick={() => {
                      hapticSuccess();
                      setSelectedTrip(TRIPS_DATA[1]);
                    }}
                    className="absolute bottom-2 left-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2.5 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5 text-[10px] font-[800] cursor-pointer hover:scale-105 active:scale-95 transition"
                  >
                    <span>☕ Coorg Estate Drive</span>
                  </div>

                  {/* Pin 3: Cubbon Park Sunset Walk */}
                  <div
                    onClick={() => {
                      hapticSuccess();
                      setSelectedTrip(TRIPS_DATA[2] || TRIPS_DATA[0]);
                    }}
                    className="absolute top-12 left-16 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-2 py-0.5 rounded-full shadow-md border border-white/30 flex items-center gap-1 text-[9px] font-bold cursor-pointer hover:scale-105 transition"
                  >
                    <span>💕 Gokarna Trail</span>
                  </div>
                </div>

                {/* Map Bottom Action Bar */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="text-[11px] text-white/70 font-medium">
                    Tap any pin to view route & join
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setSelectedTrip(TRIPS_DATA[0]);
                    }}
                    className="px-3 py-1 rounded-full bg-white text-stone-900 text-[11px] font-bold active:scale-95 transition"
                  >
                    View Nearest &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* 5. BENTO SCHEDULE & HIGHLIGHTS (Screenshot 2 Exact) */}
            <div className="px-6 space-y-3">
              {/* Lime Green Banner Card with Scheduled Timeline Blocks */}
              <div className="bg-[#D8F8A7] rounded-[28px] p-4 shadow-sm border border-lime-300/60 flex items-start justify-between gap-3">
                <div className="pt-1">
                  <div className="text-[24px] font-[900] text-lime-950 leading-none">Oct 4</div>
                  <div className="text-[11px] font-bold text-lime-900/70 mt-1">Saturday</div>
                </div>

                <div className="flex-1 space-y-1.5 pl-2">
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-xs border border-white">
                    <div className="text-[11px] font-[800] text-stone-800 truncate">Dawn Convoy Meetup</div>
                    <div className="text-[9px] text-stone-500 font-semibold">05:30 – 08:45 AM</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-xs border border-white">
                    <div className="text-[11px] font-[800] text-stone-800 truncate">Fortress Peak Summit & Chai</div>
                    <div className="text-[9px] text-stone-500 font-semibold">09:00 – 11:30 AM</div>
                  </div>
                </div>
              </div>

              {/* Bento Duo: Pink Chat Card & Blue Hours Gauge Card */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left Pink Chat Card */}
                <div className="bg-[#FFEBF2] rounded-[26px] p-4 shadow-sm border border-rose-200/60 flex flex-col justify-between min-h-[140px]">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 text-lg">
                    💬
                  </div>
                  <div>
                    <div className="text-[13px] font-[800] text-rose-950">Let's talk now!</div>
                    <button
                      type="button"
                      onClick={() => router.push('/messages')}
                      className="mt-2 w-full py-1.5 rounded-full bg-[#18181B] text-white text-[11px] font-bold shadow-xs active:scale-95 transition"
                    >
                      Start chat
                    </button>
                  </div>
                </div>

                {/* Right Blue Hours Gauge Card */}
                <div className="bg-[#E8F3FF] rounded-[26px] p-4 shadow-sm border border-sky-200/60 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="text-[20px] font-[900] text-sky-950 leading-none">21:30</div>
                    <div className="text-[10px] font-bold text-sky-900/60 mt-0.5">Hours explored</div>
                  </div>

                  {/* 3D Gauge Clock Visual */}
                  <div className="w-12 h-12 rounded-full border-4 border-sky-400/30 border-t-sky-600 self-end flex items-center justify-center">
                    <Clock className="w-4 h-4 text-sky-700" />
                  </div>
                </div>
              </div>

              {/* Active Escapes Progress List Card */}
              <div className="bg-white rounded-[26px] p-4 shadow-sm border border-stone-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-[800] text-[#18181B]">Active escapes</span>
                  <span className="text-[11px] font-bold text-[#1D8E66]">View all &gt;</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-[800] text-stone-900">Skandagiri Midnight Ridge</div>
                    <div className="text-[10px] text-stone-500 font-medium">18 explorers · 4 spots open</div>
                    {/* Segmented Progress Pill Bar */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                        <div
                          key={seg}
                          className={`h-2 w-3 rounded-full ${
                            seg <= 6 ? 'bg-[#0066FF]' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                      <span className="text-[9px] font-bold text-stone-500 ml-1.5">2 spots left</span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xl shadow-sm">
                    ⛰️
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: HOST AN ESCAPE (6-STEP WIZARD) ================= */}
        {activeTab === 'create' && (
          <div className="px-5 pt-3.5 pb-32 flex flex-col justify-between animate-fade-in">
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
                    STEP {createStep.toString().padStart(2, '0')} / 06
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
              <div className="grid grid-cols-6 gap-1.5 mb-5 mt-1.5">
                {[1, 2, 3, 4, 5, 6].map((st) => (
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
                          sub: 'Strictly 1-on-1 private date · 1 Guest only',
                          badge: '1 GUEST ONLY (1-ON-1)',
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
                              const nextType = opt.id === 'buddies' ? 'green' : (opt.id as any);
                              setCreateType(nextType);
                              if (nextType === 'pink') {
                                setCreateGroupSize('1-on-1');
                              }
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

              {/* ---------------- QUESTION 4: SCREENSHOT-MATCHING DATE & TIME STUDIO ---------------- */}
              {createStep === 4 && (
                <div className="animate-fade-in space-y-4 pb-2">
                  {/* Top Host Profile Card (Exact Screenshot Match) */}
                  <div className="bg-white rounded-[28px] p-5 shadow-sm border border-[#18181B]/[0.06] text-center flex flex-col items-center relative overflow-hidden">
                    <div className="relative mb-2.5">
                      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#1D8E66]/30 to-emerald-200/50 shadow-inner flex items-center justify-center overflow-hidden bg-stone-100">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                          alt="Jordan"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="avatar-fallback hidden w-full h-full rounded-full bg-emerald-700 text-white font-[800] text-[24px] items-center justify-center">
                          J
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#1D8E66] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <h3 className="text-[22px] font-[800] text-[#18181B] tracking-tight">
                      {createType === 'pink' ? 'Jordan' : 'Jordan'}
                    </h3>
                    <p className="text-[13px] text-stone-500 font-medium mt-0.5">
                      Received schedule expires in 7 days
                    </p>

                    {/* Horizontal Date Cards (All upcoming dates + custom calendar picker) */}
                    <div className="w-full mt-4">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                          Select Date
                        </span>
                        <button
                          type="button"
                          onClick={() => datePickerInputRef.current?.showPicker?.() || datePickerInputRef.current?.click?.()}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#1D8E66] hover:underline cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Calendar</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 w-full overflow-x-auto pb-2 scrollbar-none px-1">
                        {calendarDateList.map((item) => {
                          const isSelected = selectedDateCard === item.label || createDate === item.label;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                hapticTap();
                                setSelectedDateCard(item.label);
                                setCreateDate(item.label);
                              }}
                              className={`min-w-[82px] h-[78px] rounded-[20px] shrink-0 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1D8E66] text-white shadow-lg shadow-[#1D8E66]/25 scale-[1.03]'
                                  : 'bg-white border border-stone-200/90 text-stone-700 hover:border-emerald-300 shadow-xs'
                              }`}
                            >
                              <span className={`text-[14px] font-[700] tracking-tight ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                                {item.day}
                              </span>
                              <span className={`text-[12px] font-[600] mt-0.5 ${isSelected ? 'text-white/90' : 'text-stone-500'}`}>
                                {item.date}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Hidden Native Date Picker Input */}
                      <input
                        ref={datePickerInputRef}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleCustomDatePicked}
                        className="hidden"
                      />

                      {/* Host Later Calendar Action Button */}
                      <button
                        type="button"
                        onClick={() => datePickerInputRef.current?.showPicker?.() || datePickerInputRef.current?.click?.()}
                        className="mt-2.5 flex items-center justify-center gap-2 text-[12px] font-bold text-[#1D8E66] hover:text-[#167050] transition cursor-pointer py-2.5 px-3.5 rounded-2xl bg-[#EAF6F0] border border-emerald-900/10 w-full active:scale-98"
                      >
                        <Calendar className="w-4 h-4 text-[#1D8E66]" />
                        <span>Host on a later date (Open Calendar)</span>
                      </button>
                    </div>
                  </div>

                  {/* Vertical Tumbler Time Drum (Real Smooth Scroll & Wheel Picker) */}
                  <div className="bg-white rounded-[28px] py-4 px-3 shadow-sm border border-[#18181B]/[0.06] overflow-hidden relative">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="text-[13px] text-stone-500 font-medium">
                        {createType === 'pink' ? 'Video call starts in' : 'Video call starts in'}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTimeIndex > 0) {
                              handleSelectTimeSlot(selectedTimeIndex - 1);
                            }
                          }}
                          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
                          aria-label="Previous time"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTimeIndex < TIME_WHEEL_SLOTS.length - 1) {
                              handleSelectTimeSlot(selectedTimeIndex + 1);
                            }
                          }}
                          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
                          aria-label="Next time"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Time Drum 220px Window */}
                    <div className="relative h-[220px]">
                      {/* Fixed Central Highlight Band */}
                      <div className="absolute top-[88px] left-0 right-0 h-[44px] bg-[#EAF6F0] border-y border-[#1D8E66]/20 pointer-events-none rounded-xl z-0" />

                      {/* Scrollable Drum List */}
                      <div
                        ref={timeWheelRef}
                        onScroll={handleTimeWheelScroll}
                        className="h-full overflow-y-auto snap-y snap-mandatory relative z-10 scrollbar-none overscroll-contain"
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          touchAction: 'pan-y',
                        }}
                      >
                        {/* Top 2-slot spacer */}
                        <div className="h-[88px] shrink-0 pointer-events-none" />

                        {/* All Slots */}
                        {TIME_WHEEL_SLOTS.map((slotTime, idx) => {
                          const isSelected = idx === selectedTimeIndex;
                          const isNear = Math.abs(idx - selectedTimeIndex) === 1;
                          const isFar = Math.abs(idx - selectedTimeIndex) === 2;

                          return (
                            <div
                              key={slotTime}
                              onClick={() => handleSelectTimeSlot(idx)}
                              className={`h-[44px] snap-center flex items-center justify-center cursor-pointer transition-all duration-150 select-none ${
                                isSelected
                                  ? 'text-[#1D8E66] font-[800] text-[18px] tracking-tight scale-105'
                                  : isNear
                                  ? 'text-stone-500 hover:text-stone-800 font-[600] text-[15px]'
                                  : isFar
                                  ? 'text-stone-300 hover:text-stone-500 font-[500] text-[14px]'
                                  : 'text-stone-200/50 font-[400] text-[13px]'
                              }`}
                            >
                              {slotTime}
                            </div>
                          );
                        })}

                        {/* Bottom 2-slot spacer */}
                        <div className="h-[88px] shrink-0 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 5: SQUAD CAPACITY & TRANSPORTATION LOGISTICS ---------------- */}
              {createStep === 5 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B] flex items-center gap-2">
                      <span>{createType === 'pink' ? 'How will you travel?' : 'Who is joining & how are you traveling?'}</span>
                      <span className="text-sm">🚗</span>
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      {createType === 'pink'
                        ? 'Select travel and convoy arrangements for the meetup.'
                        : 'Set participant capacity limits and travel convoy arrangements.'}
                    </p>
                  </div>

                  {/* Squad Capacity Card (Hidden for Date Mode per user request) */}
                  {createType !== 'pink' && (
                    <div className="bg-white rounded-[26px] p-5 shadow-sm border border-[#18181B]/[0.08] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#18181B]/60" />
                          <span>SQUAD PARTICIPANT CAPACITY</span>
                        </label>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#18181B]/5 text-[#18181B]/70">
                          Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {[
                          {
                            id: '1-on-1',
                            title: '1-on-1 (2 Total)',
                            desc: 'Just you and 1 explorer · Private duo',
                            badge: 'Private',
                          },
                          {
                            id: '2-4',
                            title: 'Squad (3-4 Members)',
                            desc: 'Small tight-knit group · Recommended for cars & trails',
                            badge: 'Popular',
                          },
                          {
                            id: '5+',
                            title: 'Community Group (5+ Members)',
                            desc: 'Open convoy meetup · Best for casual social walks',
                            badge: 'Open',
                          },
                        ].map((sz) => {
                          const isSelected = createGroupSize === sz.id;
                          return (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => {
                                hapticTap();
                                setCreateGroupSize(sz.id);
                              }}
                              className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#18181B] text-white border-[#18181B] shadow-md scale-[1.01]'
                                  : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/80 hover:border-[#18181B]/20'
                              }`}
                            >
                              <div>
                                <div className="text-[13px] font-[800]">{sz.title}</div>
                                <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-stone-500'}`}>
                                  {sz.desc}
                                </div>
                              </div>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                                }`}
                              >
                                {sz.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Transportation Logistics Card */}
                  <div className="bg-white rounded-[26px] p-5 shadow-sm border border-[#18181B]/[0.08] space-y-2.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#18181B]/60" />
                      <span>TRANSPORTATION ARRANGEMENTS</span>
                    </label>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {[
                        {
                          id: '🚗 Driving Private Car',
                          title: '🚗 Driving Private Car',
                          desc: 'Host is driving with 3-4 open seats in car',
                        },
                        {
                          id: '🏍️ Cruising Motorcycle',
                          title: '🏍️ Cruising Motorcycle',
                          desc: 'Solo cruiser or with pillion rider',
                        },
                        {
                          id: '🚕 Split Cabs / Rideshare',
                          title: '🚕 Split Cabs / Rideshare',
                          desc: 'Book Uber/cabs together & split ride cost evenly',
                        },
                        {
                          id: '🚙 Need a Ride / Co-pilot',
                          title: '🚙 Need a Ride / Co-pilot',
                          desc: 'Looking to join another member’s ride',
                        },
                      ].map((ride) => {
                        const isSelected = createRide === ride.id;
                        return (
                          <button
                            key={ride.id}
                            type="button"
                            onClick={() => {
                              hapticTap();
                              setCreateRide(ride.id);
                            }}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#18181B] text-white border-[#18181B] shadow-md scale-[1.01]'
                                : 'bg-white border-[#18181B]/[0.08] text-[#18181B]/80 hover:border-[#18181B]/20'
                            }`}
                          >
                            <div>
                              <div className="text-[13px] font-[800]">{ride.title}</div>
                              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-stone-500'}`}>
                                {ride.desc}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                                isSelected
                                  ? 'bg-[#1D8E66] border-[#1D8E66] text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- QUESTION 6: VIBES & SPLIT COST + BOARDING PASS ---------------- */}
              {createStep === 6 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B] flex items-center gap-2">
                      <span>Atmosphere & Shared Split</span>
                      <span className="text-sm">✨</span>
                    </h2>
                    <p className="text-[12px] text-[#18181B]/55 mt-1 font-normal">
                      Select vibe tags and set the fair estimated contribution per explorer.
                    </p>
                  </div>

                  {/* Vibe Tags Card */}
                  <div className="bg-white rounded-[26px] p-5 shadow-sm border border-[#18181B]/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        ATMOSPHERE & VIBE TAGS
                      </label>
                      <span className="text-[10px] font-bold text-stone-500">
                        {createVibes.length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Chai & Chill', icon: '☕', label: 'Chai & Chill' },
                        { id: 'Trek & Talk', icon: '🥾', label: 'Trek & Talk' },
                        { id: 'Photo Walks', icon: '📸', label: 'Photo Walks' },
                        { id: 'Sunset Views', icon: '🌅', label: 'Sunset Views' },
                        { id: 'Food Crawl', icon: '🍜', label: 'Food Crawl' },
                        { id: 'Scenic Drive', icon: '🚗', label: 'Scenic Drive' },
                        { id: 'Deep Talks', icon: '💬', label: 'Deep Talks' },
                        { id: 'Night Trek', icon: '⛺', label: 'Night Trek' },
                      ].map((tag) => {
                        const isSelected = createVibes.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleVibe(tag.id)}
                            className={`p-2.5 rounded-xl text-[12px] font-semibold tracking-tight border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                                : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>{tag.icon}</span>
                              <span className="truncate">{tag.label}</span>
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-[#1D8E66] shrink-0 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estimated Cost Split Card */}
                  <div className="bg-white rounded-[26px] p-5 shadow-sm border border-[#18181B]/[0.08] space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#18181B]/40">
                        ESTIMATED COST SPLIT / PERSON
                      </label>
                      <span className="text-[13px] font-[800] text-[#1D8E66] bg-[#EAF6F0] px-3 py-0.5 rounded-full border border-emerald-900/10">
                        {createCost === 0 ? 'Complimentary · Free' : `₹${createCost} / person`}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {[
                        { v: 0, l: 'Free' },
                        { v: 300, l: '₹300' },
                        { v: 600, l: '₹600' },
                        { v: 1200, l: '₹1.2k' },
                        { v: 2500, l: '₹2.5k' },
                      ].map((c) => {
                        const isSelected = createCost === c.v;
                        return (
                          <button
                            key={c.v}
                            type="button"
                            onClick={() => {
                              hapticTap();
                              setCreateCost(c.v);
                            }}
                            className={`py-2.5 rounded-xl border text-center text-[12px] font-bold transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                                : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {c.l}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-stone-500 font-normal leading-relaxed pt-1">
                      Estimated shared split for fuel, snacks & entry tickets. Settled directly during the trip.
                    </p>
                  </div>

                  {/* ================= LUXURY BOARDING PASS PREVIEW ================= */}
                  <div className="rounded-[26px] bg-white border border-[#18181B]/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden">
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
                          <span className="font-bold text-[#18181B] truncate">{createTimeSlot}</span>
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

            {/* ================= DOCKED DEDICATED ACTIONS ================= */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pt-3 pb-[max(20px,calc(env(safe-area-inset-bottom,16px)+14px))] z-[99] bg-[#FAF8F5]/98 backdrop-blur-2xl border-t border-[#18181B]/[0.1] shadow-[0_-12px_32px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    if (createStep > 1) {
                      setCreateStep((s) => Math.max(1, s - 1));
                    } else {
                      setActiveTab('explore');
                      router.replace('/trips');
                    }
                  }}
                  className="h-12 px-4 rounded-2xl bg-white border border-[#18181B]/[0.1] font-bold text-[13px] text-[#18181B] active:scale-95 transition cursor-pointer hover:bg-black/5 shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-[#18181B]/70" />
                  <span>{createStep === 1 ? 'Cancel' : 'Back'}</span>
                </button>

                {createStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setCreateStep((s) => Math.min(6, s + 1));
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
                <div className={`h-8 px-3 rounded-full backdrop-blur-xl border text-white text-[11px] font-semibold flex items-center gap-1.5 shadow ${
                  selectedTrip.type === 'pink' ? 'bg-rose-950/60 border-rose-400/30' : 'bg-black/40 border-white/20'
                }`}>
                  <Users className={`w-3.5 h-3.5 ${selectedTrip.type === 'pink' ? 'text-rose-300' : 'text-emerald-400'}`} />
                  <span>{selectedTrip.type === 'pink' ? '✦ 1-on-1 (1 spot only)' : `${selectedTrip.totalSpots - selectedTrip.spots} spots available`}</span>
                </div>
              </div>

              <div className="relative z-10 text-white">
                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 ${selectedTrip.coverStyle.badge}`}>
                  {selectedTrip.type === 'pink' ? '✦ 1-on-1 Curated Date' : selectedTrip.category === 'women' ? '👩 Women Safe Circle' : '● Verified Roadtrip'}
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
              {selectedTrip.type === 'pink' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Requested 1-on-1 Date! ✦', {
                        style: { background: '#141414', color: '#FAF7F2' },
                      });
                      setSelectedTrip(null);
                    }}
                    className="w-full h-12 rounded-2xl bg-[#331822] text-rose-200 border border-rose-800/40 font-bold text-[13px] tracking-wide shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>✦ Request 1-on-1 Date</span>
                  </button>
                  <div className="text-center text-[10px] text-[#18181B]/40 mt-2 font-medium">
                    Strictly 1-on-1 Date · Host approves request before confirmation
                  </div>
                </div>
              ) : (
                <div>
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
                      Join Squad
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        toast.success('Joined Exploration! ⛰️', {
                          style: { background: '#141414', color: '#FAF7F2' },
                        });
                        setSelectedTrip(null);
                      }}
                      className="flex-[1.5] h-12 rounded-2xl bg-[#18181B] text-white font-bold text-[13px] tracking-wide shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Join Exploration</span>
                    </button>
                  </div>
                  <div className="text-center text-[10px] text-[#18181B]/40 mt-2 font-medium">
                    Host approves all requests · Zero charges until confirmed
                  </div>
                </div>
              )}
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
