'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Upload, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
];

const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const role = searchParams.get('role') || 'guest';
  const isHost = role === 'host';

  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [cityAutoText, setCityAutoText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const addMockPhoto = () => {
    const max = isHost ? 3 : 6;
    if (photos.length >= max) return;
    const available = MOCK_PHOTOS.filter((p) => !photos.includes(p));
    if (available.length === 0) return;
    setPhotos([...photos, available[0]]);
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsDetecting(true);
    setGpsDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          const address = data.address;
          const parts = [
            address.city || address.town || address.county,
            address.state,
          ].filter(Boolean);
          const detected = parts.join(', ');
          if (detected) {
            const match = INDIAN_CITIES.find(
              (c) => detected.toLowerCase().includes(c.toLowerCase())
            );
            const display = match || detected;
            setCityAutoText(display);
            setCity(match || detected);
            toast.success(`Location detected: ${display}`);
          } else {
            toast.error('Could not detect your city');
            setGpsDenied(true);
          }
        } catch {
          toast.error('Could not detect your city');
          setGpsDenied(true);
        } finally {
          setGpsDetecting(false);
        }
      },
      () => {
        setGpsDetecting(false);
        setGpsDenied(true);
        if (isHost) {
          toast.error('Location required to continue');
        } else {
          toast.error('Location access denied. Please select your city manually.');
        }
      },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name || name.trim().length < 2) newErrors.name = 'Name is required';
    if (isHost) {
      if (photos.length !== 3) newErrors.photos = 'Add exactly 3 photos';
      if (!city || gpsDenied) newErrors.city = 'Location is required. Enable GPS to continue.';
    } else {
      if (photos.length < 3) newErrors.photos = 'Add at least 3 photos';
      if (!city) newErrors.city = 'City is required';
      if (!instagramHandle || !INSTAGRAM_REGEX.test(instagramHandle)) {
        newErrors.instagram = 'Valid Instagram handle is required (@optional, letters, numbers, ., _)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Session expired');
      router.replace('/login');
      return;
    }

    const payload: Record<string, unknown> = {
      id: authUser.id,
      name: name.trim(),
      role,
      photos,
    };

    if (isHost) {
      payload.city_auto = cityAutoText || city;
      payload.city = city;
      payload.lat = lat;
      payload.lng = lng;
    } else {
      payload.city = city;
      payload.instagram_handle = instagramHandle.replace(/^@/, '');
    }

    const { error } = await supabase.from('profiles').upsert(payload as any);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (isHost) {
      router.replace('/onboard/interests');
    } else {
      router.replace('/onboard/interests');
    }
  };

  const photoSlots = isHost ? 3 : 6;

  return (
    <div className="w-full animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button onClick={() => router.replace('/onboard')} className="text-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">
            {isHost ? 'Set Your Standards' : 'Meet the Standards'}
          </p>
        </div>
        <div className="w-6" />
      </div>

      <h1 className="text-xl font-display font-semibold text-white text-center mb-6">
        {isHost ? 'Create Your Profile' : 'Tell Us About Yourself'}
      </h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={`input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Photos {isHost ? '(3 required)' : '(3-6 required)'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: photoSlots }).map((_, i) => {
              const photo = photos[i];
              const canAdd = isHost ? photos.length < 3 : photos.length < 6;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                    photo
                      ? 'border-transparent'
                      : canAdd
                      ? 'border-white/10 hover:border-gold/30 cursor-pointer'
                      : 'border-white/10 opacity-50'
                  }`}
                  onClick={() => { if (!photo && canAdd) addMockPhoto(); }}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(photo); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <Upload size={20} className="text-muted" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-1">{photos.length}/{photoSlots} photos</p>
          {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
        </div>

        {isHost ? (
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Location</label>
            <button
              onClick={detectLocation}
              disabled={gpsDetecting}
              className="btn-secondary w-full mb-2 flex items-center justify-center gap-2 active:scale-95"
            >
              <MapPin size={16} />
              {gpsDetecting ? 'Detecting...' : 'Auto-detect location'}
            </button>
            {cityAutoText && (
              <input
                type="text"
                value={cityAutoText}
                disabled
                className="input text-muted"
              />
            )}
            {gpsDenied && !cityAutoText && (
              <p className="text-red-500 text-xs mt-1">Location required to continue</p>
            )}
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`input ${errors.city ? 'input-error' : ''}`}
              >
                <option value="">Select your city</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Instagram Handle <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-muted text-sm">@</span>
                </div>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/[^a-zA-Z0-9._@]/g, '').slice(0, 30))}
                  placeholder="username"
                  className={`input pl-8 ${errors.instagram ? 'input-error' : ''}`}
                />
              </div>
              {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
            </div>
          </>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="btn-primary w-full mt-2 active:scale-95"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  );
}
