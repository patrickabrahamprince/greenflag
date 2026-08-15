'use client';

import { useRef, useState } from 'react';
import { ChevronRight, X, Heart, Coins, Zap, Users } from 'lucide-react';

const SWIPE_THRESHOLD_PX = 50;

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GreenFlag',
    description: 'Set your standards. Meet your match.',
    details: [
      'GreenFlag matches you based on your standards and values',
      'Every match is real and thoughtful',
      'Take your time to get to know each person',
    ],
    icon: <Heart className="w-12 h-12" />,
    color: 'text-gold',
  },
  {
    id: 'days',
    title: '3 Days, 3 Intentions',
    description: 'How a Standard actually works',
    details: [
      'She sets a Standard: one thought, one image, one voice — for each of 3 days.',
      'He completes all three intentions for a day before she sees anything. No half-effort.',
      'She reviews and decides each day. Reject at any point and the connection ends.',
      'Complete all three days with her approval, and the conversation unlocks.',
    ],
    icon: <Zap className="w-12 h-12" />,
    color: 'text-gold',
  },
  {
    id: 'coins',
    title: 'Understanding Coins',
    description: 'How to unlock conversations',
    details: [
      'Coins unlock profiles, photos, and conversations — 500 coins unlocks one profile.',
      'Coins are purchased directly in the app through the App Store.',
      'Your coin balance is always visible in the top-left corner.',
    ],
    icon: <Coins className="w-12 h-12" />,
    color: 'text-gold',
  },
  {
    id: 'standards',
    title: 'Set Your Standard',
    description: 'What she defines, he earns',
    details: [
      'Women define a 3-day Standard — the bar he needs to meet to earn a conversation.',
      'Men discover curated profiles and complete each day\'s Standard to show real intention.',
      'The more genuine the effort, the stronger the match.',
    ],
    icon: <Users className="w-12 h-12" />,
    color: 'text-gold',
  },
  {
    id: 'messaging',
    title: 'Smart Messaging Flow',
    description: 'Built to encourage real connection',
    details: [
      'A first message can be generated for you based on shared interests.',
      'New conversation prompts help you go deeper each day.',
      'Block or report any profile at any time.',
    ],
    icon: <Heart className="w-12 h-12" />,
    color: 'text-gold',
  },
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;
  const isComplete = completedSteps.size === ONBOARDING_STEPS.length;

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(step.id);
    setCompletedSteps(newCompleted);

    if (isLast) {
      localStorage.setItem('onboardingComplete', 'true');
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  // Ref-tracked (not state -- reading state back on the same line it's
  // set gives the previous render's value) and gated on the gesture
  // being more horizontal than vertical, same pattern proven across
  // SwipeToDismiss/ProfileImageCarousel/SwipeBackGesture -- without that
  // guard an ordinary vertical scroll can misfire as a swipe.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null || startY === null) return;

    const dx = startX - endX;
    const dy = startY - endY;
    if (Math.abs(dx) <= Math.abs(dy)) return;
    if (dx > SWIPE_THRESHOLD_PX) handleNext(); // swipe left = next
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="bg-black rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-white/10"
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className={`${step.color}`}>{step.icon}</div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ink/60" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2 className="text-2xl font-display font-semibold text-ink mb-2">{step.title}</h2>
          <p className="text-ink/60 text-sm mb-6">{step.description}</p>

          <div className="space-y-3">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                <p className="text-ink/80 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black border-t border-white/10 flex gap-3">
          <button
            onClick={handleSkip}
            className="btn-secondary flex-1"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isLast ? 'Start Matching' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
