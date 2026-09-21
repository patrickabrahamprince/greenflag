// lib/trips-data.ts
import { Trip, TripRequest } from '@/types';

export const POPULAR_DESTINATIONS = [
  { name: 'Coorg', state: 'Karnataka', tag: 'Coffee & Treks', distance: '240 km from Bangalore', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gokarna', state: 'Karnataka', tag: 'Beaches & Cliff Hikes', distance: '480 km from Bangalore', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chikmagalur', state: 'Karnataka', tag: 'Mullayanagiri Peak', distance: '245 km from Bangalore', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hampi', state: 'Karnataka', tag: 'Boulder Sunsets & Ruins', distance: '340 km from Bangalore', image: 'https://images.unsplash.com/photo-1600100397608-f010f443b740?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ooty', state: 'Tamil Nadu', tag: 'Nilgiri Tea Estates', distance: '270 km from Bangalore', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pondicherry', state: 'Tamil Nadu', tag: 'French Colony & Cafes', distance: '310 km from Bangalore', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },
  { name: 'Wayanad', state: 'Kerala', tag: 'Waterfalls & Caves', distance: '275 km from Bangalore', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
];

export const INITIAL_CURATED_TRIPS: Trip[] = [
  {
    id: 'seed-trip-1',
    host_id: 'seed-host-ananya',
    destination: 'Coorg',
    state: 'Karnataka',
    start_date: '2026-09-28',
    end_date: '2026-09-29',
    vibe: 'Trek',
    budget_per_day: 1800,
    spots_available: 1,
    spots_total: 2,
    female_only: false,
    stay_type: 'Plantation Homestay',
    transport_type: 'Royal Enfield 350 Split',
    description: 'Planning a scenic ride up to Abbey Falls and a morning sunrise hike up Mandalpatti. Splitting fuel and a beautiful heritage coffee estate homestay. Early risers and non-smokers preferred!',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    host: {
      id: 'seed-host-ananya',
      name: 'Ananya Sharma',
      age: 24,
      city: 'Bangalore (Indiranagar)',
      persona: 'woman',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80']
    },
    requests_count: 2
  },
  {
    id: 'seed-trip-2',
    host_id: 'seed-host-rohit',
    destination: 'Gokarna',
    state: 'Karnataka',
    start_date: '2026-10-02',
    end_date: '2026-10-05',
    vibe: 'Chill',
    budget_per_day: 1400,
    spots_available: 2,
    spots_total: 3,
    female_only: false,
    stay_type: 'Kudle Beach Hostel',
    transport_type: 'Self-Drive SUV',
    description: 'Taking advantage of the long weekend for 5-beach cliff trek (Paradise to Om beach), cafe hopping, and sunset acoustic sessions. Renting an SUV from Koramangala, looking for 2 chill companions.',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    host: {
      id: 'seed-host-rohit',
      name: 'Rohit Verma',
      age: 27,
      city: 'Bangalore (Koramangala)',
      persona: 'man',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80']
    },
    requests_count: 3
  },
  {
    id: 'seed-trip-3',
    host_id: 'seed-host-sneha',
    destination: 'Hampi',
    state: 'Karnataka',
    start_date: '2026-10-09',
    end_date: '2026-10-11',
    vibe: 'Backpacking',
    budget_per_day: 1200,
    spots_available: 1,
    spots_total: 2,
    female_only: true,
    stay_type: 'Hippie Island Guesthouse',
    transport_type: 'Overnight Sleeper Train',
    description: 'Exploring boulder ruins, sunset at Matanga Hill, cycling through Vijayanagara temples, and bouldering. Strictly female-only travel buddy. Love photography & cafe conversations.',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    host: {
      id: 'seed-host-sneha',
      name: 'Sneha Kulkarni',
      age: 25,
      city: 'Bangalore (HSR Layout)',
      persona: 'woman',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80']
    },
    requests_count: 1
  },
  {
    id: 'seed-trip-4',
    host_id: 'seed-host-karthik',
    destination: 'Chikmagalur',
    state: 'Karnataka',
    start_date: '2026-10-16',
    end_date: '2026-10-18',
    vibe: 'Roadtrip',
    budget_per_day: 2000,
    spots_available: 1,
    spots_total: 2,
    female_only: false,
    stay_type: 'Hillview Estate Homestay',
    transport_type: 'Himalayan 450 Ride',
    description: 'Riding up to Mullayanagiri and Baba Budangiri peaks for early misty views, followed by estate coffee tasting. Need 1 pillion or co-rider. Helmets & riding gear mandatory!',
    status: 'active',
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    host: {
      id: 'seed-host-karthik',
      name: 'Karthik Rao',
      age: 26,
      city: 'Bangalore (Jayanagar)',
      persona: 'man',
      verified: true,
      photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80']
    },
    requests_count: 0
  }
];

// In-memory / server cache storage for instant interactive response
const memoryTrips = new Map<string, Trip>();
const memoryRequests = new Map<string, TripRequest>();

// Initialize memory store with seed data
INITIAL_CURATED_TRIPS.forEach((trip) => memoryTrips.set(trip.id, trip));

export function getMemoryTrips(): Trip[] {
  return Array.from(memoryTrips.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getMemoryTripById(id: string): Trip | undefined {
  return memoryTrips.get(id);
}

export function saveMemoryTrip(trip: Trip): Trip {
  memoryTrips.set(trip.id, trip);
  return trip;
}

export function saveMemoryRequest(request: TripRequest): TripRequest {
  memoryRequests.set(request.id, request);
  const trip = memoryTrips.get(request.trip_id);
  if (trip) {
    trip.requests_count = (trip.requests_count || 0) + 1;
  }
  return request;
}

export function getMemoryRequestsForTrip(tripId: string): TripRequest[] {
  return Array.from(memoryRequests.values()).filter((r) => r.trip_id === tripId);
}

export function getMemoryRequestsByUser(userId: string): TripRequest[] {
  return Array.from(memoryRequests.values()).filter((r) => r.applicant_id === userId);
}

export function updateMemoryRequestStatus(requestId: string, status: 'accepted' | 'declined'): TripRequest | undefined {
  const req = memoryRequests.get(requestId);
  if (!req) return undefined;
  req.status = status;
  if (status === 'accepted') {
    const trip = memoryTrips.get(req.trip_id);
    if (trip && trip.spots_available > 0) {
      trip.spots_available -= 1;
    }
  }
  return req;
}
