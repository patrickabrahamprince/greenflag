import { NextResponse } from 'next/server';

function unauthorized(req: Request) {
  const auth = req.headers.get('authorization');
  return auth !== `Bearer ${process.env.CRON_SECRET}`;
}

async function callEdgeFunction(name: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function GET(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vercel Hobby plan only allows one cron per day, so all daily jobs run
  // from this single consolidated endpoint instead of separate crons.
  //
  // This used to also call an `auto-approve` edge function, a leftover from
  // the pre-pivot host/builder/connections model — it queried `connections`
  // (guest_id/host_id), which was dropped in 20261206000012_drop_connections.sql,
  // so it 502'd every run. Expiry/refund/reminders for the matches/task-flow
  // model are handled independently by pg_cron directly in Postgres
  // (sweep_expired_matches, send_review_reminders — see
  // 20261213000003_review_deadline_sweep_cron.sql and
  // 20261213000004_review_reminder_cron.sql), so no equivalent call belongs
  // here.

  // monthly-bonus self-gates to only run on the 1st of the month in IST,
  // since this cron fires daily at 03:00 UTC (08:30 IST).
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const monthlyBonus = istNow.getUTCDate() === 1
    ? await callEdgeFunction('monthly-bonus')
    : { ok: true, skipped: true, reason: 'not_first_of_month_ist' };

  return NextResponse.json(
    { ok: monthlyBonus.ok, monthlyBonus },
    { status: monthlyBonus.ok ? 200 : 502 }
  );
}
