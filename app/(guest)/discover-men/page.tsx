'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2, MapPin } from 'lucide-react';
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
}: {
  profile: MatchProfile;
}) {
  const router = useRouter();
  const photo = profile.photos?.[0] || '';
  const city = profile.city_auto || '';

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
          onClick={() => router.push(`/profile/${profile.id}`)}
          className="w-full max-w-sm mx-auto mt-6 h-14 rounded-full border border-white/20 bg-white/5 text-[#EDEADE] font-medium backdrop-blur-md active:scale-95 transition-all duration-200"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default function DiscoverMenPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchProfiles = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/discover-men?page=${pageNum}`);
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
          <h3 className="text-lg font-medium text-white mb-2">No matches yet.</h3>
          <p className="text-sm text-[#8E8E93]">We&apos;ll notify you when men who value your standards join.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-[#0A0A0A]">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}

      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}
