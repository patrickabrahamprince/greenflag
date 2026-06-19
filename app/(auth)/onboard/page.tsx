'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { INTERESTS_MASTER } from '@/lib/constants/interests';
import { ArrowLeft, Crown, Crosshair, Upload, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

type Role = 'host' | 'guest';
type Step = 'role' | 'profile';

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

const INSTAGRAM_REGEX = /^[a-zA-Z0-9._]{1,30}$/;

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  bio: z.string().max(120, 'Bio must be 120 characters or less').optional(),
  photos: z.array(z.string()).min(3, 'Add at least 3 photos').max(6, 'Maximum 6 photos'),
  city: z.string().min(1, 'City is required'),
  yourInterests: z.array(z.string()).min(3, 'Pick at least 3 interests').max(5),
  lookingFor: z.array(z.string()).min(3, 'Pick at least 3').max(5),
});

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [yourInterests, setYourInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMockPhoto = () => {
    if (photos.length >= 6) return;
    const available = MOCK_PHOTOS.filter((p) => !photos.includes(p));
    if (available.length === 0) return;
    setPhotos([...photos, available[0]]);
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  const toggleYourInterest = (interest: string) => {
    setYourInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 5) return prev;
      return [...prev, interest];
    });
  };

  const toggleLookingFor = (interest: string) => {
    setLookingFor((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 5) return prev;
      return [...prev, interest];
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          const address = data.address;
          const detected = address.city || address.town || address.county || address.state;
          if (detected) {
            const match = INDIAN_CITIES.find(
              (c) => detected.toLowerCase().includes(c.toLowerCase())
            );
            setCity(match || detected);
            toast.success(`Location detected: ${match || detected}`);
          } else {
            toast.error('Could not detect your city. Please select manually.');
          }
        } catch {
          toast.error('Could not detect your city. Please select manually.');
        } finally {
          setGpsDetecting(false);
        }
      },
      () => {
        setGpsDetecting(false);
        toast.error('Location access denied. Please select your city manually.');
      },
      { timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const result = profileSchema.safeParse({
      name,
      bio,
      photos,
      city,
      yourInterests,
      lookingFor,
    });

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!newErrors[path]) newErrors[path] = err.message;
      });
    }

    if (!isHost && (!instagramHandle || !INSTAGRAM_REGEX.test(instagramHandle))) {
      newErrors.instagram = 'Valid Instagram handle is required (letters, numbers, ., _)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Session expired. Please log in again.');
      router.replace('/login');
      return;
    }

    const payload: Record<string, unknown> = {
      id: authUser.id,
      name: name.trim(),
      city,
      bio: bio.trim(),
      photos,
      role,
      gender: isHost ? 'woman' : 'man',
      your_interests: yourInterests,
      looking_for_interests: lookingFor,
    };

    if (!isHost) {
      payload.instagram_handle = instagramHandle;
    }

    const { error } = await supabase.from('profiles').upsert(payload as any);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setUser({
      id: authUser.id,
      name: name.trim(),
      age: 25,
      city,
      bio: bio.trim(),
      photos,
      role,
      created_at: new Date().toISOString(),
    } as any);

    toast.success('Profile created!');
    if (isHost) {
      router.replace('/your-standards/create');
    } else {
      router.replace('/discover');
    }
  };

  if (step === 'role') {
    return (
      <div className="w-full animate-fade-in min-h-[80vh] flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-semibold text-white mb-3">
            Welcome to GreenFlag
          </h1>
          <p className="text-muted text-sm">Choose your path</p>
        </div>

        <div className="space-y-4 px-2">
          <button
            onClick={() => { setRole('host'); setStep('profile'); }}
            className="w-full h-48 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden group active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <span className="text-2xl font-display text-[#EDEADE]">I Set the Standards</span>
              <span className="text-sm text-[#EDEADE]/60">Host — I know what I want</span>
            </div>
          </button>

          <button
            onClick={() => { setRole('guest'); setStep('profile'); }}
            className="w-full h-48 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden group active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crosshair className="w-8 h-8 text-white/80" />
              </div>
              <span className="text-2xl font-display text-[#EDEADE]">I Meet Standards</span>
              <span className="text-sm text-[#EDEADE]/60">Guest — I rise to the challenge</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const isHost = role === 'host';

  return (
    <div className="w-full animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button onClick={() => { setStep('role'); setRole(null); }} className="text-muted hover:text-white transition-colors">
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

        {!isHost && (
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
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Photos <span className="text-muted">(3-6 required)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const photo = photos[i];
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                    photo
                      ? 'border-transparent'
                      : photos.length < 6
                      ? 'border-white/10 hover:border-gold/30 cursor-pointer'
                      : 'border-white/10 opacity-50'
                  }`}
                  onClick={() => { if (!photo && photos.length < 6) addMockPhoto(); }}
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
          <p className="text-xs text-muted mt-1">{photos.length}/6 photos</p>
          {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
        </div>

        {isHost && (
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
        )}

        {!isHost && (
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
                onChange={(e) => setInstagramHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, '').slice(0, 30))}
                placeholder="username"
                className={`input pl-8 ${errors.instagram ? 'input-error' : ''}`}
              />
            </div>
            {errors.instagram && <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Your Interests</label>
          <p className="text-xs text-muted mb-3">Pick what you love. Min 3, Max 5.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_MASTER.map((interest) => {
              const selected = yourInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleYourInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                    selected
                      ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                      : 'border border-white/10 bg-transparent text-muted hover:text-white'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          {errors.yourInterests && <p className="text-red-500 text-xs mt-1">{errors.yourInterests}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            {isHost ? "You're looking for someone who likes..." : "You're interested in women who like..."}
          </label>
          <p className="text-xs text-muted mb-3">Min 3, Max 5.</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_MASTER.map((interest) => {
              const selected = lookingFor.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleLookingFor(interest)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95 ${
                    selected
                      ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                      : 'border border-white/10 bg-transparent text-muted hover:text-white'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
          {errors.lookingFor && <p className="text-red-500 text-xs mt-1">{errors.lookingFor}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            placeholder="Tell us about yourself..."
            rows={3}
            className={`input resize-none ${errors.bio ? 'input-error' : ''}`}
          />
          <div className="flex justify-between mt-1">
            {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
            <p className="text-muted text-xs ml-auto">{bio.length}/120</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full mt-2 active:scale-95"
        >
          {loading ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}
