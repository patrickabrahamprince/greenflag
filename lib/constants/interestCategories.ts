export interface InterestCategory {
  category: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    category: 'Creativity',
    items: [
      'Poetry', 'Sneakers', 'Freelancing', 'Photography', 'Language Exchange',
      'Cosplay', 'Content Creation', 'Tattoos', 'Painting', 'Entrepreneurship',
      'Dancing', 'Singing', 'Investing', 'Choir', 'Vintage fashion', 'Acapella',
      'Musical Instrument', 'Musical Writing', 'Writing', 'Literature', 'NFTs',
      'Exchange Program', 'Art', 'Real Estate', 'Drawing', 'Fashion', 'DIY',
      'Upcycling', 'Blogging',
    ],
  },
  {
    category: 'Fan favorites',
    items: [
      '90s Kid', 'Comic-con', 'Harry Potter', 'NBA', 'MLB', 'Manga', 'Marvel',
      'Dungeons & Dragons', 'Disney',
    ],
  },
  {
    category: 'Food and drink',
    items: [
      'Maggi', 'Biryani', 'Sushi', 'Foodie', 'Food tours', 'Street Food',
      'Plant-based', 'Boba tea', 'Sweet treats', 'Mocktails', 'Brunch',
      'Cocktails', 'Ice Cream', 'Coffee', 'Ramen', 'Korean Food', 'BBQ',
      'Craft Beer', 'Tea', 'Pho', 'Wine', 'Açaí',
    ],
  },
  {
    category: 'Gaming',
    items: [
      'Ludo', 'E-Sports', 'PlayStation', 'Fortnite', 'Among Us', 'Atari',
      'Xbox', 'League of Legends', 'Nintendo', 'Roblox',
    ],
  },
  {
    category: 'Going out',
    items: [
      'Festivals', 'Stand up Comedy', 'Escape Rooms', 'Bars', 'Thrifting',
      'Museums', 'Raves', 'Drive-in Cinema', 'Musical theater', 'Aquarium',
      'Cars', 'Exhibition', 'Shopping', 'House Parties', 'Theater', 'Pub Quiz',
      'Bowling', 'Motorcycles', 'Film Festival', 'Shisha', 'Happy hour',
      'Karaoke', 'Nightlife', 'Art galleries', 'Live Music', 'Bar Hopping',
      'Parties', 'Pubs', 'Rollerskating', 'Concerts', 'Town Festivities',
      'Cafe hopping', 'Clubbing',
    ],
  },
  {
    category: 'Music',
    items: [
      'Bhangra', 'K-Pop', 'Gospel music', 'Music bands', 'Rock music',
      'Soul music', 'Pop music', 'Punk rock', 'Jazz', 'House music', 'EDM',
      'R&B', 'Opera', 'Indie music', 'Alternative music', 'Techno',
      'Folk music', 'Latin music', 'Rap music', 'Heavy Metal', 'Funk music',
      'Grime', '90s Britpop', 'Hip Hop', 'J-Pop', 'Reggaeton',
      'Country Music', 'Electronic Music', 'Trap Music', 'Music',
    ],
  },
  {
    category: 'Outdoors and adventure',
    items: [
      'Road Trips', 'Diving', 'Jetskiing', 'Nature', 'Walking tours', 'Rowing',
      'Walking My Dog', 'Travel', 'Paddle Boarding', 'Surfing', 'Beach Bars',
      'Paragliding', 'Skiing', 'Snowboarding', 'Couchsurfing', 'Free Diving',
      'Sailing', 'Hiking', 'Mountains', 'Fishing', 'Rock Climbing', 'Camping',
      'Picnicking', 'Outdoors', 'Canoeing', 'Backpacking', 'Hot Springs',
    ],
  },
  {
    category: 'Social and content',
    items: [
      'Instagram', 'X', 'SoundCloud', 'Spotify', 'Pinterest', 'Social Media',
      'Memes', 'Metaverse', 'Vlogging', 'YouTube', 'Virtual Reality',
      'Podcasts', 'TikTok', 'Twitch', 'Netflix',
    ],
  },
  {
    category: 'Sports and fitness',
    items: [
      'Freeletics', 'Cricket', 'Ice Hockey', 'Sports Shooting', 'Athletics',
      'Walking', 'Skating', 'Beach sports', 'Fitness classes', 'Sports',
      'Gymnastics', 'Hockey', 'Basketball', 'Running', 'Rugby', 'Boxing',
      'Pole Dancing', 'Car Racing', 'Motor Sports', 'Padel', 'Equestrian',
      'Soccer', 'Gym', 'Skateboarding', 'Football', 'Tennis', 'Pilates',
      'Cheerleading', 'Jogging', 'Archery', 'Crossfit', 'Weightlifting',
      'Wrestling', 'Marathon', 'Martial Arts', 'Volleyball', 'Climbing',
      'Cycling', 'Swimming', 'Table Tennis', 'Working out', 'Baseball',
      'Badminton',
    ],
  },
  {
    category: 'Staying in',
    items: [
      'Reading', 'Home Workout', 'Binge-Watching TV shows', 'Cooking',
      'Gardening', 'Online Games', 'Online Shopping', 'Board Games', 'Trivia',
      'Baking',
    ],
  },
  {
    category: 'TV and movies',
    items: [
      'Action movies', 'Animated movies', 'Crime shows', 'Fantasy movies',
      'Documentaries', 'Drama shows', 'Rom-coms', 'Sports shows',
      'Thriller films', 'K-drama shows', 'Indie films', 'Reality TV',
      'Movies', 'Horror Movies', 'Sci-Fi', 'Bollywood', 'Anime', 'Comedy',
    ],
  },
  {
    category: 'Values and causes',
    items: [
      'Activism', 'Equality', 'Social Development', 'Human Rights',
      'LGBTQIA+ Rights', 'Feminism', 'Black Lives Matter', 'Inclusivity',
      'Voter Rights', 'Climate Change', 'World Peace', 'Pride',
      'Youth Empowerment', 'Politics', 'Disability Rights', 'Volunteering',
      'Environmentalism', 'Mental Health Awareness',
    ],
  },
  {
    category: 'Wellness and lifestyle',
    items: [
      'Self Love', 'Trying New Things', 'Spa', 'Self Care', 'Meditation',
      'Tarot', 'Astrology', 'Skincare', 'Self Development', 'Mindfulness',
      'Makeup', 'Sauna', 'Active Lifestyle', 'Yoga',
    ],
  },
];

// "What Defines You" used to render all 13 categories on one endless
// scroll during onboarding -- split into 3 roughly-even chunks (by
// category count, categories don't subdivide) so each onboarding screen
// shows a manageable slice instead. Order matches INTEREST_CATEGORIES so
// picking up where a previous screen left off never skips or repeats one.
export const INTEREST_CATEGORIES_STEPS: InterestCategory[][] = [
  INTEREST_CATEGORIES.slice(0, 5),
  INTEREST_CATEGORIES.slice(5, 9),
  INTEREST_CATEGORIES.slice(9),
];
