import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const connections = [
    {
      id: 'conn-1',
      test_id: 's1',
      guest_id: 'guest-1',
      host_id: 'host-1',
      status: 'active',
      tasks_completed: 3,
      expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'conn-2',
      test_id: 's3',
      guest_id: 'guest-1',
      host_id: 'host-3',
      status: 'active',
      tasks_completed: 5,
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'conn-3',
      test_id: 's2',
      guest_id: 'guest-1',
      host_id: 'host-2',
      status: 'completed',
      tasks_completed: 8,
      expires_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filtered = status
    ? connections.filter((c) => c.status === status)
    : connections;

  return NextResponse.json({ connections: filtered });
}
