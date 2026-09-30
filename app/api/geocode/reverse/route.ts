import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&addressdetails=1`,
      { 
        headers: { 
          'User-Agent': 'GreenFlag/1.0 (contact: support@greenflag.app)',
          'Accept-Language': 'en'
        } 
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = 
        addr.suburb || 
        addr.neighbourhood || 
        addr.quarter || 
        addr.residential || 
        addr.city_district || 
        addr.city || 
        addr.town || 
        addr.village || 
        addr.county || 
        '';
      const city = addr.city || addr.town || addr.county || addr.state_district || 'Bengaluru';
      const state = addr.state || 'Karnataka';

      return NextResponse.json({ 
        address: addr,
        locality: locality || city,
        city: city,
        state: state,
        display_name: data.display_name || ''
      });
    }
  } catch {}

  // Fallback structure
  return NextResponse.json({ 
    locality: 'Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: { city: 'Bengaluru', state: 'Karnataka' }
  });
}
