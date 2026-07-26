'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
];

export default function QuizPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

      toast.success('Saved');
      router.push('/onboard/interests');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const progressPercent = ((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col px-4 pt-6 bg-[#000000]">
      <div className="max-w-md mx-auto w-full flex flex-col pb-8">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-ink/40 hover:text-ink transition-colors p-1 -ml-1"
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
            {currentQuestion.options.map((option) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full py-4 px-5 rounded-xl text-left text-sm transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-gold/10 border-gold text-ink font-medium'
                      : 'bg-[#1C1C1E] border-[#2A2A2A] text-ink/70 hover:border-ink/30'
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
      </div>
    </div>
  );
}
