export type TaskTemplate = {
  title: string;
  instruction: string;
  time_estimate: '2 min' | '5 min' | '15 min';
  verification_method: 'photo' | 'voice' | 'video' | 'location';
  day_preference?: 1 | 5 | 8;
  category: 'intro' | 'effort' | 'vibe' | 'consistency';
}

export const INTENTION_CONFIG = [
  { id: 'Fitness', label: 'Fitness & Health', label_hi: 'Fitness aur Health', icon: '💪', color: '#EF4444' },
  { id: 'Travel', label: 'Travel Buddy', label_hi: 'Ghumakkad', icon: '✈️', color: '#3B82F6' },
  { id: 'Food', label: 'Foodie Dates', label_hi: 'Khaane ka Shaukeen', icon: '🍕', color: '#F59E0B' },
  { id: 'Reading', label: 'Book Lover', label_hi: 'Kitabon ka Shaukeen', icon: '📚', color: '#8B5CF6' },
  { id: 'Yoga', label: 'Yoga & Mindful', label_hi: 'Yoga aur Meditate', icon: '🧘', color: '#06B6D4' },
  { id: 'Movies', label: 'Movies & Shows', label_hi: 'Movies aur Shows', icon: '🎬', color: '#EC4899' },
  { id: 'Music', label: 'Music Lover', label_hi: 'Music Lover', icon: '🎵', color: '#F97316' },
  { id: 'Pets', label: 'Pet Parent', label_hi: 'Pet Lover', icon: '🐕', color: '#10B981' }
] as const;

export type IntentionId = typeof INTENTION_CONFIG[number]['id'];

export const TASK_POOL: Record<IntentionId, string[]> = {
  Fitness: ['Gym Selfie with timestamp','Hydration Check: Water bottle photo','Voice Note: Describe workout routine','10K Steps Screenshot','Protein Meal Photo','Morning Wakeup Video','Posture Check Video','Smartwatch Activity Log'],
  Travel: ['Passport Cover Photo','Voice Note: Dream destination','Last Trip Photo with location','Travel Bucket List Text','Local Cafe You Love - Photo','Map Pin of Favorite Spot','Suitcase Packing Timelapse','Airplane Window Selfie'],
  Food: ['Cooking Video: 15s clip','Favorite Dish Photo','Voice Note: Perfect date meal idea','Restaurant Bill Photo - blur amount','Coffee Art Photo','Grocery Haul Pic','Spice Rack Tour Video','Recipe Screenshot'],
  Reading: ['Bookshelf Photo','Currently Reading Cover','Voice Note: Book that changed you','Handwritten Notes Pic','Bookstore Selfie','Favorite Quote Screenshot','Library Card Photo','Voice: Recite a poem'],
  Movies: ['Movie Watchlist Screenshot','Cinema Ticket Photo','Streaming Setup Photo','Snack Review Photo','Voice Note: Movie Quote','Cinema Poster Photo','TV/Projector Setup Photo','Watching Selfie'],
  Music: ['Spotify Wrapped Screenshot','Voice Note: Sing 10s of fav song','Concert Ticket Photo','Playlist Screenshot','Instrument You Play - Photo','Vinyl/CD Collection Pic','Voice: Best concert memory','Headphones Selfie'],
  Yoga: ['Yoga Mat Setup Photo','Yoga/Meditation Outfit Photo','Voice Note: Mindfulness focus','Yoga Pose Video','Voice: Morning gratitude','Meditation Spot Photo','Flexibility Stretch Photo','Post-Yoga Glow Selfie'],
  Pets: ['Pet Portrait Photo','Pet Toys Photo','Voice Note: Pet personality','Dog Walk Route Screenshot','Pet Sleeping Photo','Vet Visit Bill Photo','Pet Toy Collection Photo','Pet Selfie Together']
};
