export interface User {
  id: string;
  name: string;
  age: number | null;
  gender?: string | null;
  persona: string;
  blur_key?: string | null;
  state?: string | null;
  city: string | null;
  photos: string[] | null;
  interests?: string[] | null;
  interests_have?: string[] | null;
  intent?: string | null;
  travel_style?: string[] | null;
  languages?: string[] | null;
  green_score?: number | null;
  trips_hosted?: number | null;
  trips_joined?: number | null;
  govt_id_verified?: boolean | null;
  face_verified?: boolean | null;
  phone_verified?: boolean | null;
  bio?: string | null;
  job?: string | null;
  college?: string | null;
  hometown?: string | null;
  height_cm?: number | null;
  drinking?: string | null;
  smoking?: string | null;
  zodiac?: string | null;
  pets?: string | null;
  workout?: string | null;
  education_level?: string | null;
  family_plans?: string | null;
  communication_style?: string | null;
  anthem_title?: string | null;
  anthem_artist?: string | null;
  teaser_prompt?: string | null;
  teaser_answer?: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  review_started_at?: string | null;
  onboarding_completed?: boolean | null;
  push_primer_shown?: boolean | null;
  looking_for?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
  is_admin?: boolean;
}

export type Profile = User;

export interface Connection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
  other_user?: User;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read?: boolean;
}

export interface CoinBalance {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string | null;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount_inr: number | null;
  coins: number;
  type: string;
  created_at: string | null;
}

export interface ModQueueItem {
  id: string;
  submission_id: string;
  reported_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type TripVibe =
  | 'Chill'
  | 'Trek'
  | 'Backpacking'
  | 'Party'
  | 'Roadtrip'
  | 'Workcation'
  | 'Beach'
  | 'Camping'
  | 'Foodie'
  | 'Festival'
  | 'Heritage'
  | 'Adventure'
  | 'Daytrip'
  | string;

export type FlagColor = 'green' | 'pink'; // 🟢 Green = Travel Buddy, 💗 Pink = Travel Date
export type TripLadderLevel = 1 | 2 | 3; // 1: Micro Date, 2: Day Date, 3: Getaway Date
export type TripType = 'micro_date' | 'day_date' | 'getaway_date';

export interface CostSplitBreakdown {
  fuel: number;
  stay: number;
  food: number;
  per_person: number;
  total?: number;
}

export interface PlaceLocation {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  is_public: boolean;
}

export interface HostPassport {
  green_score: number; // e.g. 4.9
  trips_hosted: number;
  trips_joined: number;
  on_time_count: number;
  safe_count: number;
  face_verified: boolean;
  govt_id_verified: boolean;
  badges?: string[];
}

export interface TripHost {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  photos?: string[] | null;
  persona?: string;
  blur_key?: string | null;
  verified?: boolean;
  passport?: HostPassport;
}

export interface TripQAItem {
  id: string;
  user_name: string;
  user_photo?: string;
  user_avatar?: string;
  question: string;
  answer?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  host_id?: string;
  destination: string;
  state?: string;
  start_date: string;
  end_date?: string;
  vibe: TripVibe;
  budget_per_day: number;
  spots_available: number;
  spots_total: number;
  female_only?: boolean;
  description?: string;
  stay_type?: string;
  transport_type?: string;
  status?: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  host?: TripHost;
  user_request_status?: 'pending' | 'accepted' | 'declined' | 'expired' | null;
  requests_count?: number;
  // GreenFlag Travel Dating & Trust Ladder extensions:
  flag_color?: FlagColor;
  ladder_level?: TripLadderLevel;
  trip_type?: TripType;
  cost_split?: CostSplitBreakdown;
  location?: PlaceLocation;
  why_match?: string | string[];
  qa_items?: TripQAItem[];
  live_activity_active?: boolean;
  expires_in_hours?: number;
  host_green_score?: number;
  host_verified?: boolean;
  vibe_tags?: string[];
  languages?: string[];
}

export interface TripRequest {
  id: string;
  trip_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  intro_note?: string;
  intent?: FlagColor;
  created_at: string;
  expires_at?: string;
  applicant?: TripHost;
  trip?: Trip;
}

export interface TripRatingSubmission {
  trip_id: string;
  to_user_id: string;
  showed_up: boolean;
  safety_score: number; // 1-5
  tags: string[]; // 'On-Time', 'Good Listener', 'Great Vibe', 'Safe Driver'
  spark: boolean; // 💖 Secret Spark
}

export interface SparkMatch {
  id: string;
  user_id: string;
  user_name: string;
  user_photo: string;
  trip_destination: string;
  trip_date: string;
  is_mutual: boolean;
  unlocked: boolean;
}
