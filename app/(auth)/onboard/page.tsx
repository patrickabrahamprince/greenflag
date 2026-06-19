'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/lib/store';
import { ArrowLeft, Venus, Mars, Upload, X, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

type Step = 'gender' | 'interested' | 'profile';
type Gender = 'woman' | 'man';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'You must be at least 18').max(60, 'Age must be 60 or under'),
  city: z.string().min(1, 'Please select a city'),
  bio: z.string().max(120, 'Bio must be 120 characters or less'),
  photos: z.array(z.string()).min(1, 'Please add at least 1 photo'),
});

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

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<Gender | null>(null);
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

    const role = gender === 'woman' ? 'host' : 'guest';

    const { error } = await supabase.from('profiles').upsert({
      id: authUser.id,
      name,
      age,
      city,
      bio,
      photos,
      role,
      gender,
      interested_in: interestedIn,
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
    } as any);

    toast.success('Profile created!');
    if (gender === 'woman') {
      router.replace('/your-standards/create');
    } else {
      router.replace('/discover');
    }
  };

  if (step === 'gender') {
    return (
      <div className="w-full animate-fade-in min-h-[80vh] flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-semibold text-white mb-3">
            Welcome to GreenFlag
          </h1>
          <p className="text-muted text-sm">First, tell us about yourself</p>
        </div>

        <div className="space-y-4 px-2">
          <button
            onClick={() => { setGender('woman'); setStep('interested'); }}
            className="w-full h-48 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Venus className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <span className="text-2xl font-display text-[#EDEADE]">I&apos;m a Woman</span>
              <span className="text-sm text-[#EDEADE]/60">I set the standards</span>
            </div>
          </button>

          <button
            onClick={() => { setGender('man'); setStep('interested'); }}
            className="w-full h-48 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mars className="w-8 h-8 text-white/80" />
              </div>
              <span className="text-2xl font-display text-[#EDEADE]">I&apos;m a Man</span>
              <span className="text-sm text-[#EDEADE]/60">I pursue standards</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'interested') {
    return (
      <div className="w-full animate-fade-in min-h-[80vh] flex flex-col justify-center">
        <div className="flex items-center mb-10">
          <button onClick={() => setStep('gender')} className="text-muted hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-muted uppercase tracking-wider">Step 2 of 3</p>
          </div>
          <div className="w-6" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-display font-semibold text-white mb-3">
            Who are you interested in?
          </h1>
          <p className="text-muted text-sm">This helps us show you the right people</p>
        </div>

        <div className="space-y-4 px-2">
          <button
            onClick={() => { setInterestedIn('woman'); setStep('profile'); }}
            className={`w-full h-40 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              interestedIn === 'woman'
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                interestedIn === 'woman' ? 'bg-[#D4AF37]/20' : 'bg-white/10'
              }`}>
                <Venus className={`w-8 h-8 ${interestedIn === 'woman' ? 'text-[#D4AF37]' : 'text-white/80'}`} />
              </div>
              <span className="text-xl font-display text-[#EDEADE]">Women</span>
            </div>
          </button>

          <button
            onClick={() => { setInterestedIn('man'); setStep('profile'); }}
            className={`w-full h-40 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              interestedIn === 'man'
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                interestedIn === 'man' ? 'bg-[#D4AF37]/20' : 'bg-white/10'
              }`}>
                <Mars className={`w-8 h-8 ${interestedIn === 'man' ? 'text-[#D4AF37]' : 'text-white/80'}`} />
              </div>
              <span className="text-xl font-display text-[#EDEADE]">Men</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button onClick={() => setStep('interested')} className="text-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">Step 3 of 3</p>
        </div>
        <div className="w-6" />
      </div>

      <h1 className="text-xl font-display font-semibold text-white text-center mb-6">
        Complete your profile
      </h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={`input ${errors.name ? 'input-error' : ''}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Age</label>
          <div className="flex items-center gap-3">
            <input type="range" min={18} max={60} value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="flex-1 accent-gold" />
            <span className="text-white font-medium text-sm w-8 text-center">{age}</span>
          </div>
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={`input ${errors.city ? 'input-error' : ''}`}>
            <option value="" className="bg-surface">Select your city</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c} className="bg-surface">{c}</option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={120} rows={3} className={`input resize-none ${errors.bio ? 'input-error' : ''}`} />
          <div className="flex justify-between mt-1">
            {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
            <p className="text-muted text-xs ml-auto">{bio.length}/120</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Photos <span className="text-muted">(1-6)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const photo = photos[i];
              return (
                <div key={i} className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden ${
                  photo ? 'border-transparent' : photos.length < 6 ? 'border-border hover:border-gold/30 cursor-pointer' : 'border-border opacity-50'
                }`} onClick={() => { if (!photo && photos.length < 6) addMockPhoto(); }}>
                  {photo ? (
                    <>
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); removePhoto(photo); }} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
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

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
}
