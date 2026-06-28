import { NextResponse } from 'next/server';

function unauthorized(req: Request) {
  const auth = req.headers.get('authorization');
  return auth !== `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (unauthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-approve`;
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
