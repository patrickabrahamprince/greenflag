'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, deleteFile } from '@/lib/supabase/storage';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

export default function EditProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const supabase = createClient();

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age ?? 18);
  const [city, setCity] = useState(user?.city ?? CITIES[0]);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? []);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhotoSelect = async (idx: number, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingIdx(idx);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error('Not authenticated');
      setUploadingIdx(null);
      return;
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const path = `${authUser.id}/${idx}.${fileExt}`;

    const { url, error } = await uploadFile('profile-photos', path, file);

    if (error) {
      toast.error('Upload failed: ' + error);
      setUploadingIdx(null);
      return;
    }

    const newPhotos = [...photos];
    newPhotos[idx] = url!;
    setPhotos(newPhotos);
    setUploadingIdx(null);
    toast.success('Photo uploaded');
  };

  const handleRemovePhoto = async (idx: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(idx, 1);
    setPhotos(newPhotos);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          age,
          city,
          bio,
          photos: photos.filter(Boolean),
        })
        .eq('id', user!.id);

      if (error) {
        toast.error('Failed to save: ' + error.message);
        return;
      }

      setUser({
        ...user!,
        name,
        age,
        city,
        bio,
        photos: photos.filter(Boolean),
      });
      toast.success('Profile updated');
      router.push('/profile');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display flex-1">Edit Profile</h1>
      </div>

      <div className="space-y-5 px-4">
        <div>
          <label className="text-sm text-muted mb-1.5 block">Photos (up to 3)</label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative">
                <div
                  className="aspect-square rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden"
                  onClick={() => !photos[i] && fileInputRefs.current[i]?.click()}
                >
                  {photos[i] ? (
                    <>
                      <img src={photos[i]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(i);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : uploadingIdx === i ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted" />
                  )}
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoSelect(i, e.target.files?.[0] || null)}
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-1">First photo is your main profile picture</p>
        </div>

        <div>
          <label className="text-sm text-muted mb-1.5 block">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm text-muted mb-1.5 block">Age</label>
          <input
            type="number"
            className="input"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            min={18}
            max={60}
          />
        </div>

        <div>
          <label className="text-sm text-muted mb-1.5 block">City</label>
          <select
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-muted mb-1.5 block">
            Bio <span className="text-muted/60">({bio.length}/120)</span>
          </label>
          <textarea
            className="input min-h-[100px] resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploadingIdx !== null}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}
