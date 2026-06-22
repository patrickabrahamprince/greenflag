import { MapPin, Briefcase, Ruler, Instagram } from 'lucide-react';

interface ProfileInfoProps {
  name: string;
  age: number;
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  instagram_url?: string;
  interests: string[];
  matchPercent?: number;
  matchOverlapping?: string[];
}

export function ProfileInfo({
  name,
  age,
  bio,
  job,
  height,
  city_auto,
  instagram_url,
  interests,
  matchPercent,
  matchOverlapping = [],
}: ProfileInfoProps) {
  return (
    <div className="px-5 -mt-20 relative z-10">
      <div className="flex items-end gap-3 mb-1">
        <h1 className="font-display text-3xl text-[#EDEADE]">
          {name}, {age}
        </h1>
        {matchPercent !== undefined && (
          <div className="flex items-center gap-1 bg-[#D4AF37]/20 backdrop-blur-md rounded-full px-3 py-1">
            <span className="text-[#D4AF37] text-sm font-bold">{matchPercent}%</span>
            <span className="text-[#D4AF37]/60 text-xs">match</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#EDEADE]/60">
        {city_auto && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city_auto}</span>
          </div>
        )}
        {job && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{job}</span>
          </div>
        )}
        {height && (
          <div className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            <span>{height}</span>
          </div>
        )}
      </div>

      {bio && (
        <p className="text-[#EDEADE]/80 text-sm mt-4 leading-relaxed">{bio}</p>
      )}

      {matchOverlapping.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[#EDEADE]/40 uppercase tracking-wider mb-2">Shared Interests</p>
          <div className="flex flex-wrap gap-2">
            {matchOverlapping.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-xs border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs text-[#EDEADE]/40 uppercase tracking-wider mb-2">Interests</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const isMatch = matchOverlapping.includes(interest);
            return (
              <span
                key={interest}
                className={`px-3 py-1 rounded-full text-xs border ${
                  isMatch
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                    : 'border-white/10 bg-white/5 text-[#EDEADE]/70'
                }`}
              >
                {interest}
              </span>
            );
          })}
        </div>
      </div>

      {instagram_url && (
        <a
          href={
            instagram_url.startsWith('http')
              ? instagram_url
              : `https://instagram.com/${instagram_url.replace('@', '')}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-4 text-[#EDEADE]/50 hover:text-[#EDEADE]/80 transition-colors"
        >
          <Instagram className="w-4 h-4" />
          <span className="text-sm">{instagram_url}</span>
        </a>
      )}
    </div>
  );
}
