-- =====================================================
-- Seed: 3-day matchmaking game intentions
-- Replace 'your-standard-id-here' with the woman's
-- standard_id from the standards table before running.
-- =====================================================

-- Clear old 8-day intentions
DELETE FROM intentions WHERE standard_id = 'your-standard-id-here';

-- Day 1: Break the ice
INSERT INTO intentions (standard_id, day_number, task_number, prompt) VALUES
('your-standard-id-here', 1, 1, 'Task 1: Send a 30-second voice note. What made you smile today?'),
('your-standard-id-here', 1, 2, 'Task 2: Share a photo of your favorite corner in your home.'),
('your-standard-id-here', 1, 3, 'Task 3: Write 50 words: What does a perfect Sunday look like to you?');

-- Day 2: Show depth
INSERT INTO intentions (standard_id, day_number, task_number, prompt) VALUES
('your-standard-id-here', 2, 1, 'Task 1: Voice note — tell me about a book that changed how you think.'),
('your-standard-id-here', 2, 2, 'Task 2: Photo — show me something you created with your hands.'),
('your-standard-id-here', 2, 3, 'Task 3: Write 100 words: What value do you refuse to compromise on?');

-- Day 3: Get vulnerable
INSERT INTO intentions (standard_id, day_number, task_number, prompt) VALUES
('your-standard-id-here', 3, 1, 'Task 1: Voice note — share a fear you are working to overcome.'),
('your-standard-id-here', 3, 2, 'Task 2: Photo — a place that makes you feel at peace.'),
('your-standard-id-here', 3, 3, 'Task 3: Write 150 words: Describe a moment you felt truly understood by someone.');
