'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { ArrowLeft, Crown, Target, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

type Step = 'role' | 'profile';
type Role = 'host' | 'guest';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'You must be at least 18').max(60, 'Age must be 60 or under'),
  city: z.string().min(1, 'Please select a city'),
  bio: z.string().max(120, 'Bio must be 120 characters or less'),
  photos: z.array(z.string()).min(3, 'Please add at least 3 photos'),
});

const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
];

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
];

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const addMockPhoto = () => {
    if (photos.length >= 6) return;
    const available = MOCK_PHOTOS.filter((p) => !photos.includes(p));
    if (available.length === 0) return;
    setPhotos([...photos, available[0]]);
  };

  const removePhoto = (url: string) => {
    setPhotos(photos.filter((p) => p !== url));
  };

  const handleSubmit = async () => {
    const result = profileSchema.safeParse({ name, age, city, bio, photos });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Session expired. Please log in again.');
      router.replace('/login');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: authUser.id,
      name,
      age,
      city,
      bio,
      photos,
      role,
    } as any);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setUser({
      id: authUser.id,
      name,
      age,
      city,
      bio,
      photos,
      role: role as 'host' | 'guest',
      created_at: new Date().toISOString(),
    });

    toast.success('Profile created!');
    if (role === 'host') {
      router.replace('/your-standards/create');
    } else {
      router.replace('/discover');
    }
  };

  if (step === 'role') {
    return (
      <div className="w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-semibold text-white mb-2">
            Join GreenFlag
          </h1>
          <p className="text-muted text-sm">
            Choose how you want to connect
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => { setRole('host'); setStep('profile'); }}
            className={`w-full card text-left hover:border-gold/30 transition-all ${
              role === 'host' ? 'border-gold' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Crown className="text-gold" size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">I set the Standards</h3>
                <p className="text-muted text-sm mt-1">
                  Create standards and invite others to meet them. You're in control.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setRole('guest'); setStep('profile'); }}
            className={`w-full card text-left hover:border-gold/30 transition-all ${
              role === 'guest' ? 'border-gold' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Target className="text-gold" size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">I meet Standards</h3>
                <p className="text-muted text-sm mt-1">
                  Find standards that resonate and show you can meet them.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setStep('role')}
          className="text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-display font-semibold text-white">
            Complete your profile
          </h1>
        </div>
        <div className="w-6" />
      </div>

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
          <label className="block text-sm font-medium text-white mb-1.5">Age</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={18}
              max={60}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="flex-1 accent-gold"
            />
            <span className="text-white font-medium text-sm w-8 text-center">{age}</span>
          </div>
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`input ${errors.city ? 'input-error' : ''}`}
          >
            <option value="" className="bg-surface">Select your city</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c} className="bg-surface">{c}</option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            maxLength={120}
            rows={3}
            className={`input resize-none ${errors.bio ? 'input-error' : ''}`}
          />
          <div className="flex justify-between mt-1">
            {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
            <p className="text-muted text-xs ml-auto">{bio.length}/120</p>
          </div>
        </div>

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
                  className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden ${
                    photo
                      ? 'border-transparent'
                      : photos.length < 6
                      ? 'border-border hover:border-gold/30 cursor-pointer'
                      : 'border-border opacity-50'
                  }`}
                  onClick={() => {
                    if (!photo && photos.length < 6) addMockPhoto();
                  }}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(photo); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
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
          {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}
