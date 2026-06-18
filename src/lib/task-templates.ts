export type TaskTemplate = {
  title: string;
  instruction: string;
  time_estimate: '2 min' | '5 min' | '15 min';
  verification_method: 'photo' | 'voice' | 'video' | 'location';
  day_preference?: 1 | 5 | 8;
  category: 'intro' | 'effort' | 'vibe' | 'consistency';
}

export const INTENTION_CONFIG = [
  { id: 'fitness', label: 'Fitness & Health', label_hi: 'Fitness aur Health', icon: '💪', color: '#EF4444' },
  { id: 'travel', label: 'Travel Buddy', label_hi: 'Ghumakkad', icon: '✈️', color: '#3B82F6' },
  { id: 'foodie', label: 'Foodie Dates', label_hi: 'Khaane ka Shaukeen', icon: '🍕', color: '#F59E0B' },
  { id: 'books', label: 'Book Lover', label_hi: 'Kitabon ka Shaukeen', icon: '📚', color: '#8B5CF6' },
  { id: 'music', label: 'Music & Concerts', label_hi: 'Music Lover', icon: '🎵', color: '#EC4899' },
  { id: 'career', label: 'Career Driven', label_hi: 'Career Focused', icon: '💼', color: '#10B981' },
  { id: 'spiritual', label: 'Spiritual', label_hi: 'Adhyatmik', icon: '🧘', color: '#06B6D4' },
  { id: 'pet_lover', label: 'Pet Parent', label_hi: 'Pet Lover', icon: '🐕', color: '#F97316' }
] as const;

export type IntentionId = typeof INTENTION_CONFIG[number]['id'];

export const TASK_POOL: Record<IntentionId, string[]> = {
  fitness: ['Gym Selfie with timestamp','Hydration Check: Water bottle photo','Voice Note: Describe workout routine','10K Steps Screenshot','Protein Meal Photo','Morning Wakeup Video','Posture Check Video','Smartwatch Activity Log'],
  travel: ['Passport Cover Photo','Voice Note: Dream destination','Last Trip Photo with location','Travel Bucket List Text','Local Cafe You Love - Photo','Map Pin of Favorite Spot','Suitcase Packing Timelapse','Airplane Window Selfie'],
  foodie: ['Cooking Video: 15s clip','Favorite Dish Photo','Voice Note: Perfect date meal idea','Restaurant Bill Photo - blur amount','Coffee Art Photo','Grocery Haul Pic','Spice Rack Tour Video','Recipe Screenshot'],
  books: ['Bookshelf Photo','Currently Reading Cover','Voice Note: Book that changed you','Handwritten Notes Pic','Bookstore Selfie','Favorite Quote Screenshot','Library Card Photo','Voice: Recite a poem'],
  music: ['Spotify Wrapped Screenshot','Voice Note: Sing 10s of fav song','Concert Ticket Photo','Playlist Screenshot','Instrument You Play - Photo','Vinyl/CD Collection Pic','Voice: Best concert memory','Headphones Selfie'],
  career: ['Workspace Setup Photo','Voice Note: Career goal for 2025','LinkedIn Achievement Screenshot','Work Badge - blur details','Project You Proud Of - Pic','Morning Routine Video','Book You Read for Work','Voice: Advice to younger self'],
  spiritual: ['Meditation Spot Photo','Voice Note: What grounds you','Journal Page Pic - blur text','Sunrise/Sunset Selfie','Yoga Pose Video','Crystal/Incense Photo','Voice: Gratitude list','Nature Walk Photo'],
  pet_lover: ['Pet Selfie Together','Voice Note: Funniest pet story','Pet Food Bowl Photo','Walk Route Map Screenshot','Pet Sleeping Pic','Vet Visit Bill - blur details','Pet Toy Collection','Voice: Why you love pets']
};
