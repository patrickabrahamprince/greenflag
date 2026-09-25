'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/lib/store';
import { hapticTap } from '@/lib/haptics';
import toast from 'react-hot-toast';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

interface Question {
  id: string;
  question: string;
  options: string[];
}

// One background per question instead of a single static one -- reuses
// photos already shown earlier in onboarding (age/interests/etc.) rather
// than new files, so by the time someone reaches the quiz these are
// already sitting in the browser cache and switch instantly.
const QUESTION_IMAGES = [
  '/onboarding/hero.jpg',
  '/onboarding/interests.jpg',
  '/onboarding/teasers.jpg',
  '/onboarding/quiz-playful.jpg',
  '/onboarding/rules.jpg',
];

// Trimmed from 11 to 5 -- the demographic ones (education, smoking, kids)
// felt like a form, not a quiz. These five keep even coverage across all
// four archetypes below while actually being fun to answer.
const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'travel_style',
    question: "What's your go-to travel style?",
    options: ['Off-grid treks & mountain camping', 'Boutique homestays & cafe hopping', 'Scenic road trips & coastal drives', 'Backpacking & social hostels'],
  },
  {
    id: 'weekend_escape',
    question: 'Your ideal 3-day weekend getaway?',
    options: ['Trek up a mist-covered peak (Coorg/Wayanad)', 'Lazy beach sunsets & seafood (Gokarna/Goa)', 'Exploring ancient ruins & bouldering (Hampi)', 'Coffee plantations & scenic viewpoints (Chikmagalur)'],
  },
  {
    id: 'travel_pace',
    question: 'How do you like your travel days?',
    options: ['Sunrise starts & action-packed itineraries', 'Slow mornings with coffee, go with the flow', 'Curated road trip stops & scenic overlooks', 'Late-night bonfires & good music'],
  },
  {
    id: 'travel_essential',
    question: "What's always in your travel bag?",
    options: ['Hiking boots & a reusable water bottle', 'A camera & a good book', 'Offline maps & a road trip playlist', 'A hammock & travel board games'],
  },
  {
    id: 'dream_companion',
    question: 'What makes the best travel buddy?',
    options: ['Always down for an adventure', 'Chill, considerate & easygoing', 'Great navigator or reliable driver', 'Fun conversationalist & storyteller'],
  },
];

// Lightweight "aha" reveal calculating the user's travel personality
type Trait = 'Grounded' | 'Romantic' | 'Adventurous' | 'Playful';

const TRAIT_MAP: Record<string, Record<string, Trait>> = {
  travel_style: {
    'Off-grid treks & mountain camping': 'Adventurous',
    'Boutique homestays & cafe hopping': 'Romantic',
    'Scenic road trips & coastal drives': 'Grounded',
    'Backpacking & social hostels': 'Playful',
  },
  weekend_escape: {
    'Trek up a mist-covered peak (Coorg/Wayanad)': 'Adventurous',
    'Lazy beach sunsets & seafood (Gokarna/Goa)': 'Romantic',
    'Exploring ancient ruins & bouldering (Hampi)': 'Grounded',
    'Coffee plantations & scenic viewpoints (Chikmagalur)': 'Playful',
  },
  travel_pace: {
    'Sunrise starts & action-packed itineraries': 'Adventurous',
    'Slow mornings with coffee, go with the flow': 'Romantic',
    'Curated road trip stops & scenic overlooks': 'Grounded',
    'Late-night bonfires & good music': 'Playful',
  },
  travel_essential: {
    'Hiking boots & a reusable water bottle': 'Adventurous',
    'A camera & a good book': 'Romantic',
    'Offline maps & a road trip playlist': 'Grounded',
    'A hammock & travel board games': 'Playful',
  },
  dream_companion: {
    'Always down for an adventure': 'Adventurous',
    'Chill, considerate & easygoing': 'Romantic',
    'Great navigator or reliable driver': 'Grounded',
    'Fun conversationalist & storyteller': 'Playful',
  },
};

