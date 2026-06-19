'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

export default function EditProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age ?? 18);
  const [city, setCity] = useState(user?.city ?? CITIES[0]);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? ['', '', '', '', '', '']);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser({
      ...user!,
      name,
      age,
      city,
      bio,
      photos: photos.filter(Boolean),
    });
    toast.success('Profile updated');
    setSaving(false);
    router.push('/profile');
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
          <label className="text-sm text-muted mb-1.5 block">Photos</label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden"
              >
                {photo ? (
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted text-xs">+</span>
                )}
              </div>
            ))}
          </div>
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
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
