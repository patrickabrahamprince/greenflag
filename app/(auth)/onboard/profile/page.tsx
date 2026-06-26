'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { PhotoUploadSlots } from '@/components/discovery/PhotoUploadSlots';
import { ProfileFormFields } from '@/components/discovery/ProfileFormFields';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const checkProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.provider === 'google') {
        setIsGoogleUser(true);
      }
    };
    checkProvider();
  }, [supabase]);

  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: '' }));

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

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name is required';
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) e.age = 'Must be 18-100';
    if (!city.trim()) e.city = 'City is required';
    if (photos.length < 1) e.photos = 'Upload at least 1 photo';
    if (bio.length > 200) e.bio = 'Max 200 characters';
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
      age: parseInt(age, 10),
      city: city.trim(),
      bio: bio.trim() || null,
      photos: uploadedUrls,
      persona: persona || 'man',
      onboarding_completed: true,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    router.push('/onboard/interests');
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6">
      <button
        onClick={() => router.push(isGoogleUser ? '/onboard' : '/onboard/phone')}
        className="text-[#8E8E93] hover:text-white transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-xl font-display font-semibold text-white text-center mb-6">
        {persona === 'woman' ? 'Set Your Standards' : 'Tell Us About Yourself'}
      </h1>

      <div className="space-y-5 flex-1 max-w-md mx-auto w-full">
        <ProfileFormFields
          name={name} age={age} city={city} bio={bio}
          errors={errors}
          onNameChange={(v) => { setName(v); clearError('name'); }}
          onAgeChange={(v) => { setAge(v); clearError('age'); }}
          onCityChange={(v) => { setCity(v); clearError('city'); }}
          onBioChange={(v) => { setBio(v); clearError('bio'); }}
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
