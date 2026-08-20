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
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col px-6 pt-safe-top bg-base">
      <OnboardingBackground image={image} />
      <div className="flex items-center justify-between mt-2 mb-4 shrink-0">
        <button onClick={onBack} className="text-ink/40 hover:text-ink active:scale-90 transition-all p-1 -ml-1">
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={onSkip}
          disabled={skipLoading}
          className="px-3 py-2 -mr-3 text-sm font-semibold tracking-widest uppercase text-gold/80 hover:text-gold active:scale-90 transition-all"
        >
          Skip
        </button>
      </div>

      <div className="max-w-md mx-auto w-full shrink-0">
        <StepDots current={step} total={total} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-none max-w-md mx-auto w-full pb-28">
        {children}
      </div>

      <div
        className="fixed inset-x-0 z-10 px-6 pt-6 pb-4"
        style={{ bottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + var(--kb-inset, 0px))' }}
      >
        <button
          onClick={onNext}
          disabled={nextLoading}
          data-testid={nextTestId}
          className="btn-primary w-full max-w-md mx-auto active:scale-[0.98] flex items-center justify-center gap-2"
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
  );
}
