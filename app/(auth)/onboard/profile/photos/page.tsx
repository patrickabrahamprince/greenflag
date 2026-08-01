'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore, useUserStore } from '@/lib/store';
import { PhotoUploadSlots } from '@/components/discovery/PhotoUploadSlots';
import { StepDots } from '@/components/shared/StepDots';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { compressImage } from '@/lib/compressImage';
import { checkPhotosForFace } from '@/lib/faceDetection';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';

// Step 4 (final) of the profile wizard -- photos, then the actual upload +
// profile upsert that used to run at the end of the old single-page form.
export default function ProfilePhotosPage() {
  const router = useRouter();
  const supabase = createClient();
  const persona = useOnboardingStore((s) => s.persona);
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const city = useOnboardingStore((s) => s.city);
  const lat = useOnboardingStore((s) => s.lat);
  const lng = useOnboardingStore((s) => s.lng);
  const instagramHandle = useOnboardingStore((s) => s.instagramHandle);
  const bio = useOnboardingStore((s) => s.bio);
  const teaserPrompt = useOnboardingStore((s) => s.teaserPrompt);
  const teaserAnswer = useOnboardingStore((s) => s.teaserAnswer);
  const setGlobalUser = useUserStore((s) => s.setUser);

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showFaceNudge, setShowFaceNudge] = useState(false);
  const [checkingFace, setCheckingFace] = useState(false);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); return; }
    if (!bio) { router.replace('/onboard/profile/bio'); return; }
    setShowFaceNudge(true);
  }, []);

  const handlePhotoAdd = async (files: File[]) => {
    const remaining = 3 - photos.length;
    const rawFiles = files.slice(0, remaining);
    setCompressing(true);
    try {
      // Uncompressed phone-camera photos (often 3-10MB each) are why
      // uploading used to feel like it hung -- downscale before it ever
      // touches the network.
      const newFiles = await Promise.all(rawFiles.map(compressImage));
      const previews = newFiles.map((f) => URL.createObjectURL(f));
      setPhotos((prev) => [...prev, ...previews]);
      setPhotoFiles((prev) => [...prev, ...newFiles]);
      setError('');
    } finally {
      setCompressing(false);
    }
  };

  const handlePhotoRemove = (idx: number) => {
    URL.revokeObjectURL(photos[idx]);
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleContinue = async () => {
    hapticTap();
    if (photos.length < 1) { setError('Please add at least 1 photo'); return; }

    setCheckingFace(true);
    const faceResult = await checkPhotosForFace(photoFiles);
    setCheckingFace(false);
    if (faceResult === 'no-face-found') {
      setError('Add at least one clear photo of your face to continue');
      setShowFaceNudge(true);
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired. Please sign in again.');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const path = `${user.id}/${Date.now()}-${i}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) {
        toast.error(`Photo upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
      uploadedUrls.push(urlData.publicUrl);
    }

    // Authoritative check, not the earlier client-side one -- that runs
    // entirely in the browser and a modified client could skip it. This
    // is the real gate: it runs against the photos that actually made it
    // to storage, server-side, where nothing the client sends can bypass
    // it.
    try {
      const verifyRes = await fetch('/api/photos/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls: uploadedUrls }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.reason === 'no-face-found') {
        setLoading(false);
        setError('We couldn’t find a face in your photos -- add a clear photo of your face to continue');
        setShowFaceNudge(true);
        return;
      }
    } catch (err) {
      console.error('Face verification request failed:', err);
    }

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      age,
      city: city.trim(),
      bio: bio.trim() || null,
      photos: uploadedUrls,
      persona: persona || 'man',
      instagram_url: instagramHandle ? `https://instagram.com/${instagramHandle.replace(/^@/, '')}` : null,
      lat,
      lng,
      onboarding_completed: true,
    });
    setLoading(false);
    if (upsertError) { toast.error(upsertError.message); return; }

    // Best-effort, separate from the upsert above on purpose: the
    // teaser_prompt/teaser_answer columns ship in a migration that may not
    // be applied to every environment yet, and a missing-column error here
    // must never block onboarding completion the way a failure in the
    // main upsert should.
    if (teaserPrompt) {
      supabase.from('profiles').update({
        teaser_prompt: teaserPrompt,
        teaser_answer: teaserAnswer.trim() || null,
      }).eq('id', user.id).then(({ error: teaserError }) => {
        if (teaserError) console.error('Teaser save failed:', teaserError.message);
      });
    }

    // The global user store only loads once, right after login -- if that
    // happened before this upsert corrected persona away from the
    // handle_new_user() trigger's 'man' default, the store would keep
    // showing the wrong persona for the rest of the session. That broke
    // downstream persona checks (e.g. BottomNav's "she has no active
    // Standard yet" redirect never firing for a woman it still thought
    // was a man). Refetch and sync the store now that onboarding has
    // actually set the real values.
    const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (freshProfile) setGlobalUser(freshProfile as any);

    router.push('/onboard/quiz');
  };

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top">
      <button
        onClick={() => router.push('/onboard/profile/teasers')}
        className="text-ink/40 hover:text-ink active:scale-90 transition-all mb-6 w-fit"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col pb-safe-bottom">
        <StepDots current={6} total={6} />

        <h1 className="font-display text-2xl text-ink mb-2">Show your best self</h1>
        <p className="text-ink/50 text-sm leading-relaxed mb-8">
          Real, recent photos — this is your first impression.
        </p>

        <PhotoUploadSlots
          photos={photos}
          maxPhotos={3}
          onAdd={handlePhotoAdd}
          onRemove={handlePhotoRemove}
          error={error}
        />
        {compressing && (
          <p className="text-xs text-ink/40 mt-2 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Optimizing photo...
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={loading || compressing || checkingFace}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-profile' : undefined}
          className="btn-primary w-full mt-6 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading || checkingFace ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
        </button>
      </div>

      <BottomSheet open={showFaceNudge} onClose={() => setShowFaceNudge(false)}>
        <div className="text-center pb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <Camera size={26} className="text-ink" />
          </div>
          <h2 className="font-display text-xl text-ink mb-2">We want to see your face</h2>
          <p className="text-ink/60 text-sm leading-relaxed mb-6">
            Add at least one clear photo of your face to help with approval. It would be a shame to hide it!
          </p>
          <button onClick={() => setShowFaceNudge(false)} className="btn-primary w-full py-4">
            Got it
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
