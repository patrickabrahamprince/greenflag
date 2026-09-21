import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getMemoryTripById, saveMemoryRequest } from '@/lib/trips-data';
import { TripRequest } from '@/types';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await props.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const introNote = body.intro_note?.trim() || '';

    const admin = getAdminClient();
    const { data: applicantProfile } = await admin
      .from('profiles')
      .select('id, name, age, city, photos, persona')
      .eq('id', user.id)
      .single();

    // Check DB trip first
    try {
      const { data: trip } = await admin
        .from('trips')
        .select('id, host_id, female_only, spots_available')
        .eq('id', tripId)
        .single();

      if (trip) {
        if (trip.host_id === user.id) {
          return NextResponse.json({ error: 'You are the host of this trip.' }, { status: 400 });
        }
        if (trip.female_only && applicantProfile?.persona !== 'woman') {
          return NextResponse.json(
            { error: 'This trip is designated female-only by the host.' },
            { status: 403 }
          );
        }

        const { data: request, error: reqError } = await admin
          .from('trip_requests')
          .insert({
            trip_id: tripId,
            applicant_id: user.id,
            status: 'pending',
            intro_note: introNote,
          })
          .select()
          .single();

        if (!reqError && request) {
          return NextResponse.json({ success: true, request });
        }
      }
    } catch {
      // Fall through to memory
    }

    // Memory trip check
    const memTrip = getMemoryTripById(tripId);
    if (!memTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (memTrip.host_id === user.id) {
      return NextResponse.json({ error: 'You are the host of this trip.' }, { status: 400 });
    }

    if (memTrip.female_only && applicantProfile?.persona === 'man') {
      return NextResponse.json(
        { error: 'This trip is designated female-only by the host.' },
        { status: 403 }
      );
    }

    const newRequest: TripRequest = {
      id: `req-${Date.now()}`,
      trip_id: tripId,
      applicant_id: user.id,
      status: 'pending',
      intro_note: introNote,
      created_at: new Date().toISOString(),
      applicant: applicantProfile
        ? {
            id: applicantProfile.id,
            name: applicantProfile.name || 'Traveler',
            age: applicantProfile.age,
            city: applicantProfile.city,
            photos: applicantProfile.photos,
            persona: applicantProfile.persona,
            verified: true,
          }
        : {
            id: user.id,
            name: 'Traveler',
            city: 'Bangalore',
            persona: 'woman',
            verified: true,
          },
    };

    saveMemoryRequest(newRequest);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
