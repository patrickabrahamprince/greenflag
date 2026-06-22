import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;

export function useProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const persona = searchParams.get('role') || 'man';
  const isWoman = persona === 'woman';

  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [city, setCity] = useState('');
  const [cityAutoText, setCityAutoText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const max = isWoman ? 3 : 6;
    const remaining = max - photos.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPhotos([...photos, ...newPreviews]);
    setPhotoFiles([...photoFiles, ...newFiles]);
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photos[idx]);
    setPhotos(photos.filter((_, i) => i !== idx));
    setPhotoFiles(photoFiles.filter((_, i) => i !== idx));
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
        if (isWoman) {
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
    if (isWoman) {
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

    const uploadedUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const path = `${authUser.id}/${Date.now()}-${i}.jpg`;
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Failed to upload photo: ${error.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(data.path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const allPhotos = [...photos.filter(p => !p.startsWith('blob:')), ...uploadedUrls];

    const payload = {
      id: authUser.id,
      name: name.trim(),
      persona,
      photos: allPhotos,
      onboarding_completed: true,
      city_auto: isWoman ? (cityAutoText || city) : undefined,
      city: city,
      lat: isWoman ? lat : undefined,
      lng: isWoman ? lng : undefined,
      instagram_handle: isWoman ? undefined : instagramHandle.replace(/^@/, ''),
    };

    const { error } = await supabase.from('profiles').upsert(payload);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    router.replace('/onboard/interests');
  };

  return {
    isWoman,
    name, setName,
    photos, photoFiles,
    city, setCity,
    cityAutoText,
    instagramHandle, setInstagramHandle,
    gpsDetecting, gpsDenied,
    errors,
    loading,
    handlePhotoUpload,
    removePhoto,
    detectLocation,
    handleContinue,
    photoSlots: isWoman ? 3 : 6,
  };
}
