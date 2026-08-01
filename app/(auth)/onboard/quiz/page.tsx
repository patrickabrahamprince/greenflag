'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'relationship_goal',
    question: 'What brings you to Greenflag?',
    options: ['A long-term partnership', 'Marriage-minded', 'Intentional, but open', 'Exploring with intention'],
  },
  {
    id: 'weekend_vibe',
    question: 'Your ideal Sunday?',
    options: ['Slow coffee & pages', 'Outdoors & movement', 'Brunch with your circle', 'Slow morning, no plans'],
  },
  {
    id: 'love_language',
    question: 'How do you feel most loved?',
    options: ['Quality time together', 'Thoughtful words', 'Considerate actions', 'Physical presence'],
  },
  {
    id: 'first_date',
    question: 'Your ideal first encounter?',
    options: ['A quiet coffee walk', 'Cocktails, low light', 'A class or experience together', 'An intimate dinner'],
  },
  {
    id: 'communication',
    question: 'How do you stay connected?',
    options: ['Thoughtful messages', 'Unplanned calls', 'Face to face', 'A shared sense of humor'],
  },
  {
    id: 'humor_style',
    question: 'Your humor?',
    options: ['Dry & understated', 'Playful & witty', 'Sharp & clever', 'Dark & dry'],
  },
  {
    id: 'ideal_trip',
    question: 'Where would you escape to?',
    options: ['Private beach', 'Old European city', 'Mountains, off-grid', 'Culinary capital'],
  },
  {
    id: 'pets',
    question: 'Pets?',
    options: ['Dog person', 'Cat person', 'Animal lover', 'Not just yet'],
  },
  {
    id: 'education',
    question: 'Education level?',
    options: ['High School', "Bachelor's Degree", "Master's Degree", 'Doctorate'],
  },
  {
    id: 'smoking',
    question: 'Smoking?',
    options: ['Never', 'Socially', 'Regularly', "Trying to quit"],
  },
  {
    id: 'kids',
    question: 'Kids?',
    options: ['Have kids', "Don't want kids", 'Want kids someday', 'Open either way'],
  },
];

// Deterministic, not real psychology -- a lightweight "aha" reveal after
// the quiz instead of the answers just disappearing into storage with no
// payoff. Each option maps to one of four traits; whichever trait shows
// up most across the 8 answers picks the archetype shown back.
type Trait = 'Grounded' | 'Romantic' | 'Adventurous' | 'Playful';

const TRAIT_MAP: Record<string, Record<string, Trait>> = {
  relationship_goal: {
    'A long-term partnership': 'Grounded',
    'Marriage-minded': 'Grounded',
    'Intentional, but open': 'Romantic',
    'Exploring with intention': 'Adventurous',
  },
  weekend_vibe: {
    'Slow coffee & pages': 'Grounded',
    'Outdoors & movement': 'Adventurous',
    'Brunch with your circle': 'Playful',
    'Slow morning, no plans': 'Romantic',
  },
  love_language: {
    'Quality time together': 'Romantic',
    'Thoughtful words': 'Romantic',
    'Considerate actions': 'Grounded',
    'Physical presence': 'Adventurous',
  },
  first_date: {
    'A quiet coffee walk': 'Grounded',
    'Cocktails, low light': 'Playful',
    'A class or experience together': 'Adventurous',
    'An intimate dinner': 'Romantic',
  },
  communication: {
    'Thoughtful messages': 'Romantic',
    'Unplanned calls': 'Playful',
    'Face to face': 'Grounded',
    'A shared sense of humor': 'Playful',
  },
  humor_style: {
    'Dry & understated': 'Grounded',
    'Playful & witty': 'Playful',
    'Sharp & clever': 'Adventurous',
    'Dark & dry': 'Romantic',
  },
  ideal_trip: {
    'Private beach': 'Romantic',
    'Old European city': 'Romantic',
    'Mountains, off-grid': 'Adventurous',
    'Culinary capital': 'Playful',
  },
  pets: {
    'Dog person': 'Playful',
    'Cat person': 'Grounded',
    'Animal lover': 'Romantic',
    'Not just yet': 'Adventurous',
  },
};

const ARCHETYPES: Record<Trait, { title: string; description: string }> = {
  Grounded: {
    title: 'The Steady One',
    description: "You know what you want, and you're not in a rush to fake it. Stability reads as strength on you.",
  },
  Romantic: {
    title: 'The Old Soul',
    description: 'You lead with feeling. Sincerity is your love language, and you notice when someone else means it too.',
  },
  Adventurous: {
    title: 'The Explorer',
    description: "You want a partner in motion, not just in comfort — someone who says yes to the unplanned.",
  },
  Playful: {
    title: 'The Spark',
    description: 'Lightness is your currency. You connect through humor first, and depth follows once it feels safe.',
  },
};

