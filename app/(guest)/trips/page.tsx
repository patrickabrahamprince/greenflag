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
  Layers,
  List,
  Play,
  Pause,
  Mic,
  Send,
  MessageSquare,
  Volume2,
  Flame,
  Map as MapIcon,
  Heart,
} from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

export interface CityExplorer {
  id: string;
  name: string;
  age: number;
  distance: string;
  avatar: string;
  role: string;
  coords: { x: number; y: number };
  isHighlighted?: boolean;
}

export const CITY_EXPLORERS: CityExplorer[] = [
  {
    id: 'olivia',
    name: 'Olivia',
    age: 24,
    distance: '3.5 km away',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    role: 'Product Designer',
    coords: { x: 38, y: 56 },
    isHighlighted: true,
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 27,
    distance: '4.8 km away',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    role: 'Street Photographer',
    coords: { x: 84, y: 44 },
  },
  {
    id: 'aisha',
    name: 'Aisha',
    age: 26,
    distance: '1.2 km away',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    role: 'Marketing Lead',
    coords: { x: 53, y: 74 },
  },
  {
    id: 'leo',
    name: 'Leo',
    age: 25,
    distance: '2.1 km away',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    role: 'Architect & Cyclist',
    coords: { x: 26, y: 92 },
  },
];

export interface ChatMessageItem {
  id: string;
  sender: 'other' | 'me';
  text?: string;
  time: string;
  emoji?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
}

export const INITIAL_OLIVIA_CHAT: ChatMessageItem[] = [
  {
    id: '1',
    sender: 'other',
    text: 'Pretty good – busy, but in a good way. Just finished work. 🐶 You?',
    time: '3:15 PM',
  },
  {
    id: '2',
    sender: 'me',
    text: "Nice timing. There's a street food festival happening downtown tonight.",
    time: '3:17 PM',
  },
  {
    id: '3',
    sender: 'other',
    text: 'Sounds like a sign. Want to go together?',
    time: '3:17 PM',
  },
  {
    id: '4',
    sender: 'me',
    text: 'Honestly? Yeah. Street food is a solid first date.',
    time: '3:18 PM',
    emoji: '🔥',
  },
  {
    id: '5',
    sender: 'other',
    isVoiceNote: true,
    voiceDuration: '00:14',
    time: '3:19 PM',
  },
  {
    id: '6',
    sender: 'me',
    text: 'Good answer. What time are you thinking?',
    time: '3:20 PM',
  },
];

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
    tag: 'DAWN EXPEDITION',
    badgeBg: 'bg-emerald-900/80 text-emerald-300 border-emerald-700/50',
    title: 'Sunrise Above the Clouds',
    subtitle: 'Nandi Hills Fortress convoy with artisanal dawn filter chai',
    stats: '4.9 Star · 2 Seats Available',
    tripId: 1,
    bgGradient: 'from-[#0d281a] via-[#091e13] to-[#040f09]',
    accentColor: 'text-emerald-400',
    icon: '',
  },
  {
    id: 2,
    tag: 'ARTISAN COFFEE EXPEDITION',
    badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-700/50',
    title: 'Coorg Private Coffee Tasting',
    subtitle: 'Estate walks, fresh single-origin roast & slow photography',
    stats: '4.85 Star · 1 Spot Left',
    tripId: 2,
    bgGradient: 'from-[#2a1b10] via-[#1c120a] to-[#0e0905]',
    accentColor: 'text-amber-300',
    icon: '',
  },
  {
    id: 3,
    tag: '100% FEMALE VERIFIED',
    badgeBg: 'bg-purple-900/80 text-purple-300 border-purple-700/50',
    title: 'Gokarna Beach & Cliff Circle',
    subtitle: 'Sunset yoga, secluded coves & beachside brunch circle',
    stats: '5.0 Star · Women Safe Circle',
    tripId: 6,
    bgGradient: 'from-[#281330] via-[#1a0c20] to-[#0a040d]',
    accentColor: 'text-purple-300',
    icon: '',
  },
  {
    id: 4,
    tag: 'STARLIGHT TRAVERSE',
    badgeBg: 'bg-indigo-900/80 text-indigo-300 border-indigo-700/50',
    title: 'Skandagiri Midnight Ridge Climb',
    subtitle: 'Ascent under the stars for peak cloud inversions',
    stats: '4.95 Star · Departs Tonight 11 PM',
    tripId: 4,
    bgGradient: 'from-[#121630] via-[#0b0e20] to-[#04060e]',
    accentColor: 'text-indigo-300',
    icon: '',
  },
];

