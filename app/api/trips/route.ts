import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import {
  getMemoryTrips,
  saveMemoryTrip,
  getMemoryRequestsByUser,
} from '@/lib/trips-data';
import { Trip, TripVibe } from '@/types';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination')?.trim().toLowerCase();
    const vibe = searchParams.get('vibe')?.trim();
    const femaleOnlyParam = searchParams.get('female_only');
    const isFemaleOnly = femaleOnlyParam === 'true';

    // Get current user persona for female-only protection
    let currentUserPersona = 'woman';
    if (user?.id) {
      try {
        const admin = getAdminClient();
        const { data: prof } = await admin
          .from('profiles')
          .select('persona')
          .eq('id', user.id)
          .single();
        if (prof?.persona) {
          currentUserPersona = prof.persona;
        }
      } catch {
        // Fallback gracefully
      }
    }

    // Try Supabase first
    try {
      const admin = getAdminClient();
      let query = admin
        .from('trips')
        .select(`
          id, host_id, destination, state, start_date, end_date, vibe,
          budget_per_day, spots_available, spots_total, female_only,
          description, stay_type, transport_type, status, created_at,
          host:profiles!trips_host_id_fkey(id, name, age, city, photos, persona, blur_key)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (destination && destination !== 'all') {
        query = query.ilike('destination', `%${destination}%`);
      }
      if (vibe && vibe !== 'all') {
        query = query.eq('vibe', vibe);
      }
      if (isFemaleOnly) {
        query = query.eq('female_only', true);
      }

      const { data: dbTrips, error: dbError } = await query;

      if (!dbError && dbTrips && dbTrips.length > 0) {
        // Enforce female_only safety: men cannot see female_only trips unless they are host
        const safeTrips = (dbTrips as unknown as Trip[]).filter((trip) => {
          if (!trip.female_only) return true;
          return currentUserPersona === 'woman' || trip.host_id === user?.id;
        });

        return NextResponse.json({ trips: safeTrips, source: 'supabase' });
      }
    } catch {
      // Fall through to resilient memory store
    }

    // Resilient memory store with filtering
    let memoryList = getMemoryTrips();

    if (destination && destination !== 'all') {
      memoryList = memoryList.filter((t) =>
        t.destination.toLowerCase().includes(destination)
      );
    }
    if (vibe && vibe !== 'all') {
      memoryList = memoryList.filter((t) => t.vibe.toLowerCase() === vibe.toLowerCase());
    }
    if (isFemaleOnly) {
      memoryList = memoryList.filter((t) => t.female_only);
    }

    // Enforce female-only rule
    memoryList = memoryList.filter((trip) => {
      if (!trip.female_only) return true;
      return currentUserPersona === 'woman' || (user?.id && trip.host_id === user.id);
    });

    // Check user request status if authenticated
    if (user?.id) {
      const userRequests = getMemoryRequestsByUser(user.id);
      const reqMap = new Map(userRequests.map((r) => [r.trip_id, r.status]));
      memoryList = memoryList.map((t) => ({
        ...t,
        user_request_status: reqMap.get(t.id) || null,
      }));
    }

    return NextResponse.json({ trips: memoryList, source: 'memory' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      destination,
      state = 'Karnataka',
      start_date,
      end_date,
      vibe = 'Chill',
      budget_per_day = 1500,
      spots_available = 1,
      spots_total = 2,
      female_only = false,
      description,
      stay_type = 'Hostel / Homestay',
      transport_type = 'Bike / Car Split',
    } = body;

    if (!destination || !start_date || !end_date || !description) {
      return NextResponse.json(
        { error: 'Missing required trip fields (destination, start_date, end_date, description)' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data: hostProfile } = await admin
      .from('profiles')
      .select('id, name, age, city, photos, persona, blur_key')
      .eq('id', user.id)
      .single();

    // Guard female-only trips creation
    if (female_only && hostProfile?.persona !== 'woman') {
      return NextResponse.json(
        { error: 'Female-only trips can only be hosted by verified female profiles.' },
        { status: 403 }
      );
    }

    const newTripId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      host_id: user.id,
      destination: destination.trim(),
      state: state.trim(),
      start_date,
      end_date,
      vibe: (vibe as TripVibe) || 'Chill',
      budget_per_day: Number(budget_per_day) || 1500,
      spots_available: Number(spots_available) || 1,
      spots_total: Number(spots_total) || 2,
      female_only: Boolean(female_only),
      description: description.trim(),
      stay_type,
      transport_type,
      status: 'active',
      created_at: new Date().toISOString(),
      host: hostProfile
        ? {
            id: hostProfile.id,
            name: hostProfile.name || 'Greenflag Traveler',
            age: hostProfile.age,
            city: hostProfile.city,
            photos: hostProfile.photos,
            persona: hostProfile.persona,
            verified: true,
          }
        : {
            id: user.id,
            name: 'Greenflag Traveler',
            city: 'Bangalore',
            persona: 'woman',
            verified: true,
          },
      requests_count: 0,
    };

    // Try saving to Supabase
    try {
      const { data: inserted, error: dbError } = await admin
        .from('trips')
        .insert({
          host_id: user.id,
          destination: newTrip.destination,
          state: newTrip.state,
          start_date: newTrip.start_date,
          end_date: newTrip.end_date,
          vibe: newTrip.vibe,
          budget_per_day: newTrip.budget_per_day,
          spots_available: newTrip.spots_available,
          spots_total: newTrip.spots_total,
          female_only: newTrip.female_only,
          description: newTrip.description,
          stay_type: newTrip.stay_type,
          transport_type: newTrip.transport_type,
        })
        .select()
        .single();

      if (!dbError && inserted) {
        return NextResponse.json({ trip: { ...newTrip, id: inserted.id }, success: true });
      }
    } catch {
      // Fall through to memory
    }

    // Save in memory store
    saveMemoryTrip(newTrip);

    return NextResponse.json({ trip: newTrip, success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
