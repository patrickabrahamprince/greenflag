'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Sparkles, Users } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MockHost {
  id: string;
  name: string;
  age: number;
  city: string;
  photos: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  standardId: string;
}

const MOCK_HOSTS: MockHost[] = [
  {
    id: '1',
    name: 'Priya',
    age: 28,
    city: 'Mumbai',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop'],
    difficulty: 'medium',
    standardId: 's1',
  },
  {
    id: '2',
    name: 'Ananya',
    age: 26,
    city: 'Delhi',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'],
    difficulty: 'hard',
    standardId: 's2',
  },
  {
    id: '3',
    name: 'Riya',
    age: 27,
    city: 'Bangalore',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'],
    difficulty: 'easy',
    standardId: 's3',
  },
  {
    id: '4',
    name: 'Neha',
    age: 29,
    city: 'Pune',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'],
    difficulty: 'medium',
    standardId: 's4',
  },
  {
    id: '5',
    name: 'Kavya',
    age: 25,
    city: 'Hyderabad',
    photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'],
    difficulty: 'medium',
    standardId: 's5',
  },
  {
    id: '6',
    name: 'Ishita',
    age: 30,
    city: 'Chennai',
    photos: ['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop'],
    difficulty: 'hard',
    standardId: 's6',
  },
];

function DifficultyDots({ level }: { level: MockHost['difficulty'] }) {
  const dotCount = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={cn(
            'text-xs leading-none',
            dot <= dotCount ? 'text-gold' : 'text-muted/40'
          )}
        >
          ●
        </span>
      ))}
    </div>
  );
}

function HostCard({ host }: { host: MockHost }) {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const deduct = useCoinStore((s) => s.deduct);
  const [connecting, setConnecting] = useState(false);

  const handleMeetStandard = async () => {
    if (balance < 100) {
      router.push('/coins');
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: host.standardId }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data?.error?.includes('balance')) {
          router.push('/coins');
          return;
        }
        return;
      }
      deduct(100);
      const data = await res.json();
      router.push(`/${host.name.toLowerCase()}`);
    } catch {
      deduct(100);
      router.push(`/${host.name.toLowerCase()}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="card p-0 overflow-hidden animate-fade-in">
      <div
        className="relative h-[320px] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${host.photos[0]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-display text-white/20 select-none">?</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-lg font-display text-white">
            {host.name}, {host.age}
          </h3>
          <p className="text-xs text-muted mt-0.5">{host.city}</p>
          <div className="flex items-center justify-between mt-2">
            <DifficultyDots level={host.difficulty} />
            <button
              onClick={handleMeetStandard}
              disabled={connecting}
              className="text-xs bg-gold text-black font-medium rounded-lg px-3 py-1.5 transition-all duration-300 ease-out hover:bg-gold-light active:scale-[0.98] disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Meet Her Standard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-app mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-display text-white">Discover</h1>
          <button
            onClick={() => router.push('/coins')}
            className="flex items-center gap-1.5 bg-surface rounded-full px-3 py-1.5 transition-all duration-300 ease-out hover:bg-surface-light active:scale-[0.98]"
          >
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">{balance}</span>
          </button>
        </div>

        {MOCK_HOSTS.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-24">
            {MOCK_HOSTS.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No one new right now.</h3>
            <p className="empty-state-text">Check back later for new connections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
