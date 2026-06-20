'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Users, Loader2, MapPin } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface MatchProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  interests: string[];
  looking_for_interests: string[];
  match_percent: number;
  distance_km: number;
  last_active: string;
}

function ProfileCard({
  profile,
  onMeet,
  connecting,
}: {
  profile: MatchProfile;
  onMeet: () => void;
  connecting: boolean;
}) {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const photo = profile.photos?.[0] || '';
  const city = profile.city_auto || '';

  const handleMeet = () => {
    if (balance < 5) {
      toast.error('Not enough coins', {
        duration: 4000,
        style: { background: '#1C1C1E', color: '#fff', border: '1px solid #2A2A2E' },
      });
      router.push('/coins');
      return;
    }
    onMeet();
  };

  return (
    <div className="snap-center h-screen w-full relative flex flex-col">
      <div className="absolute inset-0 w-full h-full">
        <img src={photo} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
      </div>

      <div className="relative z-10 mt-auto w-full px-6 pb-32">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-display text-3xl text-[#EDEADE]">
            {profile.name}, {profile.age}
          </h1>
          <div className="flex items-center gap-1 bg-[#D4AF37]/20 backdrop-blur-md rounded-full px-2.5 py-1">
            <span className="text-[#D4AF37] text-xs font-bold">{profile.match_percent}%</span>
          </div>
        </div>

        {city && (
          <div className="flex items-center gap-1 text-[#EDEADE]/60 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city}</span>
            {profile.distance_km > 0 && <span>&middot; {profile.distance_km}km</span>}
          </div>
        )}

        {profile.job && (
          <p className="text-[#EDEADE]/70 text-sm mt-1">{profile.job}</p>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          {(profile.interests || []).slice(0, 5).map((interest) => {
            const isMatch = (profile.looking_for_interests || []).includes(interest);
            return (
              <span
                key={interest}
                className={`px-3 py-1 rounded-full text-xs border backdrop-blur-md ${
                  isMatch
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                    : 'border-white/20 bg-white/10 text-[#EDEADE]'
                }`}
              >
                {interest}
              </span>
            );
          })}
        </div>

        <button
          onClick={handleMeet}
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
            onClick={() => router.push(`/profile/${profile.id}`)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            View full profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const balance = useCoinStore((s) => s.balance);
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/discover?page=${pageNum}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProfiles((prev) => (pageNum === 0 ? data : [...prev, ...data]));
        if (data.length < 20) setHasMore(false);
      } else {
        if (pageNum === 0) setProfiles([]);
      }
    } catch {
      if (pageNum === 0) setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles(0);
  }, [fetchProfiles]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 0) fetchProfiles(page);
  }, [page, fetchProfiles]);

  const handleMeet = async (profileId: string, profileName: string) => {
    setConnectingId(profileId);
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: profileId }),
      });
      const data = await res.json();
      if (data.error === 'insufficient_funds') {
        toast.error('Not enough coins');
        router.push('/coins');
        return;
      }
      if (data.connection_id) {
        useCoinStore.getState().deduct(5);
        router.push(`/${profileName.toLowerCase()}`);
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#141414] flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-[#8E8E93]" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No one new right now.</h3>
          <p className="text-sm text-[#8E8E93]">Women who share your interests will appear here. Check back soon or expand your interests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-[#0A0A0A]">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => router.push('/coins')}
          className="flex items-center gap-1.5 bg-[#141414]/80 backdrop-blur-md rounded-full px-3 py-1.5"
        >
          <Coins className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-sm font-medium">{balance}</span>
        </button>
      </div>

      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onMeet={() => handleMeet(profile.id, profile.name)}
          connecting={connectingId === profile.id}
        />
      ))}

      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}