const ARCHETYPES: Record<Trait, { title: string; description: string }> = {
  Grounded: {
    title: 'The Route Captain',
    description: "Prepared, dependable, and observant. You map out scenic detours, keep the crew safe, and make sure every road trip is smooth and unforgettable.",
  },
  Romantic: {
    title: 'The Slow Wanderer',
    description: 'You travel for the soul. Sunset viewpoints, quiet cafe mornings, boutique stays, and meaningful conversations under the open sky.',
  },
  Adventurous: {
    title: 'The Wild Explorer',
    description: "Full throttle, spontaneous, and bold. You say yes to summits, river crossings, and uncharted trails that turn into epic stories.",
  },
  Playful: {
    title: 'The Roadtrip Spark',
    description: 'High energy, laughter, and great vibes. You bring the playlists, gather people around the bonfire, and make every mile memorable.',
  },
};

// One distinct photo per archetype instead of reusing the same quiz.jpg
// for every reveal -- the reveal is meant to feel personal to the result,
// not generic.
const ARCHETYPE_IMAGES: Record<Trait, string> = {
  Grounded: '/onboarding/quiz-grounded.jpg',
  Romantic: '/onboarding/quiz-romantic.jpg',
  Adventurous: '/onboarding/quiz-adventurous.jpg',
  Playful: '/onboarding/quiz-playful.jpg',
};

function computeArchetype(answers: Record<string, string>): { title: string; description: string; image: string } {
  const counts: Record<Trait, number> = { Grounded: 0, Romantic: 0, Adventurous: 0, Playful: 0 };
  for (const [questionId, option] of Object.entries(answers)) {
    const trait = TRAIT_MAP[questionId]?.[option];
    if (trait) counts[trait] += 1;
  }
  const [topTrait] = (Object.entries(counts) as [Trait, number][]).sort((a, b) => b[1] - a[1])[0];
  return { ...ARCHETYPES[topTrait], image: ARCHETYPE_IMAGES[topTrait] };
}

export default function QuizPage() {
  const router = useRouter();
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const name = useOnboardingStore((s) => s.name);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<{ title: string; description: string; image: string } | null>(null);

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
    router.prefetch('/onboard/interests');
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
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <LoadingLogo />
      </div>
    );
  }

  if (reveal) {
    return (
      <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center px-6 bg-base text-center">
        <OnboardingBackground image={reveal.image} />
        <div className="max-w-sm mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgba(210,4,45,0.5)]">
            <Sparkles className="w-7 h-7 text-gold" />
          </div>
          <p className="text-ink/50 text-xs uppercase tracking-widest mb-3">
            {name ? `${name}, based on your answers` : 'Based on your answers'}
          </p>
          <h1 className="font-display text-3xl text-ink mb-4">{reveal.title}</h1>
          <p className="text-ink/60 text-sm leading-relaxed mb-10">{reveal.description}</p>
          <button
            onClick={() => goTo('/onboard/interests', '/onboarding/interests.jpg')}
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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image={QUESTION_IMAGES[currentIdx] || '/onboarding/quiz.jpg'} />
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
            <span className="text-xs font-semibold text-ink/50">
              {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <div className="w-6" /> {/* spacer */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-well h-1 rounded-full mb-10 overflow-hidden">
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
            <p className="text-ink/50 text-xs">Choose what feels most like you</p>
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
                  className={`w-full py-4 px-5 rounded-tile text-left text-sm transition-all duration-200 flex items-center justify-between border-2 ${
                    isSelected
                      ? 'bg-gold/10 border-gold text-ink font-medium scale-[1.02] shadow-[0_0_20px_-6px_rgba(210,4,45,0.4)]'
                      : 'bg-well border-transparent text-ink/70 hover:border-ink/20 active:scale-[0.98]'
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
            <Loader2 className="w-4 h-4 animate-spin text-ink" />
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
