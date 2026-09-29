'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'center';
}

export const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    id: 'profile',
    targetId: 'tour-target-profile',
    title: 'Your Profile',
    description: 'View your profile, manage plans, game coins, and wallet.',
    position: 'bottom',
  },
  {
    id: 'join-game',
    targetId: 'tour-target-join-game',
    title: 'Join a Game',
    description: 'Find and join skill-based games with other players.',
    position: 'bottom',
  },
  {
    id: 'kids-academy',
    targetId: 'tour-target-academy-card',
    title: 'Kids Academy',
    description: 'Enroll your kids in sports programs and track their progress.',
    position: 'bottom',
  },
  {
    id: 'coaching',
    targetId: 'tour-target-coaching-card',
    title: 'Book Coaching',
    description: 'Book group coaching sessions and 1-on-1 personal training.',
    position: 'top',
  },
  {
    id: 'swimming',
    targetId: 'tour-target-swimming-card',
    title: 'Go Swimming',
    description: 'Book lap swimming sessions at pools near you.',
    position: 'top',
  },
  {
    id: 'court-turf',
    targetId: 'tour-target-turf-card',
    title: 'Book Court/Turf',
    description: 'Reserve courts and turfs for your games.',
    position: 'top',
  },
  {
    id: 'workout',
    targetId: 'tour-target-workout-card',
    title: 'Book Workout',
    description: 'Schedule gym sessions to stay active.',
    position: 'top',
  },
  {
    id: 'nav-home',
    targetId: 'tour-target-nav-home',
    title: 'Home',
    description: 'Your main hub for all activities and bookings.',
    position: 'top',
  },
  {
    id: 'nav-book',
    targetId: 'tour-target-nav-book',
    title: 'Book',
    description: 'Schedule games, coaching sessions, and events.',
    position: 'top',
  },
  {
    id: 'nav-coaching',
    targetId: 'tour-target-nav-coaching',
    title: 'Your Coaching',
    description: 'View your coaching progress, assessments, and upcoming sessions.',
    position: 'top',
  },
  {
    id: 'nav-academy',
    targetId: 'tour-target-nav-academy',
    title: 'Kids Academy',
    description: 'Book classes, view assessments, and manage your kids\' sessions.',
    position: 'top',
  },
];

interface AppFeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  steps?: TourStep[];
  startWithWhatsNew?: boolean;
}

export function AppFeatureTour({
  isOpen,
  onClose,
  onComplete,
  steps = DEFAULT_TOUR_STEPS,
  startWithWhatsNew = true,
}: AppFeatureTourProps) {
  const [showWhatsNew, setShowWhatsNew] = useState(startWithWhatsNew);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStepIndex];
  const isLast = currentStepIndex === steps.length - 1;

  // Update target rect when current step changes or on resize
  const updateTargetRect = useCallback(() => {
    if (showWhatsNew || !step) {
      setTargetRect(null);
      return;
    }
    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      // Ensure element is in view
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setTargetRect(null);
    }
  }, [showWhatsNew, step]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, showWhatsNew, currentStepIndex, updateTargetRect]);

  if (!isOpen) return null;

  const handleStartTour = () => {
    hapticTap();
    setShowWhatsNew(false);
    setCurrentStepIndex(0);
  };

  const handleNext = () => {
    hapticTap();
    if (isLast) {
      hapticSuccess();
      try {
        localStorage.setItem('has_seen_app_tour', 'true');
      } catch {}
      onComplete?.();
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    hapticTap();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    hapticTap();
    try {
      localStorage.setItem('has_seen_app_tour', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none font-sans">
      
      {/* 1. Backdrop Overlay with Dimming */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-all duration-300" />

      {/* 2. Spotlight Cutout Hole around Target Element */}
      {targetRect && !showWhatsNew && (
        <div
          className="absolute border-2 border-[#E2F84F] rounded-2xl transition-all duration-300 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] z-10"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* ================= MODAL 1: WHAT'S NEW INTRO (IMG_1088) ================= */}
      {showWhatsNew && (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-20 animate-fade-in">
          <div className="w-full max-w-[340px] bg-[#16181A] text-white rounded-[26px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center">
            <h3 className="text-[20px] font-[800] tracking-tight text-white mb-2">
              What's New
            </h3>
            <p className="text-[13px] text-white/70 leading-relaxed font-normal mb-6">
              We've updated the app with new features. Let us show you around!
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 h-12 rounded-xl bg-[#2A2D30] text-white font-[700] text-[14px] active:scale-95 transition cursor-pointer hover:bg-[#32363A]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleStartTour}
                className="flex-1 h-12 rounded-xl bg-[#E2F84F] text-[#111315] font-[800] text-[14px] active:scale-95 transition cursor-pointer hover:bg-[#D4EA40] shadow-[0_4px_14px_rgba(226,248,79,0.3)]"
              >
                Let's Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: INTERACTIVE STEP TOOLTIP CARD (IMG_1089 - IMG_1099) ================= */}
      {!showWhatsNew && step && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center p-5 z-30">
          <div
            className="w-full max-w-[340px] bg-[#1E2124] text-white rounded-[24px] p-5 border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.9)] pointer-events-auto transition-all duration-300 animate-fade-in relative"
            style={{
              marginTop: step.position === 'top' ? '-100px' : step.position === 'bottom' ? '120px' : '0px',
            }}
          >
            {/* Header with Title & Close (X) */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[17px] font-[800] tracking-tight text-white">
                {step.title}
              </h4>
              <button
                type="button"
                onClick={handleSkip}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description Body */}
            <p className="text-[13px] text-white/75 leading-relaxed font-normal mb-5">
              {step.description}
            </p>

            {/* Navigation Actions (Previous & Next / Got it) */}
            <div className="flex gap-2.5">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 h-11 rounded-xl bg-[#2E3236] text-white font-[700] text-[13px] active:scale-95 transition cursor-pointer hover:bg-[#383D42]"
                >
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 h-11 rounded-xl bg-[#2E3236] text-white/70 font-[700] text-[13px] active:scale-95 transition cursor-pointer hover:bg-[#383D42]"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 h-11 rounded-xl bg-[#E2F84F] text-[#111315] font-[800] text-[13px] active:scale-95 transition cursor-pointer hover:bg-[#D4EA40] shadow-[0_4px_12px_rgba(226,248,79,0.25)] flex items-center justify-center gap-1"
              >
                <span>{isLast ? 'Got it' : 'Next'}</span>
              </button>
            </div>

            {/* Step Indicator Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-4">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#E2F84F]'
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
