'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { PhotoUploadSlots } from '@/components/discovery/PhotoUploadSlots';
import { ProfileFormFields } from '@/components/discovery/ProfileFormFields';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.provider === 'google') {
        setIsGoogleUser(true);
      }
    };
    init();
    detectLocation();
  }, []);

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: '' }));

  // Real age from a birthdate, not a self-typed number -- a year off by
  // one either direction at the boundary would wrongly admit/reject
  // someone on their birthday, so this checks month/day too, not just
  // year subtraction.
  const computeAge = (dobStr: string): number | null => {
    if (!dobStr) return null;
    const birth = new Date(dobStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  };

  const handlePhotoAdd = (files: File[]) => {
    const remaining = 3 - photos.length;
    const newFiles = files.slice(0, remaining);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...previews]);
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    clearError('photos');
  };

  const handlePhotoRemove = (idx: number) => {
    URL.revokeObjectURL(photos[idx]);
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
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
            `/api/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          const address = data.address;
          if (!address) {
            setGpsDenied(true);
            return;
          }
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
            setCity(display);
            toast.success(`Location detected: ${display}`);
          } else {
            setGpsDenied(true);
          }
        } catch {
          setGpsDenied(true);
        } finally {
          setGpsDetecting(false);
        }
      },
      () => {
        setGpsDetecting(false);
        setGpsDenied(true);
      },
      { timeout: 10000 }
    );
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name is required';
    const ageNum = computeAge(dob);
    if (!dob || ageNum === null) e.dob = 'Date of birth is required';
    else if (ageNum < 18) e.dob = 'You must be 18 or older to use GreenFlag';
    else if (ageNum > 100) e.dob = 'Please enter a valid date of birth';
    if (!city.trim()) e.city = 'City is required';
    if (photos.length < 1) e.photos = 'Upload at least 1 photo';
    if (bio.length > 200) e.bio = 'Max 200 characters';
    if (!instagramHandle.trim()) e.instagram = 'Instagram handle is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const path = `${user.id}/${Date.now()}-${i}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Photo upload failed: ${error.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      dob,
      age: computeAge(dob),
      city: city.trim(),
      bio: bio.trim() || null,
      photos: uploadedUrls,
      persona: persona || 'man',
      instagram_url: instagramHandle ? `https://instagram.com/${instagramHandle.replace(/^@/, '')}` : null,
      lat: lat,
      lng: lng,
      onboarding_completed: true,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    router.push('/onboard/quiz');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6">
      <button
        onClick={() => router.push(isGoogleUser ? '/onboard' : '/onboard/phone')}
        className="text-ink/40 hover:text-ink transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-xl font-display font-semibold text-ink text-center mb-6">
        {persona === 'woman' ? 'Set Your Standards' : 'Tell Us About Yourself'}
      </h1>

      <div className="space-y-5 flex-1 max-w-md mx-auto w-full">
        <ProfileFormFields
          name={name} dob={dob} city={city} bio={bio}
          instagramHandle={instagramHandle}
          gpsDetecting={gpsDetecting} gpsDenied={gpsDenied}
          errors={errors}
          onNameChange={(v) => { setName(v); clearError('name'); }}
          onDobChange={(v) => { setDob(v); clearError('dob'); }}
          onCityChange={(v) => { setCity(v); clearError('city'); }}
          onBioChange={(v) => { setBio(v); clearError('bio'); }}
          onInstagramChange={(v) => { setInstagramHandle(v); clearError('instagram'); }}
          onDetectLocation={detectLocation}
        />

        <PhotoUploadSlots
          photos={photos}
          maxPhotos={3}
          onAdd={handlePhotoAdd}
          onRemove={handlePhotoRemove}
          error={errors.photos}
        />

        <button
          onClick={handleContinue}
          disabled={loading}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-profile' : undefined}
          className="btn-primary w-full mt-2 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
        </button>
      </div>
    </div>
  );
}
