export interface ProfileData {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  instagram_url?: string;
  interests: string[];
  looking_for_interests: string[];
  quiz_answers?: Record<string, string> | null;
  persona: string;
  gender: string;
  teaser_prompt?: string | null;
  teaser_answer?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  pets?: string | null;
  workout?: string | null;
  zodiac?: string | null;
  education_level?: string | null;
  family_plans?: string | null;
  communication_style?: string | null;
  anthem_title?: string | null;
  anthem_artist?: string | null;
}

export interface MatchInfo {
  percent: number;
  overlapping: string[];
  viewerIsHost: boolean;
}

export interface ConnectionInfo {
  id: string;
  status: string;
}
