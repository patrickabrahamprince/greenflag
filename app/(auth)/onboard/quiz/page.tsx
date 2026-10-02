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
    question: "What's your go-to getaway & travel style?",
    options: ['Off-grid treks & mountain camping', 'Boutique homestays & cafe dates', 'Scenic road trips & coastal drives', 'Backpacking & spontaneous escapes'],
  },
  {
    id: 'dating_vibe',
    question: "What's your ideal dating vibe on a trip?",
    options: ['Romantic sunset drives & cozy cafes', 'Summit treks & adrenaline adventures together', 'Scenic road trips with deep conversations', 'Beach bonfires, music & playful banter'],
  },
  {
    id: 'weekend_escape',
    question: 'Your dream 3-day getaway with someone special?',
    options: ['Trek up a mist-covered peak (Coorg/Wayanad)', 'Lazy beach sunsets & seafood (Gokarna/Goa)', 'Exploring ancient ruins & stargazing (Hampi)', 'Coffee plantation stay & fireside chats (Chikmagalur)'],
  },
  {
    id: 'spark_trigger',
    question: 'What instantly creates a spark on the road?',
    options: ['Blowing through playlists on open highways', 'Unplanned detours to hidden viewpoints', 'Late-night conversations under a starry sky', 'Bursting into laughter over local street food'],
  },
  {
    id: 'dream_companion',
    question: 'What are you looking for most in a travel & dating partner?',
    options: ['Always down for an adrenaline adventure', 'Chill, considerate with romantic chemistry', 'A reliable copilot & great conversationalist', 'High energy, witty, and fun to be around'],
  },
];

// Lightweight "aha" reveal calculating the user's travel personality
type Trait = 'Grounded' | 'Romantic' | 'Adventurous' | 'Playful';

const TRAIT_MAP: Record<string, Record<string, Trait>> = {
  travel_style: {
    'Off-grid treks & mountain camping': 'Adventurous',
    'Boutique homestays & cafe dates': 'Romantic',
    'Scenic road trips & coastal drives': 'Grounded',
    'Backpacking & spontaneous escapes': 'Playful',
  },
  dating_vibe: {
    'Romantic sunset drives & cozy cafes': 'Romantic',
    'Summit treks & adrenaline adventures together': 'Adventurous',
    'Scenic road trips with deep conversations': 'Grounded',
    'Beach bonfires, music & playful banter': 'Playful',
  },
  weekend_escape: {
    'Trek up a mist-covered peak (Coorg/Wayanad)': 'Adventurous',
    'Lazy beach sunsets & seafood (Gokarna/Goa)': 'Romantic',
    'Exploring ancient ruins & stargazing (Hampi)': 'Grounded',
    'Coffee plantation stay & fireside chats (Chikmagalur)': 'Playful',
  },
  spark_trigger: {
    'Blowing through playlists on open highways': 'Grounded',
    'Unplanned detours to hidden viewpoints': 'Adventurous',
    'Late-night conversations under a starry sky': 'Romantic',
    'Bursting into laughter over local street food': 'Playful',
  },
  dream_companion: {
    'Always down for an adrenaline adventure': 'Adventurous',
    'Chill, considerate with romantic chemistry': 'Romantic',
    'A reliable copilot & great conversationalist': 'Grounded',
    'High energy, witty, and fun to be around': 'Playful',
  },
};

const ARCHETYPES: Record<Trait, { title: string; description: string }> = {
  Grounded: {
    title: 'The Roadtrip Copilot',
    description: "Dependable, observant, and thoughtful. You map out scenic detours, keep the playlist flowing, and build deep connections over long highway drives.",
  },
  Romantic: {
    title: 'The Sunset Romantic',
    description: 'You travel for the soul and spark. Golden hour viewpoints, quiet cafe mornings, boutique homestays, and stargazing conversations.',
  },
  Adventurous: {
    title: 'The Wild Explorer',
    description: "Spontaneous, bold, and fearless. You say yes to cliffside treks, river crossings, and unplanned adventures that turn into unforgettable love stories.",
  },
  Playful: {
    title: 'The Adventure Spark',
    description: 'High energy, infectious laughter, and great vibes. You bring the music, light up the bonfire, and make every single mile exciting.',
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
      <div className="min-h-dvh flex items-center justify-center bg-[#FAF9F6]">
        <LoadingLogo />
      </div>
    );
  }

  if (reveal) {
    return (
      <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center px-5 bg-[#FAF9F6] text-center">
        <OnboardingBackground image={reveal.image} />
        <div className="max-w-sm mx-auto w-full bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-[36px] p-8 shadow-md">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Sparkles className="w-10 h-10 text-emerald-700" />
          </div>
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest bg-emerald-100/90 px-3.5 py-1 rounded-full inline-block mb-3">
            {name ? `${name}'s Travel Archetype` : 'Your Travel Archetype'}
          </span>
          <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-3">{reveal.title}</h1>
          <p className="text-stone-600 text-sm leading-relaxed mb-8 font-medium">{reveal.description}</p>
          <button
            onClick={() => goTo('/onboard/interests', '/onboarding/interests.jpg')}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'quiz-reveal-continue' : undefined}
            className="btn-primary w-full py-4 font-bold text-sm active:scale-95 transition-transform shadow-lg"
          >
            Continue to Interests
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
    ? 'Last one — your travel style is almost mapped.'
    : progressPercent >= 75
    ? 'Almost there!'
    : progressPercent >= 50
    ? "You're more than halfway."
    : progressPercent >= 25
    ? 'This helps us suggest tailored trips.'
    : "There's no wrong answer — just pick what sounds fun.";

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-5 pt-safe-top pb-safe-bottom bg-[#FAF9F6]">
      <OnboardingBackground image={QUESTION_IMAGES[currentIdx] || '/onboarding/quiz.jpg'} />
      
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-2">
        <button
          onClick={handleBack}
          className="text-[#382A21] bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs active:scale-90 transition-all p-2.5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full shadow-2xs">
          Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
        </span>
      </div>

      <div className="max-w-md mx-auto w-full mb-4">
        {/* Progress Bar */}
        <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden shadow-inner">
          <div
            className="bg-[#1D3B2A] h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center pb-4">
        <div className="bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-6 shadow-sm mb-4">
          <h2 className="text-2xl font-display font-extrabold text-[#382A21] mb-1.5 leading-snug">
            {currentQuestion.question}
          </h2>
          <p className="text-stone-500 text-xs font-medium mb-5">Choose what matches your vibe</p>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option, optionIdx) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => { hapticTap(); handleOptionSelect(option); }}
                  data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? `quiz-option-${optionIdx}` : undefined}
                  className={`w-full py-4 px-4 rounded-2xl text-left text-sm transition-all duration-200 flex items-center justify-between border-2 ${
                    isSelected
                      ? 'bg-[#1D3B2A] border-[#1D3B2A] text-white font-bold shadow-md scale-[1.01]'
                      : 'bg-stone-50/80 border-stone-200/90 text-[#382A21] font-semibold hover:border-emerald-400 active:scale-[0.98]'
                  }`}
                >
                  <span className="pr-2">{option}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
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
          className="btn-primary w-full py-4 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : currentIdx === QUIZ_QUESTIONS.length - 1 ? (
            <>
              Complete Quiz <CheckCircle2 size={18} />
            </>
          ) : (
            <>
              Next Question <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-xs text-stone-500 font-semibold mt-3 animate-fade-in" key={currentIdx}>
          {encouragement}
        </p>
      </div>
    </div>
  );
}
