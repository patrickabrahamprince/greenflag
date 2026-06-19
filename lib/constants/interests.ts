export const INTERESTS_MASTER = [
  'Books', 'Wine', 'Coffee', 'Travel', 'Gym', 'Yoga', 'Running',
  'Dogs', 'Cats', 'Music', 'Concerts', 'Movies', 'Art', 'Museums',
  'Tech', 'Startups', 'Finance', 'Cooking', 'Food', 'Fashion',
  'Photography', 'Hiking', 'Beach', 'Mountains', 'Meditation',
  'Spirituality', 'Politics', 'Comedy', 'Dancing', 'Singing',
  'Gaming', 'Crypto', 'Cars', 'Bikes', 'Cricket', 'Football', 'Tennis',
] as const;

export type Interest = (typeof INTERESTS_MASTER)[number];
