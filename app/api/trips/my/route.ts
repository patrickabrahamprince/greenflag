import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import {
  getMemoryTrips,
  getMemoryRequestsForTrip,
  getMemoryRequestsByUser,
  getMemoryTripById,
} from '@/lib/trips-data';
import { Trip, TripRequest } from '@/types';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try Supabase first
    try {
      const admin = getAdminClient();
      const { data: hostedTrips } = await admin
        .from('trips')
        .select(`
          *,
          requests:trip_requests(
            id, applicant_id, status, intro_note, created_at,
            applicant:profiles!trip_requests_applicant_id_fkey(id, name, age, city, photos, persona)
          )
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      const { data: joinedRequests } = await admin
        .from('trip_requests')
        .select(`
          id, trip_id, status, intro_note, created_at,
          trip:trips!trip_requests_trip_id_fkey(
            id, host_id, destination, state, start_date, end_date, vibe,
            budget_per_day, spots_available, spots_total, female_only, description,
            host:profiles!trips_host_id_fkey(id, name, age, city, photos, persona)
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (hostedTrips || joinedRequests) {
        return NextResponse.json({
          hosted: hostedTrips ?? [],
          requests: joinedRequests ?? [],
          source: 'supabase',
        });
      }
    } catch {
      // Fall through to memory
    }

    // Memory fallback
    const allTrips = getMemoryTrips();
    const hosted = allTrips
      .filter((t) => t.host_id === user.id)
      .map((t) => ({
        ...t,
        requests: getMemoryRequestsForTrip(t.id),
      }));

    const userRequests = getMemoryRequestsByUser(user.id).map((r) => ({
      ...r,
      trip: getMemoryTripById(r.trip_id),
    }));

    return NextResponse.json({
      hosted,
      requests: userRequests,
      source: 'memory',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
