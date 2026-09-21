import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { getMemoryTripById, getMemoryRequestsByUser } from '@/lib/trips-data';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Try Supabase first
    try {
      const admin = getAdminClient();
      const { data: trip, error } = await admin
        .from('trips')
        .select(`
          id, host_id, destination, state, start_date, end_date, vibe,
          budget_per_day, spots_available, spots_total, female_only,
          description, stay_type, transport_type, status, created_at,
          host:profiles!trips_host_id_fkey(id, name, age, city, photos, persona, blur_key)
        `)
        .eq('id', id)
        .single();

      if (!error && trip) {
        let userRequestStatus = null;
        if (user?.id) {
          const { data: reqData } = await admin
            .from('trip_requests')
            .select('status')
            .eq('trip_id', id)
            .eq('applicant_id', user.id)
            .maybeSingle();
          if (reqData) userRequestStatus = reqData.status;
        }

        return NextResponse.json({
          trip: {
            ...trip,
            user_request_status: userRequestStatus,
          },
        });
      }
    } catch {
      // Fall through to memory
    }

    // Memory store fallback
    const memTrip = getMemoryTripById(id);
    if (!memTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    let userRequestStatus = null;
    if (user?.id) {
      const requests = getMemoryRequestsByUser(user.id);
      const matched = requests.find((r) => r.trip_id === id);
      if (matched) userRequestStatus = matched.status;
    }

    return NextResponse.json({
      trip: {
        ...memTrip,
        user_request_status: userRequestStatus,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
