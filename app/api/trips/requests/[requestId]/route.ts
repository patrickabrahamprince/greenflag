import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { updateMemoryRequestStatus } from '@/lib/trips-data';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await props.params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be accepted or declined.' }, { status: 400 });
    }

    // Try Supabase first
    try {
      const admin = getAdminClient();
      const { data: request, error: reqError } = await admin
        .from('trip_requests')
        .select('*, trip:trips!trip_requests_trip_id_fkey(*)')
        .eq('id', requestId)
        .single();

      if (!reqError && request) {
        if (request.trip?.host_id !== user.id) {
          return NextResponse.json({ error: 'Only the host can manage requests.' }, { status: 403 });
        }

        const { data: updated, error: updateError } = await admin
          .from('trip_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', requestId)
          .select()
          .single();

        if (!updateError && updated) {
          if (status === 'accepted') {
            if (request.trip?.spots_available > 0) {
              await admin
                .from('trips')
                .update({ spots_available: request.trip.spots_available - 1 })
                .eq('id', request.trip_id);
            }

            try {
              const u1 = user.id < request.applicant_id ? user.id : request.applicant_id;
              const u2 = user.id < request.applicant_id ? request.applicant_id : user.id;
              await admin.from('matches').upsert({
                user1_id: u1,
                user2_id: u2,
                chat_unlocked: true,
                status: 'completed',
              }, { onConflict: 'user1_id,user2_id' });

              await admin.from('notifications').insert({
                user_id: request.applicant_id,
                title: 'Trip Request Accepted! 🎉',
                body: `You are in for ${request.trip?.destination || 'the trip'}! Chat is now unlocked to coordinate details.`,
                type: 'trip',
                link: '/messages',
                read: false,
              });
            } catch (matchErr) {
              console.error('Error unlocking trip chat:', matchErr);
            }
          }

          return NextResponse.json({ success: true, request: updated });
        }
      }
    } catch {
      // Fall through to memory
    }

    // Update memory store
    const updatedMem = updateMemoryRequestStatus(requestId, status as 'accepted' | 'declined');
    if (!updatedMem) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updatedMem });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
