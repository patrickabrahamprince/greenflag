CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention TEXT NOT NULL,
  day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 8),
  task_type TEXT NOT NULL CHECK (task_type IN ('photo', 'video', 'voice', 'location')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  verification_hint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intention, day_number)
);

ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_templates_public_read" ON public.task_templates FOR SELECT USING (true);

-- Seed 64 templates (8 per intention: Fitness, Travel, Food, Reading, Yoga, Movies, Music, Pets)
INSERT INTO public.task_templates (intention, day_number, task_type, title, description, verification_hint) VALUES
-- Fitness
('Fitness', 1, 'photo', 'Hydration Check', 'Photo of your water bottle with timestamp', 'Must show water bottle'),
('Fitness', 2, 'photo', 'Gym Selfie', 'Gym Selfie with timestamp to prove you showed up', 'Must be taken inside/near gym'),
('Fitness', 3, 'voice', 'Workout Routine', 'Voice note describing your current workout routine', 'Describe at least 3 exercises'),
('Fitness', 4, 'photo', '10K Steps', 'Screenshot of step counter showing 10,000+ steps', 'Must show date and step count'),
('Fitness', 5, 'photo', 'Healthy Meal', 'Photo of your high-protein meal today', 'Must show plate with healthy food'),
('Fitness', 6, 'video', 'Morning Stretch', '15-second video of your daily morning stretch routine', 'Show at least two stretch positions'),
('Fitness', 7, 'photo', 'Active Log', 'Screenshot of your fitness tracker activity log for today', 'Show workout duration'),
('Fitness', 8, 'photo', 'Progress Selfie', 'Post-workout progress selfie with timestamp', 'Selfie with timestamp'),

-- Travel
('Travel', 1, 'photo', 'Passport Ready', 'Photo of your passport cover or packing list', 'Show passport cover or checklist'),
('Travel', 2, 'voice', 'Dream Destination', 'Voice note sharing your dream destination and why', 'Speak for at least 15 seconds'),
('Travel', 3, 'photo', 'Past Trip Memory', 'Photo from a previous trip with location details', 'Share a scenic trip photo'),
('Travel', 4, 'photo', 'Luggage Prep', 'Photo of your packed bag or travel gear ready to go', 'Show backpack or suitcase'),
('Travel', 5, 'voice', 'Crazy Travel Story', 'Voice note telling your craziest travel experience', 'Tell a brief travel story'),
('Travel', 6, 'location', 'Favorite Local Spot', 'Share a map pin of your favorite local hangout spot', 'Drop a map pin of the location'),
('Travel', 7, 'photo', 'Travel Souvenir', 'Photo of a souvenir or item you bought while traveling', 'Show the souvenir object'),
('Travel', 8, 'photo', 'Travel Vibe Selfie', 'Selfie showing your best travel outfit or gear', 'Selfie with travel theme'),

-- Food
('Food', 1, 'photo', 'Morning Brew', 'Photo of your morning coffee or tea setup', 'Show cup of coffee or tea'),
('Food', 2, 'photo', 'Meal Prep', 'Photo of your kitchen setup or meal prep ingredients', 'Show fresh ingredients or prepped boxes'),
('Food', 3, 'voice', 'Fav Cheat Meal', 'Voice note describing your absolute favorite cheat meal', 'Describe the meal and why you love it'),
('Food', 4, 'photo', 'Grocery Haul', 'Photo of your grocery cart or basket containing fresh food', 'Show bag of groceries'),
('Food', 5, 'voice', 'Secret Recipe', 'Voice note sharing a simple secret cooking tip or recipe', 'Explain the cooking tip'),
('Food', 6, 'photo', 'Delicious Dish', 'Photo of a dish you cooked or ordered today', 'Show the final plated dish'),
('Food', 7, 'video', 'Kitchen Tour', '15-second video tour of your spice rack or pantry setup', 'Short panning video of pantry'),
('Food', 8, 'photo', 'Foodie Selfie', 'Selfie of you enjoying your favorite meal today', 'Selfie while eating or at table'),

-- Reading
('Reading', 1, 'photo', 'Book Stack', 'Photo of a stack of books you plan to read next', 'Show at least 3 book spines'),
('Reading', 2, 'photo', 'Current Page', 'Photo of the cover or a page from your current read', 'Show book cover or open page'),
('Reading', 3, 'voice', 'Book Recommendation', 'Voice note explaining why everyone should read your favorite book', 'Share the title and main takeaway'),
('Reading', 4, 'photo', 'Reading Nook', 'Photo of your cozy reading space or bookshelf', 'Show bookshelves or reading corner'),
('Reading', 5, 'voice', 'Fav Author', 'Voice note about your favorite author and their best work', 'Speak about the author'),
('Reading', 6, 'photo', 'Highlight Snippet', 'Photo of a highlighted passage or quote that inspired you', 'Show book page with highlighted text'),
('Reading', 7, 'photo', 'Bookstore Visit', 'Photo from a local bookstore or library you visited today', 'Show bookshelves in library/store'),
('Reading', 8, 'photo', 'Reading Selfie', 'Selfie holding your favorite book with timestamp', 'Selfie with book'),

