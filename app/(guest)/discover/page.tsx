'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Users, Loader2, MapPin } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { useUserStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface MatchProfile {
  id: string; name: string; age: number; photos: string[]; bio?: string; job?: string; height?: string;
  city_auto?: string; interests: string[]; looking_for_interests: string[]; match_percent: number; distance_km: number; last_active: string;
}

function MatchArc({ percent }: { percent: number }) {
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="match-arc">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle className="match-arc-bg" cx="22" cy="22" r={r} />
        <circle
          className="match-arc-fill"
          cx="22" cy="22" r={r}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="match-arc-text">{percent}</span>
    </div>
  );
}

function ProfileCard({ profile, onMeet, connecting }: { profile: MatchProfile; onMeet: () => void; connecting: boolean }) {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const photo = profile.photos?.[0] || '';
  const city = profile.city_auto || '';

  const handleMeet = () => {
    if (balance < 5) {
      toast.error('Not enough coins', { duration: 4000, style: { background: '#111111', color: '#fff', border: '1px solid #1E1E1E' } });
      router.push('/coins');
      return;
    }
    onMeet();
  };

  return (
    <div className="snap-center h-screen w-full relative flex flex-col">
      <div className="absolute inset-0 w-full h-full">
        <img src={photo} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.5) 40%, transparent 70%)' }} />
      </div>
      <div className="relative z-10 mt-auto w-full px-6 pb-32">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h1 className="font-display italic text-[28px] text-white leading-tight" style={{ fontWeight: 500 }}>
              {profile.name}<span className="text-white/60 text-2xl">, {profile.age}</span>
            </h1>
            {city && (
              <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" /><span className="font-thin">{city}</span>
                {profile.distance_km > 0 && <span className="font-thin">&middot; {profile.distance_km}km</span>}
              </div>
            )}
          </div>
          <MatchArc percent={profile.match_percent} />
        </div>
        {profile.job && <p className="text-white/60 text-sm font-thin mt-1">{profile.job}</p>}
        <div className="hairline my-4" />
        <div className="flex gap-2 flex-wrap">
          {(profile.interests || []).slice(0, 5).map((interest) => {
            const isMatch = (profile.looking_for_interests || []).includes(interest);
            return (
              <span key={interest} className={`px-3 py-1 rounded-full text-xs backdrop-blur-md ${isMatch ? 'border border-gold/30 bg-gold/10 text-gold' : 'border border-white/10 bg-white/5 text-white/70'}`}>
                {interest}
              </span>
            );
          })}
        </div>
        <button onClick={handleMeet} disabled={connecting}
          className="btn-primary w-full max-w-sm mx-auto mt-6 h-14 flex items-center justify-center gap-2 text-sm tracking-wide">
          {connecting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Starting...</>) : ('Meet Her Standard')}
        </button>
        <div className="mt-4 flex justify-center">
          <button onClick={() => router.push(`/profile/${profile.id}`)} className="text-xs text-white/30 hover:text-white/50 transition-colors font-thin">View full profile</button>
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
      } else { if (pageNum === 0) setProfiles([]); }
    } catch { if (pageNum === 0) setProfiles([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfiles(0); }, [fetchProfiles]);
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setPage((p) => p + 1); }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading]);
  useEffect(() => { if (page > 0) fetchProfiles(page); }, [page, fetchProfiles]);

  const handleMeet = async (profileId: string, profileName: string) => {
    setConnectingId(profileId);
    try {
      const res = await fetch('/api/connections/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host_id: profileId }) });
      const data = await res.json();
      if (data.error === 'insufficient_funds') { toast.error('Not enough coins'); router.push('/coins'); return; }
      if (data.connection_id) { useCoinStore.getState().deduct(5); router.push(`/${profileName.toLowerCase()}`); } else { toast.error(data.error || 'Something went wrong'); }
    } catch { toast.error('Something went wrong'); } finally { setConnectingId(null); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center" style={{ background: '#080808' }}><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>;
  if (!profiles.length) return (
    <div className="h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="text-center px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#111111' }}><Users className="w-6 h-6 text-muted" /></div>
        <h3 className="text-lg font-display italic text-white mb-2">No one new right now.</h3>
        <p className="text-sm text-muted font-thin">Women who share your interests will appear here.</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll" style={{ background: '#080808' }}>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button onClick={() => router.push('/coins')} className="flex items-center gap-1.5 backdrop-blur-md rounded-full px-3 py-1.5" style={{ background: 'rgba(17,17,17,0.8)', border: '1px solid rgba(30,30,30,0.5)' }}>
          <Coins className="w-4 h-4 text-gold" /><span className="text-gold text-sm font-medium">{balance}</span>
        </button>
      </div>
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} onMeet={() => handleMeet(profile.id, profile.name)} connecting={connectingId === profile.id} />
      ))}
      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}
