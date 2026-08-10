import { MapPin, Briefcase, Ruler, Music } from 'lucide-react';
import { QUIZ_QUESTION_ORDER, QUIZ_QUESTION_LABELS } from '@/lib/quizQuestions';
import { PromptCard } from '@/components/shared/PromptCard';
import {
  LIFESTYLE_LABELS, BASICS_LABELS, LIFESTYLE_ICONS, BASICS_ICONS,
  type LifestyleField, type BasicsField,
} from '@/lib/constants/profileDetails';

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
  teaserPrompt?: string | null;
  teaserAnswer?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  pets?: string | null;
  workout?: string | null;
  zodiac?: string | null;
  educationLevel?: string | null;
  familyPlans?: string | null;
  communicationStyle?: string | null;
  anthemTitle?: string | null;
  anthemArtist?: string | null;
}

function DetailRow({ Icon, label, value }: { Icon: typeof Music; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-gold shrink-0" />
      <div>
        <p className="text-xs text-ink/40">{label}</p>
        <p className="text-sm text-ink/90 font-medium">{value}</p>
      </div>
    </div>
  );
}

function InterestPill({ label, matched }: { label: string; matched?: boolean }) {
  return (
    <span
      className={`px-4 py-2 rounded-full text-sm truncate transition-all ${
        matched
          ? 'bg-gold/10 border border-gold text-white font-medium shadow-md shadow-gold/5'
          : 'bg-well border border-raised text-ink/80'
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
  teaserPrompt,
  teaserAnswer,
  smoking,
  drinking,
  pets,
  workout,
  zodiac,
  educationLevel,
  familyPlans,
  communicationStyle,
  anthemTitle,
  anthemArtist,
}: ProfileInfoProps) {
  const answeredQuestions = QUIZ_QUESTION_ORDER.filter((id) => quizAnswers?.[id]);

  const lifestyleValues: Partial<Record<LifestyleField, string>> = {
    ...(smoking ? { smoking } : {}),
    ...(drinking ? { drinking } : {}),
    ...(pets ? { pets } : {}),
    ...(workout ? { workout } : {}),
  };
  const basicsValues: Partial<Record<BasicsField, string>> = {
    ...(zodiac ? { zodiac } : {}),
    ...(educationLevel ? { education_level: educationLevel } : {}),
    ...(familyPlans ? { family_plans: familyPlans } : {}),
    ...(communicationStyle ? { communication_style: communicationStyle } : {}),
  };

  return (
    <div className="px-8 pt-8">
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-ink/60 border-b border-raised py-6">
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
        <p className="text-ink/80 text-base leading-relaxed border-b border-raised py-6">{bio}</p>
      )}

      {teaserPrompt && teaserAnswer && (
        <div className="border-b border-raised py-6">
          <PromptCard caption={teaserPrompt} answer={teaserAnswer} />
        </div>
      )}

      {interests.length > 0 && (
        <div className="border-b border-raised py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <InterestPill key={interest} label={interest} matched={matchOverlapping.includes(interest)} />
            ))}
          </div>
        </div>
      )}

      {lookingForInterests.length > 0 && (
        <div className="border-b border-raised py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">What {name} Values</p>
          <div className="flex flex-wrap gap-2">
            {lookingForInterests.map((interest) => (
              <InterestPill key={interest} label={interest} matched={matchOverlapping.includes(interest)} />
            ))}
          </div>
        </div>
      )}

      {answeredQuestions.length > 0 && (
        <div className="border-b border-raised py-6">
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

      {Object.keys(lifestyleValues).length > 0 && (
        <div className="border-b border-raised py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-4">Lifestyle</p>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(lifestyleValues) as LifestyleField[]).map((field) => (
              <DetailRow key={field} Icon={LIFESTYLE_ICONS[field]} label={LIFESTYLE_LABELS[field]} value={lifestyleValues[field]!} />
            ))}
          </div>
        </div>
      )}

      {Object.keys(basicsValues).length > 0 && (
        <div className="border-b border-raised py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-4">Basics</p>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(basicsValues) as BasicsField[]).map((field) => (
              <DetailRow key={field} Icon={BASICS_ICONS[field]} label={BASICS_LABELS[field]} value={basicsValues[field]!} />
            ))}
          </div>
        </div>
      )}

      {anthemTitle && (
        <div className="border-b border-raised py-6">
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-4">My Anthem</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
              <Music size={16} className="text-gold" />
            </div>
            <div>
              <p className="text-sm text-ink font-medium">{anthemTitle}</p>
              {anthemArtist && <p className="text-xs text-ink/50">{anthemArtist}</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
