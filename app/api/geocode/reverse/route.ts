import { NextResponse } from 'next/server';

// Nominatim's usage policy requires a real identifying User-Agent and blocks
// requests that lack one -- browsers refuse to let client-side fetch() set a
// custom User-Agent, so a direct client call silently fails/rate-limits.
// Proxying through our own server, which can set the header, fixes it.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json`,
      { headers: { 'User-Agent': 'GreenFlag/1.0 (contact: support@greenflag.app)' } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ address: data.address || null });
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }
}
