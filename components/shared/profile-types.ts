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