function computeArchetype(answers: Record<string, string>): { title: string; description: string } {
  const counts: Record<Trait, number> = { Grounded: 0, Romantic: 0, Adventurous: 0, Playful: 0 };
  for (const [questionId, option] of Object.entries(answers)) {
    const trait = TRAIT_MAP[questionId]?.[option];
    if (trait) counts[trait] += 1;
  }
  const [topTrait] = (Object.entries(counts) as [Trait, number][]).sort((a, b) => b[1] - a[1])[0];
  return ARCHETYPES[topTrait];
}

export default function QuizPage() {
  const router = useRouter();
  const supabase = createClient();
  const name = useOnboardingStore((s) => s.name);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Session expired. Please sign in again.');
        router.replace('/login');
        return;
      }
      setLoading(false);
    };
    fetchSession();
  }, [supabase, router]);

  const handleOptionSelect = (option: string) => {
    const currentQuestion = QUIZ_QUESTIONS[currentIdx];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    hapticTap();
    const currentQuestion = QUIZ_QUESTIONS[currentIdx];
    if (!answers[currentQuestion.id]) {
      toast.error('Please select an option to continue');
      return;
    }
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    } else {
      router.push('/onboard/profile');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expired');

      const { error } = await supabase.from('profiles').update({
        quiz_answers: answers,
      }).eq('id', user.id);

      if (error) throw error;

      setReveal(computeArchetype(answers));
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (reveal) {
    return (
      <div className="w-full animate-fade-in min-h-dvh flex flex-col justify-center px-6 bg-[#000000] text-center">
        <div className="max-w-sm mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgba(192,38,211,0.6)]">
            <Sparkles className="w-7 h-7 text-gold" />
          </div>
          <p className="text-ink/50 text-xs uppercase tracking-widest mb-3">
            {name ? `${name}, based on your answers` : 'Based on your answers'}
          </p>
          <h1 className="font-display text-3xl text-ink mb-4">{reveal.title}</h1>
          <p className="text-ink/60 text-sm leading-relaxed mb-10">{reveal.description}</p>
          <button
            onClick={() => router.push('/onboard/interests')}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'quiz-reveal-continue' : undefined}
            className="btn-primary w-full py-4 font-semibold text-sm active:scale-95 transition-transform"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100;
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIdx === QUIZ_QUESTIONS.length - 1;
  const encouragement = isLastQuestion
    ? 'Last one — make it count.'
    : progressPercent >= 75
    ? 'Almost there.'
    : progressPercent >= 50
    ? "You're more than halfway."
    : progressPercent >= 25
    ? 'This shapes who you meet.'
    : "There's no wrong answer — just be honest.";

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col px-4 pt-safe-top bg-[#000000]">
      <div className="max-w-md mx-auto w-full flex flex-col pb-safe-bottom">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-ink/40 hover:text-ink active:scale-90 transition-all p-1 -ml-1"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="text-xs font-semibold text-[#9DA0A6]">
              {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <div className="w-6" /> {/* spacer */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#1C1C1E] h-1 rounded-full mb-10 overflow-hidden">
            <div
              className="bg-gold h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="mb-8">
            <h2 className="text-xl font-display font-medium text-ink mb-2 leading-snug">
              {currentQuestion.question}
            </h2>
            <p className="text-[#9DA0A6] text-xs">Choose what feels most like you</p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIdx) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? `quiz-option-${optionIdx}` : undefined}
                  className={`w-full py-4 px-5 rounded-xl text-left text-sm transition-all duration-200 flex items-center justify-between border ${
                    isSelected
                      ? 'bg-gold/10 border-gold text-ink font-medium scale-[1.02] shadow-[0_0_20px_-6px_rgba(192,38,211,0.5)]'
                      : 'bg-[#1C1C1E] border-[#2A2A2A] text-ink/70 hover:border-ink/30 active:scale-[0.98]'
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-gold" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          disabled={saving || !currentAnswer}
          data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'quiz-next' : undefined}
          className="btn-primary w-full py-3.5 mt-8 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:scale-100"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : currentIdx === QUIZ_QUESTIONS.length - 1 ? (
            <>
              Complete <CheckCircle2 size={16} />
            </>
          ) : (
            <>
              Next <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-gold/70 font-medium mt-4 animate-fade-in" key={currentIdx}>
          {encouragement}
        </p>
      </div>
    </div>
  );
}
