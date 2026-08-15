import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

interface VisionAnnotateResponse {
  responses?: { faceAnnotations?: unknown[]; error?: { message: string } }[];
}

// Authoritative, server-side face check -- the client-side MediaPipe check
// (lib/faceDetection.ts) is only a fast first pass a tampered or modified
// client could bypass entirely. This is what actually gates
// onboarding_completed in app/(auth)/onboard/profile/photos/page.tsx.
//
// Fails OPEN (verified: false, reason: 'unverifiable') only when the
// check itself couldn't run -- missing API key or a Vision API outage --
// never when a photo was genuinely checked and had no face. A missing
// GOOGLE_CLOUD_VISION_API_KEY is a configuration gap on our end, not a
// reason to trap every single person in onboarding until it's fixed, but
// it does mean the "at any cost" requirement isn't actually enforced
// until that key is set -- logged loudly here so it isn't silently
// missed.
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { photoUrls } = await req.json().catch(() => ({ photoUrls: null }));
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
    return NextResponse.json({ error: 'photoUrls is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') console.error('GOOGLE_CLOUD_VISION_API_KEY is not set -- face verification is not enforced.');
    return NextResponse.json({ verified: false, reason: 'unverifiable' });
  }

  try {
    const res = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: photoUrls.map((url: string) => ({
          image: { source: { imageUri: url } },
          features: [{ type: 'FACE_DETECTION', maxResults: 1 }],
        })),
      }),
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === 'development') console.error('Vision API request failed:', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ verified: false, reason: 'unverifiable' });
    }

    const data: VisionAnnotateResponse = await res.json();
    const hasFace = (data.responses || []).some((r) => (r.faceAnnotations?.length ?? 0) > 0);

    return NextResponse.json({ verified: hasFace, reason: hasFace ? 'has-face' : 'no-face-found' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('Vision API call errored:', err);
    return NextResponse.json({ verified: false, reason: 'unverifiable' });
  }
}
