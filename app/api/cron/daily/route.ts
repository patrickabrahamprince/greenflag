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
  const expireConnections = await callEdgeFunction('expire-connections');
  const autoApprove = await callEdgeFunction('auto-approve');

  // monthly-bonus self-gates to only run on the 1st of the month in IST,
  // since this cron fires daily at 03:00 UTC (08:30 IST).
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const monthlyBonus = istNow.getUTCDate() === 1
    ? await callEdgeFunction('monthly-bonus')
    : { ok: true, skipped: true, reason: 'not_first_of_month_ist' };

  const allOk = expireConnections.ok && autoApprove.ok && monthlyBonus.ok;

  return NextResponse.json(
    { ok: allOk, expireConnections, autoApprove, monthlyBonus },
    { status: allOk ? 200 : 502 }
  );
}
