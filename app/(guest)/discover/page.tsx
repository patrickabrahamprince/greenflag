'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Users, Loader2 } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  name: string;
  age: number;
  city?: string;
  city_auto?: string;
  photos: string[];
  interests: string[];
  active_test_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MOCK_PROFILES: Profile[] = [
  { id: '1', name: 'Priya', age: 28, city: 'Mumbai', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop'], interests: ['Reading', 'Wine', 'Travel'], active_test_id: 's1', difficulty: 'medium' },
  { id: '2', name: 'Ananya', age: 26, city: 'Delhi', photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'], interests: ['Yoga', 'Photography', 'Music'], active_test_id: 's2', difficulty: 'hard' },
  { id: '3', name: 'Riya', age: 27, city: 'Bangalore', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'], interests: ['Music', 'Art', 'Cooking'], active_test_id: 's3', difficulty: 'easy' },
  { id: '4', name: 'Neha', age: 29, city: 'Pune', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'], interests: ['Running', 'Coffee'], active_test_id: 's4', difficulty: 'medium' },
  { id: '5', name: 'Kavya', age: 25, city: 'Hyderabad', photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'], interests: ['Dance', 'Travel', 'Books'], active_test_id: 's5', difficulty: 'medium' },
  { id: '6', name: 'Ishita', age: 30, city: 'Chennai', photos: ['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop'], interests: ['Music', 'Wine'], active_test_id: 's6', difficulty: 'hard' },
];

function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const [connecting, setConnecting] = useState(false);
  const [blurred, setBlurred] = useState(true);

  const photo = profile.photos?.[0] || '';
  const city = profile.city || profile.city_auto || '';

  const handleBegin = async () => {
    if (balance < 5) {
      toast.error('Not enough coins', {
        duration: 4000,
        style: { background: '#1C1C1E', color: '#fff', border: '1px solid #2A2A2E' },
      });
      router.push('/coins');
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: profile.active_test_id }),
      });
      const data = await res.json();
      if (data.error === 'insufficient_funds') {
        toast.error('Not enough coins', {
          duration: 4000,
          style: { background: '#1C1C1E', color: '#fff', border: '1px solid #2A2A2E' },
        });
        router.push('/coins');
        return;
      }
      if (data.id) {
        useCoinStore.getState().deduct(5);
        router.push(`/${profile.name.toLowerCase()}`);
      } else {
        toast.error('Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="snap-center h-screen w-full relative flex flex-col">
      <div className="absolute inset-0 w-full h-full">
        <img src={photo} alt={profile.name} className="w-full h-full object-cover" />
        {blurred && (
          <div className="absolute inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center">
            <span className="text-8xl font-display text-white/20 select-none">?</span>
          </div>
        )}
        <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
      </div>

      <div className="relative z-10 mt-auto w-full px-6 pb-32">
        <h1 className="font-display text-3xl text-[#EDEADE]">{profile.name}, {profile.age}</h1>
        {city && (
          <p className="text-[#EDEADE]/60 text-sm mt-1">{city}</p>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          {((profile as any).about_me_tags || profile.interests || []).slice(0, 3).map((interest: string) => (
            <span key={interest} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EDEADE] text-xs">
              {interest}
            </span>
          ))}
        </div>

        <button
          onClick={handleBegin}
          disabled={connecting}
          className="w-full max-w-sm mx-auto mt-6 h-14 rounded-full bg-[#D4AF37] text-[#0A0A0A] font-medium active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {connecting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</>
          ) : (
            'Meet Her Standard'
          )}
        </button>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setBlurred(!blurred)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            {blurred ? 'Tap to reveal' : 'Blur profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);

  useEffect(() => {
    fetch('/api/discover')
      .then((r) => r.json())
      .then((data) => {
        if (data?.hosts?.length) setProfiles(data.hosts);
      })
      .catch(() => {});
  }, []);

  if (!profiles.length) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#141414] flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-[#8E8E93]" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No one new right now.</h3>
          <p className="text-sm text-[#8E8E93]">Check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-[#0A0A0A]">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.push('/coins')}
          className="flex items-center gap-1.5 bg-[#141414]/80 backdrop-blur-md rounded-full px-3 py-1.5"
        >
          <Coins className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-sm font-medium">{balance}</span>
        </button>
      </div>

      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
