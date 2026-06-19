import { NextResponse } from 'next/server';

export async function GET() {
  const profile = {
    id: 'mock-user-id',
    name: 'Guest User',
    age: 24,
    city: 'Mumbai',
    bio: 'Looking for meaningful connections through shared standards.',
    photos: [],
    role: 'guest',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    wallet: {
      balance: 100,
    },
  };

  return NextResponse.json({ profile });
}
