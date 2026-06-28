// /app/profile/edit/EditProfileForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUserStore } from '@/lib/store';
import { PhotoGrid } from '@/components/profile/PhotoGrid';
import type { Profile, Photo } from '@/types/profile';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

interface EditProfileFormProps {
  initialProfile: Profile;
}

export function EditProfileForm({ initialProfile }: EditProfileFormProps) {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const supabase = createClientComponentClient();

  const [name, setName] = useState(initialProfile.name || '');
  const [age, setAge] = useState(initialProfile.age || 18);
  const [city, setCity] = useState(initialProfile.city || CITIES[0]);
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [instagram, setInstagram] = useState(initialProfile.instagram_handle || '');
  const [photos, setPhotos] = useState<Photo[]>(initialProfile.photos || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (photos.length === 0) {
      toast.error('Please upload at least 1 photo before saving.');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          age,
          city,
          bio: bio.trim(),
          instagram_handle: instagram.trim(),
        })
        .eq('id', initialProfile.id);

      if (error) throw error;

      // Update local state store
      setUser({
        id: initialProfile.id,
        role: initialProfile.role,
        name: name.trim(),
        age,
        city,
        bio: bio.trim(),
        instagram_handle: instagram.trim(),
        photos: photos.map((p) => p.url),
      } as any);

      toast.success('Profile updated successfully!');
      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-[#F0EDE9] text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-['Playfair_Display'] text-xl italic font-bold text-[#1A1A1A]">
          Edit Profile
        </h1>
      </div>

      {/* Photo Uploader grid */}
      <PhotoGrid photos={photos} editable={true} onChange={setPhotos} />

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E8E6E1] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C9A961]"
            placeholder="Your Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-1.5">
              Age
            </label>
            <input
              type="number"
              value={age}
              min={18}
              max={60}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-[#E8E6E1] text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C9A961]"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-1.5">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#E8E6E1] text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#C9A961]"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-1.5">
            Instagram Handle (Optional)
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E8E6E1] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C9A961]"
            placeholder="e.g. instagram_username"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-1.5">
            Bio <span className="text-[10px] font-thin text-[#1A1A1A]/30">({bio.length}/120)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            className="w-full px-4 py-2.5 bg-white border border-[#E8E6E1] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C9A961] min-h-[100px] resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#C9A961] hover:bg-[#B89851] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4.5 h-4.5" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
