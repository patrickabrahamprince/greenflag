'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X, Camera, Clock, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, deleteFile } from '@/lib/supabase/storage';
import { compressImage } from '@/lib/compressImage';
import { EducationBanner } from '@/components/shared/EducationBanner';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

export default function EditProfilePage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const supabase = createClient();

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age ?? 18);
  const [city, setCity] = useState(user?.city ?? CITIES[0]);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? []);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{ created_at: string } | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch('/api/profile/edit-request')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPendingRequest(data?.pendingRequest || null))
      .catch((err) => { if (process.env.NODE_ENV === 'development') console.error('Failed to load pending edit request:', err); })
      .finally(() => setCheckingPending(false));
  }, []);

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

    // Same 3:4 center-crop + downscale every other upload path in the app
    // goes through (onboarding, task submissions) -- without it, a photo
    // replaced here kept its original aspect ratio while everything
    // uploaded during onboarding was already cropped consistently, so
    // edited photos stood out as a different shape/zoom next to the rest.
    const compressed = await compressImage(file);
    const path = `${authUser.id}/${idx}.jpg`;

    const { url, error } = await uploadFile('profile-photos', path, compressed);

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
      const res = await fetch('/api/profile/edit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, city, bio, photos: photos.filter(Boolean) }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit changes');
        if (res.status === 409) setPendingRequest({ created_at: new Date().toISOString() });
        return;
      }

      toast.success('Submitted for review');
      router.push('/profile');
    } catch {
      toast.error('Failed to submit changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <button onClick={() => router.back()} aria-label="Back" className="p-2 -ml-2 text-ink active:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display flex-1">Edit Profile</h1>
      </div>

      <div className="px-4">
        <EducationBanner
          id="profile-setup"
          title="Complete Your Profile"
          description="The better your profile, the better your matches. Add clear photos and a genuine bio so people know who you really are."
        />
      </div>

      {pendingRequest && (
        <div className="mx-4 mb-2 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-3">
          <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-ink/80 leading-relaxed">
            You have a change request awaiting review. You can submit a new one once it's been reviewed.
          </p>
        </div>
      )}

      <fieldset disabled={!!pendingRequest || checkingPending} className="space-y-5 px-4 disabled:opacity-50">
        <div>
          <label className="text-sm text-muted mb-1.5 block">Photos (up to 3)</label>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative">
                {/* Filled photos get a solid tile; empty slots get a
                    dashed border instead, per the design system's
                    "dashed + slots" pattern for add-photo targets. */}
                <div
                  className={
                    photos[i]
                      ? 'aspect-square rounded-tile bg-well flex items-center justify-center overflow-hidden cursor-pointer relative group'
                      : 'aspect-square rounded-tile bg-transparent border-2 border-dashed border-lavender/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gold active:scale-95 transition-all'
                  }
                  onClick={() => fileInputRefs.current[i]?.click()}
                >
                  {photos[i] ? (
                    <>
                      <Image src={photos[i]} alt="" width={120} height={120} className="w-full h-full object-cover" onError={() => {}} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(i);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-[#D2042D] rounded-full flex items-center justify-center shadow-md active:scale-90"
                      >
                        <X className="w-3 h-3 text-ink" />
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
                  onChange={(e) => {
                    handlePhotoSelect(i, e.target.files?.[0] || null);
                    e.target.value = '';
                  }}
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            className="input"
            value={age || ''}
            onChange={(e) => setAge(Number(e.target.value.replace(/\D/g, '')) || 0)}
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
            About You <span className="text-muted/60">({bio.length}/120)</span>
          </label>
          <textarea
            className="input min-h-[100px] resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 120))}
            placeholder="A few words that define you..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploadingIdx !== null}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <><Save className="w-4 h-4" /> Submit for Review</>
          )}
        </button>
      </fieldset>

      {/* Lifestyle/Basics/Anthem live on their own screen and save
          instantly -- unlike the fields above, they're low-stakes
          metadata, not identity claims, so they skip the review queue
          entirely (see /profile/edit/details). */}
      <div className="px-4 mt-3">
        <button
          onClick={() => router.push('/profile/edit/details')}
          className="w-full flex items-center gap-3 px-4 py-4 bg-raised border border-raised rounded-2xl text-left active:scale-[0.98] transition-transform"
        >
          <Sparkles className="w-4 h-4 text-gold shrink-0" />
          <span className="flex-1 text-sm text-ink font-medium">More About You</span>
          <ChevronRight className="w-4 h-4 text-ink/40 shrink-0" />
        </button>
      </div>
    </div>
  );
}
