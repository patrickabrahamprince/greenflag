export const INTERESTS = [
  'Mindfulness', 'Dancing', 'Cats', 'Wine',
  'Gym', 'Hiking', 'Coffee', 'Art',
  'Cooking', 'Travel', 'Music', 'Reading',
  'Yoga', 'Photography', 'Movies', 'Gaming',
];

export const INTENTS = [
  'A long-term relationship',
  'Fun, casual dates',
  'Marriage',
];

export const PROMPTS = [
  'My simple pleasures...',
  'A random fact I love is...',
  'The best travel story I have...',
  'My go-to karaoke song...',
  'Two truths and a lie...',
  "I'm weirdly good at...",
];

export const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    photos: ['https://i.pravatar.cc/400?img=1', 'https://i.pravatar.cc/400?img=2', 'https://i.pravatar.cc/400?img=3'],
    bio: 'Love the outdoors and trying new coffee shops',
    interests: ['Hiking', 'Coffee', 'Art'],
  },
  {
    id: '2',
    name: 'Emily',
    age: 25,
    photos: ['https://i.pravatar.cc/400?img=5', 'https://i.pravatar.cc/400?img=6', 'https://i.pravatar.cc/400?img=7'],
    bio: 'Dancing through life one step at a time',
    interests: ['Dancing', 'Music', 'Travel'],
  },
  {
    id: '3',
    name: 'Jessica',
    age: 30,
    photos: ['https://i.pravatar.cc/400?img=9', 'https://i.pravatar.cc/400?img=10', 'https://i.pravatar.cc/400?img=11'],
    bio: 'Cat mom and wine enthusiast',
    interests: ['Cats', 'Wine', 'Cooking'],
  },
  {
    id: '4',
    name: 'Ashley',
    age: 27,
    photos: ['https://i.pravatar.cc/400?img=13', 'https://i.pravatar.cc/400?img=14', 'https://i.pravatar.cc/400?img=15'],
    bio: 'Gym rat looking for a workout buddy',
    interests: ['Gym', 'Mindfulness', 'Yoga'],
  },
  {
    id: '5',
    name: 'Megan',
    age: 26,
    photos: ['https://i.pravatar.cc/400?img=17', 'https://i.pravatar.cc/400?img=18', 'https://i.pravatar.cc/400?img=19'],
    bio: 'Bookworm and weekend adventurer',
    interests: ['Reading', 'Hiking', 'Photography'],
  },
];

export const MOCK_MATCHES = [
  { id: '1', name: 'Sarah', avatar: 'https://i.pravatar.cc/400?img=1', lastMessage: "Hey! How are you?", time: '2m ago', isNew: true },
  { id: '2', name: 'Emily', avatar: 'https://i.pravatar.cc/400?img=5', lastMessage: 'That sounds fun!', time: '1h ago', isNew: false },
  { id: '3', name: 'Jessica', avatar: 'https://i.pravatar.cc/400?img=9', lastMessage: 'Haha totally!', time: '3h ago', isNew: true },
  { id: '4', name: 'Ashley', avatar: 'https://i.pravatar.cc/400?img=13', lastMessage: 'See you tomorrow!', time: '1d ago', isNew: false },
  { id: '5', name: 'Megan', avatar: 'https://i.pravatar.cc/400?img=17', lastMessage: 'Great meeting you', time: '2d ago', isNew: false },
];

export const MOCK_LIKES = [
  { id: '1', name: 'Sophia', age: 27, photo: 'https://i.pravatar.cc/400?img=21' },
  { id: '2', name: 'Olivia', age: 26, photo: 'https://i.pravatar.cc/400?img=22' },
  { id: '3', name: 'Isabella', age: 29, photo: 'https://i.pravatar.cc/400?img=23' },
  { id: '4', name: 'Mia', age: 25, photo: 'https://i.pravatar.cc/400?img=24' },
  { id: '5', name: 'Charlotte', age: 28, photo: 'https://i.pravatar.cc/400?img=25' },
  { id: '6', name: 'Amelia', age: 27, photo: 'https://i.pravatar.cc/400?img=26' },
];

export const MOCK_MESSAGES = [
  { id: '1', text: "Hey! How are you?", sender: 'them', time: '10:30 AM' },
  { id: '2', text: "I'm great, thanks! How about you?", sender: 'me', time: '10:32 AM' },
  { id: '3', text: 'Doing well! Want to grab coffee sometime?', sender: 'them', time: '10:33 AM' },
  { id: '4', text: "I'd love that!", sender: 'me', time: '10:35 AM' },
];
