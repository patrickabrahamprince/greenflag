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
    <div className="bg-[#000000] px-8 pt-8">
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-ink/60 border-b border-[#2A2A2A] py-6">
        <span className="text-ink/80">{age}</span>
        {city_auto && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city_auto}</span>
          </div>
        )}
        {job && (
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{job}</span>
          </div>
        )}
        {height && (
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            <span>{height}</span>
          </div>
        )}
        {matchPercent !== undefined && (
          <span className="text-[#D4AF37] text-xs uppercase tracking-wide">{matchPercent}% match</span>
        )}
      </div>

      {matchOverlapping.length > 0 && (
        <div className="border-b border-[#2A2A2A] py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">Shared Interests</p>
          <div className="flex flex-wrap gap-2">
            {matchOverlapping.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 text-xs uppercase tracking-wide border border-[#D4AF37] text-[#D4AF37]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-[#2A2A2A] py-6">
        <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">Interests</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const isMatch = matchOverlapping.includes(interest);
            return (
              <span
                key={interest}
                className={`px-3 py-1 text-xs uppercase tracking-wide border ${
                  isMatch
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-[#2A2A2A] text-ink/60'
                }`}
              >
                {interest}
              </span>
            );
          })}
        </div>
      </div>

      {bio && (
        <p className="text-ink/80 text-base leading-relaxed border-b border-[#2A2A2A] py-6">{bio}</p>
      )}

      {instagram_url && (
        <a
          href={
            instagram_url.startsWith('http')
              ? instagram_url
              : `https://instagram.com/${instagram_url.replace('@', '')}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 py-6 text-ink/50 hover:text-[#D4AF37] transition-colors"
        >
          <Instagram className="w-4 h-4" />
          <span className="text-sm">{instagram_url}</span>
        </a>
      )}
    </div>
  );
}