const MARQUEE_ITEMS = [
  'Aarav confirmed 2 seats on Nandi Sunrise Convoy',
  '100% ID Verified & Escort-Free Protocol active',
  'Savandurga Flash Roadtrip departs in 2 hours',
  'Meera opened Coorg Coffee Estate Cupping',
  'Ananya joined Gokarna Women Circle',
  'Indiranagar Hub: 18 departures scheduled today',
  'Top Rated Host Sanya reached Level 15 Explorer',
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
    time: 'Today · 3:30 PM',
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

  // 3D City Aerial Map & Conversation State (Matching Dribbble Spec)
  const [is3DMapView, setIs3DMapView] = useState(false);
  const [selectedCityExplorer, setSelectedCityExplorer] = useState<CityExplorer>(CITY_EXPLORERS[0]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(INITIAL_OLIVIA_CHAT);
  const [chatInputText, setChatInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // Audio voice note timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 14) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInputText.trim();
    if (!text) return;
    hapticSuccess();
    const newMsg: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText('');

    // Dynamic auto-reply from Olivia
    setTimeout(() => {
      hapticTap();
      const replyMsg: ChatMessageItem = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        text: "Sounds perfect! Let's meet by 7:30 near the main food festival entrance 🍕✨",
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, replyMsg]);
      toast.success(`${selectedCityExplorer.name} replied!`);
    }, 1200);
  };

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
    const newX = Math.max(-280, Math.min(280, mapPanStart.current.x + dx));
    const newY = Math.max(-260, Math.min(260, mapPanStart.current.y + dy));
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
            toast.success(`Located in ${city}!`, {
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
          toast.success(`Locked to ${locality}!`, {
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
      toast.success('Set to Indiranagar Hub', {
        style: { background: '#141414', color: '#FAF7F2' },
      });
      setShowLocationModal(false);
    } catch {
      setSelectedLocation({
        name: 'Indiranagar, Bengaluru',
        city: 'Bengaluru, Karnataka',
      });
      toast.success('Set to Indiranagar Hub', {
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
      toast.success(`Escape scheduled for ${label}!`, {
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
  const [createRide, setCreateRide] = useState('Private Car · 3 Spots');
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
          toast.success(`Located: ${locality}`, {
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
    <div className="w-full h-full flex flex-col bg-white overflow-hidden max-w-md mx-auto select-none antialiased">
      
      {/* ================= MARRIOTT BONVOY STYLE FROZEN EDITORIAL HEADER ================= */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-6 border-b border-stone-100">
        <div className="flex items-center justify-between mb-3">
          {/* User Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full p-0.5 bg-[#1C1C1E] shadow-xs flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Korina';
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-stone-500">Welcome Back</div>
              <div className="text-[15px] font-bold text-[#1C1C1E] tracking-tight">Korina Villanueva</div>
            </div>
          </div>

          {/* Top Right Actions: 3D Map Toggle, Notifications & Plus Action Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setIs3DMapView(!is3DMapView);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                is3DMapView 
                  ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                  : 'bg-stone-50 text-[#1C1C1E] border-stone-200 hover:bg-stone-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{is3DMapView ? 'Feed' : 'Map'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                hapticTap();
                setActiveTab('create');
                router.replace('/trips?tab=create');
              }}
              className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-base shadow-sm hover:bg-black active:scale-95 transition cursor-pointer"
              aria-label="Create Plan"
            >
              +
            </button>
          </div>
        </div>

        {/* Marriott Style "Where can we take you?" Search Bar */}
        <div>
          <div
            onClick={() => {
              hapticTap();
              setShowLocationModal(true);
            }}
            className="w-full bg-[#F4F4F5] hover:bg-stone-100 active:scale-[0.99] border border-stone-200 rounded-full px-4 py-3 flex items-center justify-between cursor-pointer transition shadow-2xs"
          >
            <div className="flex items-center gap-2.5 text-stone-600">
              <Search className="w-4 h-4 text-[#1C1C1E]" />
              <span className="text-xs font-semibold text-[#1C1C1E]">Where can we take you?</span>
            </div>
            <span className="text-[11px] font-bold text-[#1C1C1E] bg-white px-3 py-1 rounded-full border border-stone-200 shadow-2xs truncate max-w-[140px]">
              📍 {selectedLocation.name.split(',')[0]}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-36 z-10 bg-white">
        
        {/* ================= VIEW 1: DATING + TRAVEL ESCAPES HUB ================= */}
        {activeTab === 'explore' && (
          <div className="h-full flex flex-col animate-fade-in space-y-4 pt-3">

            {/* 2. INTERACTIVE EDITORIAL MAP CANVAS */}
            <div className="px-6">
              <div className="flex items-center gap-1.5 mb-2">
                <Compass className="w-4 h-4 text-[#1C1C1E]" />
                <span className="text-[13px] font-bold text-[#1C1C1E] tracking-tight">
                  {is3DMapView ? '3D City Proximity Map' : 'Travel Dating Radar & Live Routes'}
                </span>
              </div>
            </div>

            {/* ================= 3D AERIAL CITY SKYLINE VIEW ================= */}
            {is3DMapView ? (
              <div className="relative h-[480px] mx-6 mb-2 rounded-3xl overflow-hidden border border-stone-200 shadow-lg select-none bg-stone-900">
                
                {/* 3D Skyscraper Cityscape Photo Backdrop */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage: `url('/city_3d_aerial.jpg')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65 pointer-events-none" />
                </div>

                {/* Top Floating Frosted Card */}
                <div className="absolute top-4 inset-x-4 z-30">
                  <div 
                    onClick={() => {
                      hapticTap();
                      setShowChatModal(true);
                    }}
                    className="bg-white/90 backdrop-blur-2xl border border-white/80 shadow-xl rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-white active:scale-[0.98] transition"
                  >
                    {/* Left: Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedCityExplorer.avatar}
                          alt={selectedCityExplorer.name}
                          className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-white rounded-full" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#1C1C1E] tracking-tight leading-tight">
                          {selectedCityExplorer.name}
                        </div>
                        <div className="text-[11px] font-medium text-stone-500">
                          {selectedCityExplorer.distance}
                        </div>
                      </div>
                    </div>

                    {/* Right: Chat Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        hapticSuccess();
                        setShowChatModal(true);
                      }}
                      className="w-9 h-9 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-sm hover:bg-black active:scale-90 transition cursor-pointer"
                      aria-label="Open Chat"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Floating Avatar Pins */}
                {CITY_EXPLORERS.map((explorer) => {
                  const isSelected = selectedCityExplorer.id === explorer.id;
                  return (
                    <button
                      key={explorer.id}
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setSelectedCityExplorer(explorer);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300 cursor-pointer ${
                        isSelected ? 'scale-115 z-40' : 'hover:scale-105 active:scale-95 opacity-90'
                      }`}
                      style={{ left: `${explorer.coords.x}%`, top: `${explorer.coords.y}%` }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div className={`rounded-full p-0.5 shadow-xl transition-all ${
                          isSelected
                            ? 'w-12 h-12 border-3 border-white ring-3 ring-black/40 bg-[#1C1C1E]'
                            : 'w-9 h-9 border-2 border-white bg-white'
                        }`}>
                          <img
                            src={explorer.avatar}
                            alt={explorer.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>

                        {isSelected && (
                          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-white font-bold text-[10px] shadow-md border border-white/20">
                            {explorer.name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Right Floating Map Controls */}
                <div className="absolute right-4 bottom-4 z-30 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-full p-1 flex flex-col gap-2 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        hapticTap();
                        setIs3DMapView(false);
                      }}
                      className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 flex items-center justify-center text-stone-800 transition active:scale-90 shadow-2xs cursor-pointer"
                      aria-label="Toggle Layer"
                    >
                      <MapIcon className="w-3.5 h-3.5 text-stone-800" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
            <div 
              className="relative h-[260px] bg-[#F4F4F5] overflow-hidden mx-6 mb-2 rounded-3xl border border-stone-200/90 shadow-inner shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={(e) => handleMapPointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handleMapPointerMove(e.clientX, e.clientY)}
              onMouseUp={handleMapPointerUp}
              onMouseLeave={handleMapPointerUp}
              onTouchStart={handleMapTouchStart}
              onTouchMove={handleMapTouchMove}
              onTouchEnd={handleMapTouchEnd}
              onWheel={handleMapWheel}
            >
              {/* Pannable & Zoomable World Layer */}
              <div
                className="absolute inset-[-220px] transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Subtle Map Grid Texture */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Topography & Arterial Roads Vector */}
                <div className="absolute inset-0 p-5 pointer-events-none">
                  <div className="w-full h-full relative">
                    <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 300 C 250 180, 450 500, 800 350" fill="none" stroke="#FFFFFF" strokeWidth="18" />
                      <path d="M 180 0 C 220 280, 320 400, 400 800" fill="none" stroke="#E4E4E7" strokeWidth="12" />
                      <path d="M 450 0 C 400 250, 580 420, 540 800" fill="none" stroke="#FFFFFF" strokeWidth="14" />
                      {activeMapPin && (
                        <line 
                          x1="380" 
                          y1="340" 
                          x2={`${activeMapPin.pin.x * 6}`} 
                          y2={`${activeMapPin.pin.y * 6}`} 
                          stroke="#1C1C1E" 
                          strokeWidth="2.5" 
                          strokeDasharray="5 4" 
                          className="opacity-75"
                        />
                      )}
                    </svg>

                    {/* Central User Location Beacon */}
                    <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-[#1C1C1E]/15 animate-ping absolute" />
                      <div className="w-5 h-5 rounded-full bg-[#1C1C1E] border-2 border-white shadow-md flex items-center justify-center text-white">
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Luxury Event Pins */}
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-20 pointer-events-auto ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{ left: `${trip.pin.x}%`, top: `${trip.pin.y}%` }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap mb-1 shadow-sm border ${
                          isSelected 
                            ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                            : 'bg-white text-[#1C1C1E] border-stone-200'
                        }`}>
                          {trip.destination.split(' ')[0]} • ₹{trip.cost}
                        </div>

                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shadow-md ${
                          isSelected 
                            ? 'border-white bg-[#1C1C1E] text-white ring-2 ring-[#1C1C1E]' 
                            : 'border-white bg-white text-[#1C1C1E]'
                        }`}>
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Floating Map Zoom Controls */}
              <div className="absolute right-3 top-3 z-30 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticTap();
                    setMapZoom((z) => Math.min(2.4, z + 0.2));
                  }}
                  className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-xs border border-stone-200 active:scale-90 transition cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticTap();
                    setMapZoom((z) => Math.max(0.7, z - 0.2));
                  }}
                  className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-xs border border-stone-200 active:scale-90 transition cursor-pointer"
                >
                  -
                </button>
              </div>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full text-[9px] font-medium text-white pointer-events-none">
                Pinch or drag to explore
              </div>
            </div>
            )}

            {/* ================= INTERACTIVE PIN SHEET ================= */}
            {activeMapPin && (
              <div className="mx-6 mb-1 p-4 bg-white rounded-3xl border border-stone-200 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-[#1C1C1E] border border-stone-200">
                      {activeMapPin.category === 'women' ? 'Women Circle' : activeMapPin.type === 'pink' ? 'Dating Escape' : 'Road Trip'}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {activeMapPin.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#1C1C1E]">
                    <Star className="w-3 h-3 fill-[#1C1C1E] text-[#1C1C1E]" />
                    <span>{activeMapPin.score}</span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="font-bold text-[15px] text-[#1C1C1E] tracking-tight leading-snug">
                    {activeMapPin.destination}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                    {activeMapPin.subtitle}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-700 font-medium bg-[#F4F4F5] p-2 rounded-xl border border-stone-200/80">
                    <MapPin className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="truncate">Pickup: <strong>{activeMapPin.pickupHub}</strong></span>
                    <span className="text-stone-300">•</span>
                    <span className="shrink-0">{activeMapPin.distance} ({activeMapPin.routeTime})</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1C1C1E] text-white font-bold text-xs flex items-center justify-center">
                      {activeMapPin.host.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-[12px] text-[#1C1C1E]">{activeMapPin.host.name}</div>
                      <div className="text-[10px] text-stone-400 font-medium">
                        {activeMapPin.totalSpots - activeMapPin.spots} spots left
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-[14px] text-[#1C1C1E]">
                        {activeMapPin.cost === 0 ? 'FREE' : `₹${activeMapPin.cost}`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        hapticSuccess();
                        setSelectedTrip(activeMapPin);
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#1C1C1E] text-white text-[11px] font-bold hover:bg-black active:scale-95 transition shadow-2xs cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CLEAN CURATED TRAVEL DATING CONVOYS FEED (Marriott Bonvoy style) */}
            <div className="px-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[#1C1C1E] tracking-tight">
                    Featured Escapes & Trips
                  </h2>
                  <p className="text-[11px] text-stone-500 font-normal">
                    {filteredTrips.length} verified getaways & dates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setActiveTab('create');
                    router.replace('/trips?tab=create');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] text-white text-[11px] font-bold shadow-2xs hover:bg-black active:scale-95 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Host Escape</span>
                </button>
              </div>

              {/* Clean Unified Escape Cards */}
              <div className="space-y-4">
                {filteredTrips.map((trip, idx) => {
                  return (
                    <div
                      key={trip.id}
                      onClick={() => {
                        hapticTap();
                        setSelectedTrip(trip);
                      }}
                      style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:border-stone-400 hover:shadow-md transition-all duration-300 cubic-bezier(0.16,1,0.3,1) active:scale-[0.98] cursor-pointer space-y-3.5 animate-card-enter"
                    >
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-[#1C1C1E] border border-stone-200">
                            {trip.category === 'women' ? 'Women Safe' : trip.type === 'pink' ? '1-on-1 Date' : 'Road Trip'}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {trip.time}
                          </span>
                        </div>

                        <div className="text-[16px] font-extrabold text-[#1C1C1E]">
                          {trip.cost === 0 ? 'FREE' : `₹${trip.cost}`}
                        </div>
                      </div>

                      {/* Destination & Description */}
                      <div className="space-y-1">
                        <h3 className="text-[17px] font-bold text-[#1C1C1E] leading-snug tracking-tight">
                          {trip.destination}
                        </h3>
                        <p className="text-[13px] text-stone-500 font-normal line-clamp-1">
                          {trip.subtitle}
                        </p>
                      </div>

                      {/* Pickup & Distance Pill */}
                      <div className="flex items-center gap-2.5 text-[11px] text-stone-700 font-medium bg-[#F4F4F5] px-3.5 py-2 rounded-2xl border border-stone-200/80">
                        <MapPin className="w-4 h-4 text-stone-600 shrink-0" />
                        <span className="truncate">Pickup: <strong>{trip.pickupHub}</strong></span>
                        <span className="text-stone-300">•</span>
                        <span className="shrink-0">{trip.distance} ({trip.routeTime})</span>
                      </div>

                      {/* Host & Spots Left Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {trip.host.avatar}
                          </div>
                          <div>
                            <span className="font-bold text-[13px] text-[#1C1C1E]">{trip.host.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                            {trip.totalSpots - trip.spots} spots left
                          </span>
                          <div className="w-7 h-7 rounded-full bg-stone-100 text-[#1C1C1E] flex items-center justify-center">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <div className="mb-4 p-4 rounded-2xl bg-[#18181B] text-[#F7F6EB] text-[11px] leading-relaxed animate-fade-in shadow-xl border border-white/10">
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
                        icon: '',
                        badge: 'PUBLIC VENUE ONLY',
                      },
                      {
                        id: 'day',
                        label: 'Day Date / Sunrise Roadtrip',
                        sub: '1-day scenic drive, hill fortress or viewpoint',
                        icon: '',
                        badge: 'HIGH DEMAND',
                      },
                      {
                        id: 'getaway',
                        label: 'Weekend Retreat / Getaway',
                        sub: '2-3 days coffee estate, trekking or camping',
                        icon: '',
                        badge: 'VERIFIED ID REQUIRED',
                      },
                      {
                        id: 'crawl',
                        label: 'Artisan Food & Cafe Crawl',
                        sub: '2-3 hours curated culinary spots with a buddy',
                        icon: '',
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
                        <div className="w-11 h-11 rounded-2xl bg-[#F7F6EB] border border-[#18181B]/[0.06] flex items-center justify-center text-[20px] shadow-inner shrink-0">
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
                        {gpsDetected ? 'High precision coordinate locked' : 'Instant 1-tap locality scan'}
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
                          {spot}
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
                          title: 'A Date',
                          sub: 'Strictly 1-on-1 private date · 1 Guest only',
                          badge: '1 GUEST ONLY (1-ON-1)',
                          borderActive: 'border-[#331822] bg-[#FAF5F7] ring-1 ring-[#331822]',
                          badgeBg: 'text-rose-900 bg-rose-100/60',
                        },
                        {
                          id: 'green',
                          title: 'A Trip',
                          sub: 'Scenic roadtrip, summit trek & sights',
                          badge: 'EXPLORATION',
                          borderActive: 'border-[#12221A] bg-[#F4F8F5] ring-1 ring-[#12221A]',
                          badgeBg: 'text-emerald-900 bg-emerald-100/60',
                        },
                        {
                          id: 'buddies',
                          title: 'Buddies',
                          sub: 'Chill social weekend & new conversations',
                          badge: 'SOCIAL CIRCLE',
                          borderActive: 'border-[#18181B] bg-[#F8F7F5] ring-1 ring-[#18181B]',
                          badgeBg: 'text-zinc-900 bg-zinc-200/60',
                        },
                        {
                          id: 'women',
                          title: 'Women-Only',
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
                          X
                        </button>
                      ) : null}
                    </div>

                    {/* Google Maps Live Search Results Dropdown */}
                    {placesResults.length > 0 && (
                      <div className="mt-2 rounded-2xl bg-white border border-[#18181B]/[0.1] shadow-xl overflow-hidden animate-fade-in divide-y divide-[#18181B]/[0.05] z-30">
                        <div className="px-3.5 py-1.5 bg-[#F7F6EB] flex items-center justify-between">
                          <span className="text-[9px] font-bold text-[#18181B]/45 uppercase tracking-wider">
                            Google Maps Results
                          </span>
                          <span className="text-[9px] text-[#18181B]/40 font-medium">Tap to confirm</span>
                        </div>
                        {placesResults.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlace(place)}
                            className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#F7F6EB] transition cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-xl bg-[#F7F6EB] text-[#18181B] flex items-center justify-center shrink-0 mt-0.5 border border-[#18181B]/[0.06]">
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
                          id: 'Driving Private Car',
                          title: 'Driving Private Car',
                          desc: 'Host is driving with 3-4 open seats in car',
                        },
                        {
                          id: 'Cruising Motorcycle',
                          title: 'Cruising Motorcycle',
                          desc: 'Solo cruiser or with pillion rider',
                        },
                        {
                          id: 'Split Cabs / Rideshare',
                          title: 'Split Cabs / Rideshare',
                          desc: 'Book Uber/cabs together & split ride cost evenly',
                        },
                        {
                          id: 'Need a Ride / Co-pilot',
                          title: 'Need a Ride / Co-pilot',
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
                        { id: 'Chai & Chill', label: 'Chai & Chill' },
                        { id: 'Trek & Talk', label: 'Trek & Talk' },
                        { id: 'Photo Walks', label: 'Photo Walks' },
                        { id: 'Sunset Views', label: 'Sunset Views' },
                        { id: 'Food Crawl', label: 'Food Crawl' },
                        { id: 'Scenic Drive', label: 'Scenic Drive' },
                        { id: 'Deep Talks', label: 'Deep Talks' },
                        { id: 'Night Trek', label: 'Night Trek' },
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
                            <span className="truncate font-bold">
                              {tag.label}
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
                        {createType === 'pink' ? 'Curated Date' : createType === 'women' ? 'Women Circle' : 'Roadtrip'}
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
                        <div className="absolute -left-6 -top-2 w-4 h-4 rounded-full bg-[#F7F6EB]" />
                        <div className="absolute -right-6 -top-2 w-4 h-4 rounded-full bg-[#F7F6EB]" />
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
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pt-3 pb-[max(20px,calc(env(safe-area-inset-bottom,16px)+14px))] z-[99] bg-[#F7F6EB]/98 backdrop-blur-2xl border-t border-[#18181B]/[0.1] shadow-[0_-12px_32px_rgba(0,0,0,0.1)]">
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
                    className="flex-1 h-12 rounded-2xl bg-[#18181B] text-[#F7F6EB] font-[800] text-[13px] tracking-wide shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Publish Private Escape</span>
                  </button>
                )}
              </div>
            </div>

            {/* Confetti / Published Success Overlay */}
            {isPublished && (
              <div className="fixed inset-0 z-[110] bg-[#F7F6EB]/98 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in max-w-md mx-auto">
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
          <div className="bg-[#F7F6EB] w-full rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)] pb-[env(safe-area-inset-bottom,12px)] border-t border-white/20">
            
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
                  <span>{selectedTrip.type === 'pink' ? '1-on-1 (1 spot only)' : `${selectedTrip.totalSpots - selectedTrip.spots} spots available`}</span>
                </div>
              </div>

              <div className="relative z-10 text-white">
                <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 ${selectedTrip.coverStyle.badge}`}>
                  {selectedTrip.type === 'pink' ? '1-on-1 Curated Date' : selectedTrip.category === 'women' ? 'Women Safe Circle' : 'Verified Roadtrip'}
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
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#F7F6EB] border border-[#18181B]/[0.08] font-bold text-[#18181B]/70">
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

                <div className="w-10 h-10 rounded-full bg-[#F7F6EB] border border-[#18181B]/[0.08] flex items-center justify-center relative shrink-0">
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
            <div className="p-4 bg-[#F7F6EB] border-t border-[#18181B]/[0.08] shrink-0">
              {selectedTrip.type === 'pink' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      toast.success('Requested 1-on-1 Date!', {
                        style: { background: '#141414', color: '#FAF7F2' },
                      });
                      setSelectedTrip(null);
                    }}
                    className="w-full h-12 rounded-2xl bg-[#331822] text-rose-200 border border-rose-800/40 font-bold text-[13px] tracking-wide shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Request 1-on-1 Date</span>
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
                        toast.success('Joined as Buddy!', {
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
                        toast.success('Joined Exploration!', {
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
          <div className="bg-[#F7F6EB] rounded-t-[32px] sm:rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-[#18181B]/[0.08] max-h-[85vh] flex flex-col animate-slide-up">
            
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

              {/* 1-Tap GPS Auto-Scan Button */}
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

              {/* Popular Neighborhoods in Bengaluru */}
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
                        toast.success(`Switched to ${item.name}`, {
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

              {/* Weekend Destinations & Other Cities */}
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
                        toast.success(`Switched to ${dest.name}`, {
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

      {/* ================= SCREEN 2: DATING & TRAVEL CHAT SCREEN (DRIBBLE SCREENSHOT 2) ================= */}
      {showChatModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center max-w-md mx-auto">
          <div className="w-full h-full bg-[#EDF3F8] flex flex-col justify-between overflow-hidden relative animate-fade-in text-[#141414]">
            
            {/* Top iOS Status & Dynamic Header */}
            <div className="px-5 pt-[max(14px,env(safe-area-inset-top,14px))] pb-3 bg-white/90 backdrop-blur-xl border-b border-stone-200/80 sticky top-0 z-30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 active:scale-90 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={selectedCityExplorer.avatar}
                      alt={selectedCityExplorer.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-xs"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <div className="font-[900] text-[15px] text-[#141414] leading-tight">
                      {selectedCityExplorer.name}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      {selectedCityExplorer.distance}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    toast.success('Sparks match verified!');
                  }}
                  className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 active:scale-90 transition cursor-pointer"
                  aria-label="Spark"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 active:scale-90 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Feed (Matching Screenshot) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-none">
              
              {/* Date Header Pill */}
              <div className="text-center my-1">
                <span className="px-3 py-1 rounded-full bg-white/70 text-stone-500 text-[10px] font-bold tracking-wider uppercase border border-stone-200/50">
                  Today
                </span>
              </div>

              {chatMessages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 animate-slide-up`}
                  >
                    {/* Voice Note Pill */}
                    {msg.isVoiceNote ? (
                      <div className="bg-white rounded-2xl rounded-tl-xs p-3 shadow-xs border border-stone-200/70 max-w-[260px] flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            hapticTap();
                            setIsPlayingAudio(!isPlayingAudio);
                          }}
                          className="w-9 h-9 rounded-full bg-[#141414] text-white flex items-center justify-center active:scale-90 transition cursor-pointer shrink-0"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                        
                        {/* Interactive Equalizer Waveform Bars */}
                        <div className="flex items-center gap-0.5 flex-1 h-6">
                          {[40, 65, 80, 50, 95, 30, 70, 85, 60, 45, 90, 75, 55, 35, 80, 60].map((height, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                isPlayingAudio && idx <= (audioProgress * 16) / 14
                                  ? 'bg-[#141414]'
                                  : 'bg-stone-300'
                              }`}
                              style={{
                                height: isPlayingAudio
                                  ? `${Math.max(25, (height + (Math.sin(idx + audioProgress) * 35)) % 100)}%`
                                  : `${height}%`,
                              }}
                            />
                          ))}
                        </div>

                        <span className="text-[11px] font-bold text-stone-500 shrink-0 font-mono">
                          {isPlayingAudio
                            ? `00:${String(Math.min(14, audioProgress)).padStart(2, '0')}`
                            : msg.voiceDuration || '00:14'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {/* Emoji reaction if any on left */}
                        {msg.emoji && (
                          <span className="w-6 h-6 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-xs">
                            {msg.emoji}
                          </span>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed font-medium shadow-xs max-w-[280px] ${
                            isMe
                              ? 'bg-[#D2E7FA] text-[#141414] rounded-tr-xs border border-blue-200/60'
                              : 'bg-white text-[#141414] rounded-tl-xs border border-stone-200/70'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-[10px] text-stone-400 font-semibold px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Chat Input Bar (Matching Screenshot) */}
            <div className="px-4 py-3 bg-white/95 backdrop-blur-2xl border-t border-stone-200/80 pb-[max(18px,env(safe-area-inset-bottom,16px))]">
              
              {/* Quick Suggestion Icebreakers */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {[
                  "Let's do 7:30 PM! 🍕",
                  "Street food first date is a sign ✨",
                  "I know the best taco spot downtown 🌮",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSendChatMessage(sug)}
                    className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition shrink-0 cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-stone-100 rounded-full px-4 py-2.5 flex items-center justify-between border border-stone-200/70 focus-within:border-amber-400 focus-within:bg-white transition">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="Type here"
                    className="flex-1 bg-transparent text-[14px] text-[#141414] placeholder:text-stone-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      hapticTap();
                      setIsRecordingAudio(!isRecordingAudio);
                      if (!isRecordingAudio) {
                        toast.success('🎙️ Recording voice note...');
                      } else {
                        toast.success('Voice note saved & ready to send');
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      isRecordingAudio ? 'bg-rose-500 text-white animate-pulse' : 'text-stone-500 hover:text-stone-800'
                    }`}
                    aria-label="Voice Note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {/* Vibrant Yellow Send Button with Paper Airplane Icon */}
                <button
                  type="button"
                  onClick={() => handleSendChatMessage()}
                  disabled={!chatInputText.trim() && !isRecordingAudio}
                  className="w-11 h-11 rounded-full bg-[#F5C344] hover:bg-[#ebbb38] text-[#141414] flex items-center justify-center shadow-md active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4 ml-0.5 fill-[#141414]" />
                </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#F7F6EB]" />}>
      <TripsContent />
    </Suspense>
  );
}
