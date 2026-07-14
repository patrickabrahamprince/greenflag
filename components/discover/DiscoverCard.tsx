'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface DiscoverProfile {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  photos: string[];
  common_interests: number;
}

interface DiscoverCardProps {
  profile: DiscoverProfile;
  onSwipe: () => void;
}

export function DiscoverCard({ profile, onSwipe }: DiscoverCardProps) {
  const router = useRouter();
  const photo = profile.photos?.[0];

  const handleView = () => {
    onSwipe();
    router.push(`/standard/${profile.id}`);
  };

  return (
    <div data-testid="woman-card" className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: photo ? `url(${photo})` : undefined,
          filter: 'blur(14px) brightness(0.7)',
          transform: 'scale(1.1)',
        }}
      />

      {!photo && (
        <div className="absolute inset-0 bg-[#1C1C1E]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="text-2xl font-bold text-[#EDEADE] mb-1">
          {profile.name}{profile.age ? `, ${profile.age}` : ''}
        </h2>
        {profile.city && (
          <p className="text-sm text-[#9DA0A6] mb-3">{profile.city}</p>
        )}
        {profile.common_interests > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-medium text-[#D4AF37]">
              {profile.common_interests} interest{profile.common_interests !== 1 ? 's' : ''} in common
            </span>
          </div>
        )}
        <button
          onClick={handleView}
          className="w-full h-12 rounded-xl bg-[#D4AF37] text-black text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          View Standard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
