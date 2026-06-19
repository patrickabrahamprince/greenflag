import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    pending_photos: 12,
    active_connections: 47,
    banned_users: 6,
    revenue_mtd: 12450,
    dau: 245,
    mau: 1892,
    conversion_rate: 23,
    completion_rate: 67,
    arpu: 48,
    signups_30d: [
      8, 12, 5, 18, 10, 22, 15, 9, 14, 20,
      11, 7, 16, 13, 19, 6, 21, 17, 4, 23,
      12, 8, 15, 10, 18, 14, 20, 11, 16, 9,
    ],
    revenue_30d: [
      1200, 1800, 900, 2100, 1500, 2400, 1900, 1300, 1700, 2200,
      1400, 1100, 2000, 1600, 2300, 1000, 2500, 1800, 1200, 1900,
      2100, 1500, 1700, 2400, 1300, 2000, 1600, 2200, 1400, 1800,
    ],
    user_distribution: {
      hosts: 28,
      guests: 52,
    },
    recent_activity: [
      { action: 'New connection created', time: '2 min ago' },
      { action: 'Photo approved', time: '15 min ago' },
      { action: 'New user registered', time: '1 hour ago' },
      { action: 'Payment received ₹299', time: '2 hours ago' },
    ],
  });
}
