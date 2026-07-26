// Question labels for onboarding quiz answers (profiles.quiz_answers), used
// wherever answers are displayed read-only (e.g. the profile view page).
// Keep ids in sync with app/(auth)/onboard/quiz/page.tsx's QUIZ_QUESTIONS --
// that file owns the full question+options shape for the interactive quiz,
// this file only needs the label for display.
export const QUIZ_QUESTION_LABELS: Record<string, string> = {
  relationship_goal: 'What brings you to Greenflag?',
  weekend_vibe: 'Your ideal Sunday?',
  love_language: 'How do you feel most loved?',
  first_date: 'Your ideal first encounter?',
  communication: 'How do you stay connected?',
  humor_style: 'Your humor?',
  ideal_trip: 'Where would you escape to?',
  pets: 'Pets?',
};

export const QUIZ_QUESTION_ORDER = Object.keys(QUIZ_QUESTION_LABELS);