-- Yoga
('Yoga', 1, 'photo', 'Mat Setup', 'Photo of your yoga mat rolled out and ready', 'Show mat on floor'),
('Yoga', 2, 'photo', 'Comfort Wear', 'Photo of your favorite yoga/meditation outfit', 'Show yoga wear or gear'),
('Yoga', 3, 'voice', 'Zen Focus', 'Voice note describing your daily mindfulness or breathing focus', 'Talk about your focus'),
('Yoga', 4, 'video', 'Yoga Pose', '15-second video of you holding your favorite yoga pose', 'Short video holding the pose'),
('Yoga', 5, 'voice', 'Morning Intentions', 'Voice note sharing your morning gratitude or daily intentions', 'Share at least 2 intentions'),
('Yoga', 6, 'photo', 'Meditation Spot', 'Photo of your meditation cushion or quiet space', 'Show quiet cushion or corner'),
('Yoga', 7, 'photo', 'Stretch Progress', 'Photo of a flexibility stretch you practiced today', 'Show stretch pose'),
('Yoga', 8, 'photo', 'Post-Yoga Glow', 'Selfie showing your post-yoga glow with timestamp', 'Post-yoga selfie'),

-- Movies
('Movies', 1, 'photo', 'Watchlist Snippet', 'Screenshot of your current movie watchlist or list', 'Show your watchlist'),
('Movies', 2, 'photo', 'Show Ticket', 'Photo of a movie ticket or streaming play screen', 'Show ticket or TV screen'),
('Movies', 3, 'voice', 'Classic Review', 'Voice note review of a classic movie you think is overrated', 'Describe movie and critiques'),
('Movies', 4, 'photo', 'Movie Snacks', 'Photo of your movie-watching snack setup', 'Show popcorn or snacks'),
('Movies', 5, 'voice', 'Movie Quote', 'Voice note reciting your favorite movie dialogue in character', 'Recite the quote'),
('Movies', 6, 'photo', 'Cinema Poster', 'Photo of a movie poster or cover art you love', 'Show the poster image'),
('Movies', 7, 'photo', 'Comfort Zone', 'Photo of your TV/projector setup for movie nights', 'Show streaming screen/projector'),
('Movies', 8, 'photo', 'Watching Selfie', 'Selfie of you watching a movie with timestamp', 'Selfie with movie screen'),

-- Music
('Music', 1, 'photo', 'Playlist Mix', 'Screenshot of your current favorite playlist on Spotify or Apple Music', 'Show playlist name and tracks'),
('Music', 2, 'photo', 'Fav Album', 'Photo of an album cover, vinyl, or CD you love', 'Show the album art'),
('Music', 3, 'voice', 'Sing Along', 'Voice note singing or humming 10 seconds of a song', 'Hum or sing a melody'),
('Music', 4, 'photo', 'Gear Check', 'Photo of your headphones, speaker, or instrument setup', 'Show headphones or instrument'),
('Music', 5, 'voice', 'Best Concert', 'Voice note sharing your best live concert memory', 'Describe the concert experience'),
('Music', 6, 'photo', 'Handwritten Lyrics', 'Photo of your favorite song lyrics written down on paper', 'Show handwritten lyrics'),
('Music', 7, 'photo', 'Now Playing', 'Screenshot of the song you currently have on repeat', 'Show now playing track'),
('Music', 8, 'photo', 'Melody Selfie', 'Selfie of you wearing headphones or listening to music', 'Selfie with music gear'),

-- Pets
('Pets', 1, 'photo', 'Pet Portrait', 'Photo of your pet or favorite animal', 'Show the pet/animal photo'),
('Pets', 2, 'photo', 'Toy Pile', 'Photo of your pet''s favorite toys or accessories', 'Show pet toys'),
('Pets', 3, 'voice', 'Pet Intro', 'Voice note introducing your pet, their name, and personality', 'Speak about your pet'),
('Pets', 4, 'location', 'Walk Route', 'Share a map pin of your daily dog walk route', 'Map pin of walk location'),
('Pets', 5, 'voice', 'Funny Pet Moment', 'Voice note telling the funniest thing your pet has done', 'Share the funny story'),
('Pets', 6, 'photo', 'Pet Treat', 'Photo of your pet enjoying a treat or meal', 'Show pet eating treat'),
('Pets', 7, 'photo', 'Sleeping Pet', 'Photo of your pet sleeping in an adorable pose', 'Show sleeping pet'),
('Pets', 8, 'photo', 'Pet Selfie', 'Selfie of you and your pet together with timestamp', 'Selfie with pet')
ON CONFLICT (intention, day_number) DO NOTHING;
