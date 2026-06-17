export type TaskTemplate = {
  title: string;
  instruction: string;
  time_estimate: '2 min' | '5 min' | '15 min';
  verification_method: 'photo' | 'voice' | 'video' | 'location';
  day_preference?: 1 | 5 | 8;
  category: 'intro' | 'effort' | 'vibe' | 'consistency';
}

export const TASK_BANK: Record<string, TaskTemplate[]> = {
  'Bookworm': [
    {
      title: 'Current Read',
      instruction: 'Photo of the book you are reading right now. Show cover and page number you are on.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Bookstore Walk',
      instruction: 'Voice note: 30s on the last book that changed how you think. No spoilers.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Handwritten Quote',
      instruction: 'Write your favorite quote on paper, sign your first name, photo it. Natural light only.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Library Location',
      instruction: 'Photo at your local library or bookstore. Show building name or bookshelf. No home address visible.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'vibe'
    },
    {
      title: 'Book Rec Voice',
      instruction: '45s voice note: Recommend me 1 book and tell me why I would like it based on my Standard.',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'effort'
    }
  ],

  'Gym Rat': [
    {
      title: 'Date Stamp Selfie',
      instruction: 'Gym selfie today. Your phone lockscreen showing date must be visible in frame.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'consistency'
    },
    {
      title: 'Post-Workout Check-in',
      instruction: '30s voice note right after workout: What did you train and 1 win from the session?',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Meal Prep Proof',
      instruction: 'Photo of your meal prep for this week. Show at least 3 containers. No restaurants.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Morning Routine',
      instruction: 'Selfie between 6-9am. Natural light, no filter. Show you are up.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'consistency'
    },
    {
      title: 'Form Check Video',
      instruction: '10s video of 1 exercise. Any lift. Shows effort, not physique.',
      time_estimate: '5 min',
      verification_method: 'video',
      category: 'effort'
    }
  ],

  'Foodie': [
    {
      title: 'Coffee Shop Find',
      instruction: 'Photo of your coffee today at a local cafe. Show the cup and table. No chains like Starbucks.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Cook With Voice',
      instruction: '45s voice note: Describe the last meal you cooked from scratch. What was the hardest step?',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Market Haul',
      instruction: 'Photo at a vegetable market or grocery. Show your basket with 3+ fresh items.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Plating Skill',
      instruction: 'Photo of a meal you plated yourself. No takeout packaging visible.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'effort'
    },
    {
      title: 'Street Food Pick',
      instruction: 'Location photo at your favorite street food stall. Show the stall name. Daytime only for safety.',
      time_estimate: '15 min',
      verification_method: 'photo',
      category: 'vibe'
    }
  ],

  'Ambitious': [
    {
      title: 'Workspace Intro',
      instruction: 'Photo of your desk or workspace. Show 1 item that represents your work. No company logos.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Win of the Week',
      instruction: '60s voice note: Share 1 professional win from this week. What did you learn?',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: '5am Club Proof',
      instruction: 'Selfie at 5-6am with newspaper or phone showing date/time. Natural light only.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'consistency'
    },
    {
      title: 'Book That Built You',
      instruction: 'Photo of 1 business/self-dev book. Handwrite your name on sticky note on cover for proof.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'vibe'
    },
    {
      title: 'Goal Setting Voice',
      instruction: '45s voice note: What is 1 goal you will hit in next 90 days? Be specific.',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'effort'
    }
  ],

  'Traveler': [
    {
      title: 'Last Trip Photo',
      instruction: 'Photo from your last trip. Must be you in frame. No stock images.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Travel Story',
      instruction: '60s voice note: Tell me about 1 travel moment that changed your perspective.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Local Explore',
      instruction: 'Photo at 1 landmark in your city. Act like a tourist. Show building name.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Passport Stamp',
      instruction: 'Photo of 1 passport stamp page. Cover personal numbers with finger.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'vibe'
    },
    {
      title: 'Next Destination',
      instruction: 'Voice note 30s: Where do you want to go next and why? Name 1 specific place.',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'vibe'
    }
  ],

  'Night Owl': [
    {
      title: 'Late Night Read',
      instruction: 'Photo of what you do past midnight. Book, music, work. Show timestamp.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: '3am Thought',
      instruction: 'Voice note 30s: Your best late-night idea or thought. Raw, no editing.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Night Routine',
      instruction: 'Video 15s: Show your nighttime wind-down ritual. No face needed, just the vibe.',
      time_estimate: '5 min',
      verification_method: 'video',
      category: 'consistency'
    },
    {
      title: 'Sunset to Sunrise',
      instruction: 'Photo at sunset AND sunrise on the same day. Collage. Shows your 24h.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Midnight Snack',
      instruction: 'Photo of your go-to midnight snack. Bonus points if homemade.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'vibe'
    }
  ],

  'Early Bird': [
    {
      title: '5am Club Check',
      instruction: 'Selfie before 6am with phone showing date/time. Natural light only.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'consistency'
    },
    {
      title: 'Morning Routine Voice',
      instruction: '45s voice note: Walk me through your morning routine from wake-up to 8am.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Sunrise Photo',
      instruction: 'Photo of sunrise from your window or outside. Show the sky.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'intro'
    },
    {
      title: 'First Hour Log',
      instruction: 'Screenshot of screen time or journal: What did you do in the first hour today?',
      time_estimate: '5 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'consistency'
    },
    {
      title: 'Three Birds',
      instruction: 'Voice note 30s: Name 3 things you accomplished before 9am today.',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'effort'
    }
  ],

  'Creative': [
    {
      title: 'Last Creation',
      instruction: 'Photo of something you created recently. Art, code, design, writing, music.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Process Voice',
      instruction: '60s voice note: Describe your creative process from idea to finished work.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Start Something New',
      instruction: 'Start a new creative project today. Share the first step. Photo or video of beginning.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Inspiration Board',
      instruction: 'Photo of your mood board, inspo folder, or reference collection.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'vibe'
    },
    {
      title: 'Quick Sketch',
      instruction: 'Draw something in 60 seconds. Photo of result. No erasing.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'intro'
    }
  ],

  'Dog Person': [
    {
      title: 'Meet the Pup',
      instruction: 'Photo with your dog (or a dog you met). Show the dog clearly, your face optional.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Walk Proof',
      instruction: 'GPS screenshot of a walk with your dog. At least 15 minutes.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'consistency'
    },
    {
      title: 'Dog Story',
      instruction: '45s voice note: Tell me about your dog. Name, breed, one funny habit.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Park Date',
      instruction: 'Photo at a dog park or pet-friendly cafe. Show the location.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'vibe'
    },
    {
      title: 'Training Trick',
      instruction: 'Video 15s: Show your dog doing 1 trick. If no dog, find and pet a friendly dog on video.',
      time_estimate: '5 min',
      verification_method: 'video',
      day_preference: 8,
      category: 'effort'
    }
  ],

  'Cat Person': [
    {
      title: 'Cat Tax',
      instruction: 'Photo of your cat(s). Show their personality.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Cat Story',
      instruction: '45s voice note: How did you and your cat find each other? Tell the story.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Lap Time Proof',
      instruction: 'Photo of your cat sitting on you or nearby. Shows mutual trust.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'intro'
    },
    {
      title: 'Cat Toy DIY',
      instruction: 'Make a simple toy for your cat from household items. Photo result.',
      time_estimate: '5 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Cat Voice Imitation',
      instruction: 'Voice note 10s: Do your best cat impression. Points for creativity.',
      time_estimate: '2 min',
      verification_method: 'voice',
      category: 'vibe'
    }
  ],

  'Consistent': [
    {
      title: 'Morning Proof',
      instruction: 'Selfie between 6-9am for 2 days in a row. Submit day 2 photo. Natural light only.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'consistency'
    },
    {
      title: '48h Follow-up',
      instruction: 'Voice note: State 1 thing you will do tomorrow. Submit proof in 48h as next task.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'consistency'
    },
    {
      title: 'Week Streak',
      instruction: 'Photo log: 1 selfie per day for 3 days. Collage them in 1 image. Show effort.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'consistency'
    },
    {
      title: 'No Flake Check',
      instruction: 'Video 15s: Say "I am consistent" and state today\'s date. Must be recorded today.',
      time_estimate: '2 min',
      verification_method: 'video',
      category: 'consistency'
    },
    {
      title: 'Habit Stack',
      instruction: 'Voice note 45s: What is 1 daily habit you have kept for 30+ days? How did you start?',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'consistency'
    }
  ],

  'Plans Dates': [
    {
      title: 'Coffee Plan',
      instruction: 'Screenshot Google Maps with 3 coffee shops near my city. Pick 1 and write 1 sentence why.',
      time_estimate: '5 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'effort'
    },
    {
      title: 'Voice Note Itinerary',
      instruction: '60s voice note: Plan a 3-hour first meet. No dinner, no movie. Specific time, place, activity.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'effort'
    },
    {
      title: 'Budget Date Plan',
      instruction: 'Photo of handwritten plan for a date under ₹500 total. Show location, activity, cost breakdown.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Reservation Proof',
      instruction: 'Screenshot of a reservation for coffee. Can be for next week. Shows initiative.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'effort'
    },
    {
      title: 'Backup Plan',
      instruction: 'Voice note 30s: If it rains on our date, what is plan B? Be specific.',
      time_estimate: '2 min',
      verification_method: 'voice',
      category: 'effort'
    }
  ],

  'Entrepreneur': [
    {
      title: 'Builder Proof',
      instruction: 'Photo of something you built: code, product, art, business. No stock images.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Pitch Yourself',
      instruction: '60s voice note: Pitch yourself like a startup. What is your unfair advantage?',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Problem You Solve',
      instruction: 'Handwritten note: What problem do you solve in the world? Photo it with your hand in frame.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Shipped Work',
      instruction: 'Screenshot of 1 thing you shipped last month. Code, design, post, sale. Blur sensitive data.',
      time_estimate: '5 min',
      verification_method: 'photo',
      category: 'effort'
    },
    {
      title: 'Failed Fast Story',
      instruction: 'Voice note 45s: Tell me about 1 thing you tried that failed. What did you learn?',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'vibe'
    }
  ],

  'Emotionally Mature': [
    {
      title: 'Gratitude Check',
      instruction: 'Voice note 30s: Name 3 things you are grateful for today. No generic answers.',
      time_estimate: '2 min',
      verification_method: 'voice',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Conflict Resolution',
      instruction: '60s voice note: How do you handle disagreement? Give 1 real example without names.',
      time_estimate: '5 min',
      verification_method: 'voice',
      day_preference: 5,
      category: 'vibe'
    },
    {
      title: 'Apology Letter',
      instruction: 'Handwrite a 3-sentence apology to someone. Photo it. Can be anonymous. Shows self-awareness.',
      time_estimate: '15 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'effort'
    },
    {
      title: 'Boundary Example',
      instruction: 'Voice note 45s: Describe 1 boundary you set recently and how it went.',
      time_estimate: '5 min',
      verification_method: 'voice',
      category: 'vibe'
    },
    {
      title: 'Therapy Take',
      instruction: 'Voice note 30s: What is 1 thing you learned from therapy, a book, or life about yourself?',
      time_estimate: '2 min',
      verification_method: 'voice',
      category: 'vibe'
    }
  ],

  '6ft+': [
    {
      title: 'Height Check',
      instruction: 'Full body photo next to doorframe. Stand straight. No filters, no angles.',
      time_estimate: '2 min',
      verification_method: 'photo',
      day_preference: 1,
      category: 'intro'
    },
    {
      title: 'Reach Test',
      instruction: 'Video 5s: Stand and reach up. Shows proportions. Face optional.',
      time_estimate: '2 min',
      verification_method: 'video',
      category: 'intro'
    },
    {
      title: 'Shoe Size Proof',
      instruction: 'Photo of your shoe with size tag visible.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'intro'
    },
    {
      title: 'Mirror Full Body',
      instruction: 'Mirror selfie full body. Natural light. No flexing.',
      time_estimate: '2 min',
      verification_method: 'photo',
      category: 'intro'
    },
    {
      title: 'Group Photo Context',
      instruction: 'Photo with 2+ friends. Shows you in social context. Faces can be blurred.',
      time_estimate: '5 min',
      verification_method: 'photo',
      day_preference: 8,
      category: 'vibe'
    }
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTasksFromTags(
  aboutMeTags: string[],
  lookingForTags: string[],
  count: number = 8
): { title: string; instruction: string; time_estimate: string; verification_method: string }[] {
  const pool: TaskTemplate[] = [];
  const seenTags = new Set<string>();

  for (const tag of [...aboutMeTags, ...lookingForTags]) {
    const templates = TASK_BANK[tag];
    if (templates) {
      pool.push(...templates.filter((t) => !seenTags.has(t.title)));
      templates.forEach((t) => seenTags.add(t.title));
    }
  }

  if (pool.length === 0) {
    return Array.from({ length: count }, (_, i) => ({
      title: `Task ${i + 1}`,
      instruction: 'Complete this task and submit proof.',
      time_estimate: '5 min',
      verification_method: 'photo' as const,
    }));
  }

  const result: { title: string; instruction: string; time_estimate: string; verification_method: string }[] = [];
  const used = new Set<string>();

  const pickCategory = (cat: TaskTemplate['category']): string[] => {
    const candidates = shuffle(pool.filter((t) => t.category === cat && !used.has(t.title)));
    return candidates.map((t) => {
      used.add(t.title);
      return t.title;
    });
  };

  const assign = (days: number[], cat: TaskTemplate['category']) => {
    for (const day of days) {
      const pick = shuffle(pool.filter((t) => !used.has(t.title) && t.category === cat));
      const exact = pick.find((t) => t.day_preference === day);
      const chosen = exact || pick[0];
      if (chosen && !used.has(chosen.title)) {
        result.push({
          title: chosen.title,
          instruction: chosen.instruction,
          time_estimate: chosen.time_estimate,
          verification_method: chosen.verification_method,
        });
        used.add(chosen.title);
      }
    }
  };

  assign([1, 2], 'intro');
  assign([3, 4], 'consistency');
  assign([5, 6], 'vibe');
  assign([7, 8], 'effort');

  const remaining = pool.filter((t) => !used.has(t.title));
  const shuffled = shuffle(remaining);
  for (const t of shuffled) {
    if (result.length >= count) break;
    if (!used.has(t.title)) {
      result.push({
        title: t.title,
        instruction: t.instruction,
        time_estimate: t.time_estimate,
        verification_method: t.verification_method,
      });
      used.add(t.title);
    }
  }

  while (result.length < count) {
    result.push({
      title: `Extra Task ${result.length + 1}`,
      instruction: 'Complete this task and submit photo proof.',
      time_estimate: '5 min',
      verification_method: 'photo',
    });
  }

  return result.slice(0, count);
}
