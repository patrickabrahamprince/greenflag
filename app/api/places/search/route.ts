import { NextResponse } from 'next/server';

interface PlaceResult {
  id: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  lat?: number;
  lng?: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const googleApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_API_KEY;

  // 1. Try Google Places Autocomplete API if key is present
  if (googleApiKey) {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${googleApiKey}&types=geocode|establishment&components=country:in`;

      const gRes = await fetch(googleUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === 'OK' && Array.isArray(gData.predictions)) {
          const results: PlaceResult[] = gData.predictions.slice(0, 6).map((p: any) => ({
            id: p.place_id,
            mainText: p.structured_formatting?.main_text || p.description.split(',')[0],
            secondaryText: p.structured_formatting?.secondary_text || p.description.split(',').slice(1).join(',').trim(),
            fullText: p.description,
          }));
          return NextResponse.json({ results });
        }
      }
    } catch {
      // Fallback to OpenStreetMap/Nominatim below
    }
  }

  // 2. OpenStreetMap Nominatim Live Search Fallback
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=6&countrycodes=in`;

    const res = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'GreenFlagApp/1.0 (https://greenflag.app)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const results: PlaceResult[] = data.map((item: any) => {
          const addr = item.address || {};
          const main =
            item.name ||
            addr.amenity ||
            addr.leisure ||
            addr.tourism ||
            addr.road ||
            addr.suburb ||
            addr.neighbourhood ||
            item.display_name.split(',')[0];

          const parts = [
            addr.suburb || addr.neighbourhood,
            addr.city || addr.town || addr.county || addr.state_district,
            addr.state,
          ].filter(Boolean);

          const secondary = parts.filter((p) => p !== main).join(', ') || 'India';

          return {
            id: String(item.place_id || item.osm_id || Math.random()),
            mainText: main,
            secondaryText: secondary,
            fullText: `${main}${secondary ? `, ${secondary}` : ''}`,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });

        return NextResponse.json({ results });
      }
    }
  } catch {
    // Return empty results on error
  }

  return NextResponse.json({ results: [] });
}
