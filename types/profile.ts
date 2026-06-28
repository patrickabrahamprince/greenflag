// /types/profile.ts

export interface Photo {
  id: string;
  url: string;
  position: number;
  is_primary: boolean;
}

export interface Like {
  id: string;
  from_user_id: string;
  name: string;
  age: number;
  photo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  role: 'guest' | 'host';
  name: string;
  age: number;
  city: string | null;
  city_auto?: string | null;
  lat?: number | null;
  lng?: number | null;
  bio: string | null;
  interests?: string[];
  looking_for_interests?: string[];
  instagram_handle?: string | null;
  is_active?: boolean;
  created_at?: string;
  photos: Photo[];
}
