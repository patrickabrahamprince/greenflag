'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore, useUserStore } from '@/lib/store';
import { PhotoUploadSlots } from '@/components/discovery/PhotoUploadSlots';
import { StepDots } from '@/components/shared/StepDots';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { compressImage } from '@/lib/compressImage';
import { checkPhotosForFace } from '@/lib/faceDetection';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const REQUIRED_PHOTOS = 3;
const UPLOAD_TIMEOUT_MS = 15000;
const MAX_UPLOAD_ATTEMPTS = 3;


// A stalled storage upload (flaky mobile connection, a dropped socket)
// used to just sit there -- no timeout meant the only outcomes were "it
// eventually finishes" or "the person gives up after 40+ seconds staring
// at a spinner with no idea anything's wrong." Racing each attempt
// against a timeout turns a silent hang into a fast, visible failure
// that retries on its own before ever bothering the user with an error.
async function uploadPhotoWithRetry(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt++) {
    try {
      const result = await Promise.race([
        supabase.storage.from(bucket).upload(path, file, { upsert: true }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Upload timed out')), UPLOAD_TIMEOUT_MS)
        ),
      ]);
      if (result.error) throw result.error;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(result.data.path);
      return urlData.publicUrl;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Upload failed');
}

// Step 4 (final) of the profile wizard -- photos, then the actual upload +
// profile upsert that used to run at the end of the old single-page form.
export default function ProfilePhotosPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
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
  const clearOnboarding = useOnboardingStore((s) => s.clearOnboarding);

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showFaceNudge, setShowFaceNudge] = useState(false);
  const [checkingFace, setCheckingFace] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  useEffect(() => {
    if (!name) { router.replace('/onboard/name'); return; }
    if (!age) { router.replace('/onboard/profile'); return; }
    if (!city) { router.replace('/onboard/profile/location'); return; }
    if (!bio) { router.replace('/onboard/profile/bio'); return; }
    setShowFaceNudge(true);
    router.prefetch('/onboard/quiz');
  }, []);

  const handlePhotoAdd = async (files: File[]) => {
    const remaining = REQUIRED_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const rawFiles = files.slice(0, remaining);
    if (rawFiles.length === 0) return;
    setCompressing(true);
    setError('');
    try {
      // Compress each file with fallback if compression fails
      const newFiles = await Promise.all(
        rawFiles.map((f) => compressImage(f).catch(() => f))
      );

      const previews = newFiles.map((f) => URL.createObjectURL(f));
      setPhotos((prev) => [...prev, ...previews]);
      setPhotoFiles((prev) => [...prev, ...newFiles]);
      setError('');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Error adding photo:', err);
      setError('Could not process photo. Please try another image.');
    } finally {
      setCompressing(false);
    }
  };

  const handlePhotoRemove = (idx: number) => {
    URL.revokeObjectURL(photos[idx]);
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePhotoReorder = (fromIdx: number, toIdx: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setPhotoFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleContinue = async () => {
    hapticTap();
    if (photos.length < REQUIRED_PHOTOS) {
      setError(`Add ${REQUIRED_PHOTOS - photos.length} more photo${REQUIRED_PHOTOS - photos.length === 1 ? '' : 's'} to continue`);
      return;
    }

    setCheckingFace(true);
    const faceResult = await checkPhotosForFace(photoFiles);
    setCheckingFace(false);
    if (faceResult === 'no-face-found') {
      setError('Add at least one clear photo of your face to continue');
      setShowFaceNudge(true);
      return;
    }

    setLoading(true);
    setUploadedCount(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired. Please sign in again.');
      router.replace('/onboard/phone');
      setLoading(false);
      return;
    }

    // Uploaded in parallel, not one-at-a-time -- with 3 required photos,
    // sequential awaits meant 3 full network round-trips stacked back to
    // back, which is what made this step feel slow even after
    // compressImage() already shrank each file. Promise.all still
    // preserves photo order in the result regardless of which upload
    // actually finishes first. Each attempt races a timeout and retries
    // on its own (see uploadPhotoWithRetry) instead of hanging silently.
    let uploadedUrls: string[];
    try {
      uploadedUrls = await Promise.all(
        photoFiles.map(async (file, i) => {
          const path = `${user.id}/${Date.now()}-${i}.jpg`;
          const url = await uploadPhotoWithRetry(supabase, 'avatars', path, file);
          setUploadedCount((prev) => prev + 1);
          return url;
        })
      );
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Please check your connection and try again.';
      toast.error(`Photo upload failed: ${message}`);
      setLoading(false);
      return;
    }

    // Authoritative check, not the earlier client-side one -- that runs
    // entirely in the browser and a modified client could skip it. This
    // is the real gate: it runs against the photos that actually made it
    // to storage, server-side, where nothing the client sends can bypass
    // it. Aborted after a timeout -- a slow/hanging Vision API call
    // shouldn't leave someone staring at "Finishing up..." indefinitely;
    // the route already fails open (verified: false, unverifiable) on
    // its own errors, this just guarantees the request doesn't hang
    // longer than that fallback is worth waiting for.
    try {
      const verifyController = new AbortController();
      const verifyTimeout = setTimeout(() => verifyController.abort(), 12000);
      const verifyRes = await fetch('/api/photos/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls: uploadedUrls }),
        signal: verifyController.signal,
      });
      clearTimeout(verifyTimeout);
      const verifyData = await verifyRes.json();
      if (verifyData.reason === 'no-face-found') {
        setLoading(false);
        setError('We couldn’t find a face in your photos -- add a clear photo of your face to continue');
        setShowFaceNudge(true);
        return;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Face verification request failed:', err);
    }

    const { data: existingProf } = await supabase.from('profiles').select('persona').eq('id', user.id).single();
    const resolvedPersona = persona || existingProf?.persona || 'woman';

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      age,
      city: city.trim(),
      bio: bio.trim() || null,
      photos: uploadedUrls,
      persona: resolvedPersona,
      instagram_url: instagramHandle ? `https://instagram.com/${instagramHandle.replace(/^@/, '')}` : null,
      lat,
      lng,
      onboarding_completed: resolvedPersona === 'man',
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
        if (teaserError && process.env.NODE_ENV === 'development') console.error('Teaser save failed:', teaserError.message);
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

    goTo('/onboard/quiz', '/onboarding/hero.jpg');
  };

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/hero.jpg" />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/onboard/profile/teasers')}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full">
        <StepDots current={6} total={6} />
      </div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col pb-4 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-7 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 font-bold text-xl">
            ✨
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">Show your best self</h1>
          <p className="text-stone-600 text-sm leading-relaxed font-medium mb-6">
            Real, recent photos — this is your first impression when joining or hosting adventures.
          </p>

          <PhotoUploadSlots
            photos={photos}
            maxPhotos={REQUIRED_PHOTOS}
            onAdd={handlePhotoAdd}
            onRemove={handlePhotoRemove}
            onReorder={handlePhotoReorder}
            error={error}
          />
          {compressing && (
            <p className="text-xs text-emerald-800 font-semibold mt-2 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing photo...
            </p>
          )}

          <button
            onClick={handleContinue}
            disabled={loading || compressing || checkingFace}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'submit-profile' : undefined}
            className="btn-primary w-full mt-6 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
          >
            {checkingFace ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking photos...
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadedCount < photoFiles.length
                  ? `Uploading ${uploadedCount}/${photoFiles.length}...`
                  : 'Finishing up...'}
              </>
            ) : (
              <>
                Save & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <BottomSheet open={showFaceNudge} onClose={() => setShowFaceNudge(false)}>
        <div className="text-center pb-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Camera size={30} className="text-emerald-800" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#382A21] mb-2">Clear Face Photo Required</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium">
            To keep our travel community safe and verify all members, please make sure at least one photo shows your face clearly.
          </p>
          <button onClick={() => setShowFaceNudge(false)} className="btn-primary w-full py-4 shadow-lg">
            Got it, let&apos;s upload
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
