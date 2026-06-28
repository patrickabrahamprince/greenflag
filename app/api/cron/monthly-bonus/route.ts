import { NextResponse } from 'next/server';

function unauthorized(req: Request) {
  const auth = req.headers.get('authorization');
  return auth !== `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vercel cron is UTC-only; this job is scheduled daily near IST midnight,
  // so we gate here to only forward on the 1st of the month in IST.
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  if (istNow.getUTCDate() !== 1) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'not_first_of_month_ist' });
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/monthly-bonus`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, data }, { status: res.ok ? 200 : 502 });
}
