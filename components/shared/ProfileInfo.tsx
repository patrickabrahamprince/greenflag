import { MapPin, Briefcase, Ruler } from 'lucide-react';
import { QUIZ_QUESTION_ORDER, QUIZ_QUESTION_LABELS } from '@/lib/quizQuestions';

interface ProfileInfoProps {
  name: string;
  age: number;
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  interests: string[];
  lookingForInterests?: string[];
  quizAnswers?: Record<string, string> | null;
  matchPercent?: number;
  matchOverlapping?: string[];
}

function InterestPill({ label, matched }: { label: string; matched?: boolean }) {
  return (
    <span
      className={`px-4 py-2 rounded-full text-sm truncate transition-all ${
        matched
          ? 'bg-gold/10 border border-gold text-white font-medium shadow-md shadow-gold/5'
          : 'bg-[#1C1C1E] border border-[#2C2C2E] text-[#EDEADE]/80'
      }`}
    >
      {label}
    </span>
  );
}

export function ProfileInfo({
  name,
  age,
  bio,
  job,
  height,
  city_auto,
  interests,
  lookingForInterests = [],
  quizAnswers,
  matchPercent,
  matchOverlapping = [],
}: ProfileInfoProps) {
  const answeredQuestions = QUIZ_QUESTION_ORDER.filter((id) => quizAnswers?.[id]);

  return (
    <div className="px-8 pt-8">
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
          <span className="text-gold text-xs uppercase tracking-wide">{matchPercent}% Alignment</span>
        )}
      </div>

      {bio && (
        <p className="text-ink/80 text-base leading-relaxed border-b border-[#2A2A2A] py-6">{bio}</p>
      )}

      {interests.length > 0 && (
        <div className="border-b border-[#2A2A2A] py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <InterestPill key={interest} label={interest} matched={matchOverlapping.includes(interest)} />
            ))}
          </div>
        </div>
      )}

      {lookingForInterests.length > 0 && (
        <div className="border-b border-[#2A2A2A] py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">What {name} Values</p>
          <div className="flex flex-wrap gap-2">
            {lookingForInterests.map((interest) => (
              <InterestPill key={interest} label={interest} matched={matchOverlapping.includes(interest)} />
            ))}
          </div>
        </div>
      )}

      {answeredQuestions.length > 0 && (
        <div className="border-b border-[#2A2A2A] py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-4">Get To Know {name}</p>
          <div className="space-y-5">
            {answeredQuestions.map((id) => (
              <div key={id}>
                <p className="text-xs text-ink/40 mb-1">{QUIZ_QUESTION_LABELS[id]}</p>
                <p className="font-display text-base text-ink/90 italic">{quizAnswers?.[id]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
