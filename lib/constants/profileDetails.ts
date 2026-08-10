// Fixed single-select option sets for the Lifestyle/Basics profile-detail
// fields (profiles.smoking/drinking/pets/workout/zodiac/education_level/
// family_plans/communication_style -- all plain TEXT columns, so a new
// option here never needs a migration).
import { Cigarette, Wine, PawPrint, Dumbbell, Moon, GraduationCap, Baby, MessageCircle, type LucideIcon } from 'lucide-react';

export const LIFESTYLE_OPTIONS = {
  smoking: ['Non-smoker', 'Smoker', 'Social smoker', 'Trying to quit'],
  drinking: ['Not for me', 'Sober', 'Sober curious', 'On special occasions', 'Socially', 'Most nights'],
  pets: ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Pet-free', 'All the pets', 'Other'],
  workout: ['Everyday', 'Often', 'Sometimes', 'Never'],
} as const;

export const BASICS_OPTIONS = {
  zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  education_level: ['High School', 'In College', 'Undergrad Degree', 'In Grad School', 'Masters Degree', 'PhD', 'Trade School'],
  family_plans: ['Want children', "Don't want children", 'Not sure yet', 'Have children'],
  communication_style: ['Big time texter', 'Phone caller', 'Video chatter', 'Bad texter back', 'Better in person'],
} as const;

export type LifestyleField = keyof typeof LIFESTYLE_OPTIONS;
export type BasicsField = keyof typeof BASICS_OPTIONS;

export const LIFESTYLE_LABELS: Record<LifestyleField, string> = {
  smoking: 'Smoking',
  drinking: 'Drinking',
  pets: 'Pets',
  workout: 'Workout',
};

export const BASICS_LABELS: Record<BasicsField, string> = {
  zodiac: 'Zodiac',
  education_level: 'Education',
  family_plans: 'Family Plans',
  communication_style: 'Communication Style',
};

export const LIFESTYLE_ICONS: Record<LifestyleField, LucideIcon> = {
  smoking: Cigarette,
  drinking: Wine,
  pets: PawPrint,
  workout: Dumbbell,
};

export const BASICS_ICONS: Record<BasicsField, LucideIcon> = {
  zodiac: Moon,
  education_level: GraduationCap,
  family_plans: Baby,
  communication_style: MessageCircle,
};

// Shared with /onboard/profile/teasers -- same bank, same
// teaser_prompt/teaser_answer columns, whether it's set for the first
// time during onboarding or edited afterward from /profile/edit/details.
export const TEASER_PROMPTS = [
  'The way to my heart is',
  'A random fact I love is',
  'My ideal Sunday looks like',
  'I get way too competitive about',
  'The best way to ask me out is',
  'I will never shut up about',
];
