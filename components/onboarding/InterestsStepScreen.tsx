'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { StepDots } from '@/components/shared/StepDots';

interface InterestsStepScreenProps {
  step: number;
  total: number;
  image: string;
  onBack: () => void;
  onSkip: () => void;
  skipLoading: boolean;
  onNext: () => void;
  nextLoading: boolean;
  nextLabel: string;
  nextTestId?: string;
  children: ReactNode;
}

// Shared chrome for every "What Defines You" screen (interests/, /2, /3,
// /4, /5): header + StepDots + Skip stay fixed at the top, the category
// picker(s) get their own bounded, independently scrolling area, and the
// Next/Complete button is pinned above the safe area instead of sitting
// in normal flow at the end of the content -- reaching it never requires
// scrolling all the way down through the categories first.
export function InterestsStepScreen({
  step,
  total,
  image,
  onBack,
  onSkip,
  skipLoading,
  onNext,
  nextLoading,
  nextLabel,
  nextTestId,
  children,
}: InterestsStepScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden isolate">
      <OnboardingBackground image={image} />
      
      {/* 100% Frozen Fixed Top Header */}
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md pt-safe-top pb-3 px-6 border-b border-stone-100/80">
        <div className="flex items-center justify-between mb-2 max-w-md mx-auto w-full">
          <button
            onClick={onBack}
            className="text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 shadow-xs active:scale-90 transition-all p-2 rounded-full cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={onSkip}
            disabled={skipLoading}
            className="px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 shadow-xs text-xs font-bold tracking-wider uppercase text-stone-600 hover:text-stone-900 active:scale-90 transition-all cursor-pointer"
          >
            Skip
          </button>
        </div>

        <div className="max-w-md mx-auto w-full">
          <StepDots current={step} total={total} />
        </div>
      </header>

      {/* Smooth Scrollable Body */}
      <main className="flex-1 overflow-y-auto overscroll-contain max-w-md mx-auto w-full px-6 py-4 pb-36">
        {children}
      </main>

      {/* Fixed Bottom Action Container */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 px-6 pt-3 pb-safe-bottom bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none"
      >
        <div className="max-w-md mx-auto w-full pb-4 pointer-events-auto">
          <button
            onClick={onNext}
            disabled={nextLoading}
            data-testid={nextTestId}
            className="w-full py-4 bg-[#1C1C1E] hover:bg-black text-white font-bold rounded-full active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {nextLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
