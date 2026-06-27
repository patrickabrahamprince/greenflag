import { NextResponse } from 'next/server';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${NOMINATIM_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json`,
      { headers: { 'User-Agent': 'GreenFlagApp/1.0 (https://greenflag.app)' } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }

    const data = await res.json();
    const address = data.address || {};
    const parts = [
      address.city || address.town || address.village || address.county || address.city_district || address.suburb || address.municipality,
      address.state,
    ].filter(Boolean);
    const city = parts.join(', ');

    return NextResponse.json({ city, raw: data.display_name || null });
  } catch {
    return NextResponse.json({ error: 'Geocoding request failed' }, { status: 502 });
  }
}
