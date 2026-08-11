'use client';

import { useState } from 'react';
import { ChevronRight, X, Heart, Coins, Zap, Users } from 'lucide-react';

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
    color: 'text-red-500',
  },
  {
    id: 'days',
    title: 'How Day 1, 2, and 3 Works',
    description: 'Three stages of genuine connection',
    details: [
      'Day 1: Initial Match — You both matched each other. See their profile and decide if you want to message.',
      'Day 2: First Exchange — Exchange 1-2 questions to learn about each other\'s values and personality.',
      'Day 3: Real Connection — Share something more personal (photo, voice note, or deeper question). This is where real chemistry happens.',
    ],
    icon: <Zap className="w-12 h-12" />,
    color: 'text-yellow-500',
  },
  {
    id: 'coins',
    title: 'Understanding Coins',
    description: 'How to unlock premium features',
    details: [
      'Coins are used to unlock special features like seeing more profiles or sending gifts.',
      'Free coins: You earn 10 free coins every week just for using the app.',
      'Premium features: Send gifts, unlock hidden photos, or use power features.',
      'Your coin balance is always visible in the top-right corner.',
    ],
    icon: <Coins className="w-12 h-12" />,
    color: 'text-amber-500',
  },
  {
    id: 'standards',
    title: 'Set Your Standards',
    description: 'Define what matters to you',
    details: [
      'Your standards are the foundation of every match you get.',
      'Answer questions about what you\'re looking for — values, lifestyle, interests.',
      'The more specific you are, the better your matches.',
      'You can update your standards anytime from Settings.',
    ],
    icon: <Users className="w-12 h-12" />,
    color: 'text-blue-500',
  },
  {
    id: 'messaging',
    title: 'Smart Messaging Flow',
    description: 'Built to encourage real connection',
    details: [
      'First message is auto-generated based on your shared interests.',
      'Each day, new conversation prompts help you go deeper.',
      'Video calls available after Day 2 to speed up connection.',
      'Block or report any profile at any time.',
    ],
    icon: <Heart className="w-12 h-12" />,
    color: 'text-pink-500',
  },
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-start justify-between">
          <div className={`${step.color}`}>{step.icon}</div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-500 text-sm mb-6">{step.description}</p>

          <div className="space-y-3">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLast ? 'Start Matching' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 bg-gray-50 text-center text-xs text-gray-500">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}
