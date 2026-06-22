export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  job?: string;
  height?: string;
  city_auto?: string;
  interests: string[];
  looking_for_interests: string[];
  match_percent: number;
  distance_km: number;
  last_active: string;
}

export interface ProfileView {
  profile: {
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
    persona: string;
    gender: string;
  };
  match: {
    percent: number;
    overlapping: string[];
    viewerIsHost: boolean;
  } | null;
  connection: {
    id: string;
    status: string;
  } | null;
  isOwnProfile: boolean;
}
