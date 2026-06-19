'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Search } from 'lucide-react';

interface MatchProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  city_auto?: string;
  interests: string[];
  looking_for_interests: string[];
  match_percent: number;
  distance_km: number;
  last_active?: string;
}

interface MatchesData {
  user: { id: string; name: string; gender: string; interests: string[] };
  matches: MatchProfile[];
  total: number;
}

export default function AdminMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}/matches`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="p-8 text-center">
        <Search className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
        <p className="text-[#8E8E93] text-sm">User not found</p>
        <button onClick={() => router.push('/admin/users')} className="btn-secondary text-xs mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => router.push('/admin/users')}
        className="flex items-center gap-2 text-[#8E8E93] hover:text-[#EDEADE] transition-colors mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <h1 className="text-2xl font-display text-[#EDEADE] mb-1">
        Matches for {data.user.name}
      </h1>
      <p className="text-sm text-[#8E8E93] mb-6">
        Gender: {data.user.gender} | Interests: {data.user.interests?.join(', ') || '(none)'} | Total matches: {data.total}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {match.photos?.[0] ? (
                  <img src={match.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg text-[#8E8E93]">{match.name?.[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-[#EDEADE] text-sm truncate">
                  {match.name}, {match.age}
                </div>
                <div className="text-sm font-bold text-green-400">
                  {match.match_percent}% Match
                </div>
              </div>
            </div>

            <div className="text-xs text-[#8E8E93] mb-2">Shared interests:</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(match.interests || []).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] rounded"
                >
                  {tag}
                </span>
              ))}
              {(!match.interests || match.interests.length === 0) && (
                <span className="text-[10px] text-[#5A5A5D]">None</span>
              )}
            </div>

            <div className="text-[10px] text-[#5A5A5D] font-mono">
              ID: {match.id.slice(0, 8)}... | {match.distance_km}km
            </div>
          </div>
        ))}
      </div>

      {data.matches.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
          <p className="text-[#8E8E93] text-sm">
            No matches found. Check if user onboarded + has interests set.
          </p>
        </div>
      )}
    </div>
  );
}
