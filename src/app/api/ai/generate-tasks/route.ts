import { NextResponse } from "next/server";

type Category = {
  keywords: string[];
  tasks: { text: string; effort: 1 | 2 | 3 }[];
};

const CATEGORIES: Category[] = [
  {
    keywords: ["fit", "gym", "workout", "health", "exercise", "run", "active", "strong", "athlete", "sport"],
    tasks: [
      { text: "10 push-ups. Video proof.", effort: 1 },
      { text: "Run 5K. GPS screenshot.", effort: 3 },
      { text: "30-minute home workout. Selfie.", effort: 2 },
      { text: "100 squats in a day. Timer.", effort: 2 },
      { text: "Plank hold 2 minutes. Video.", effort: 2 },
      { text: "Swim 20 laps. Pool selfie.", effort: 3 },
      { text: "Morning stretch routine. Photo.", effort: 1 },
      { text: "8K steps before 8PM. Screenshot.", effort: 1 },
      { text: "Cold shower 3 mins. Timer video.", effort: 2 },
      { text: "Weekly meal prep. Photo evidence.", effort: 2 },
    ],
  },
  {
    keywords: ["book", "read", "knowledge", "learn", "study", "intellect", "sapiosexual", "smart", "mind", "grow"],
    tasks: [
      { text: "Read 10 pages of a book. Screenshot.", effort: 1 },
      { text: "Read 30 pages of a book. Summary.", effort: 2 },
      { text: "Finish a chapter. Write 3 takeaways.", effort: 2 },
      { text: "Listen to a podcast. Key insight.", effort: 1 },
      { text: "Learn 5 new words. Use in sentences.", effort: 1 },
      { text: "Read a non-fiction article. Summary.", effort: 1 },
      { text: "Read 50 pages. One-page summary.", effort: 3 },
      { text: "Watch a documentary. Key learning.", effort: 2 },
      { text: "Memorize a poem. Video recitation.", effort: 2 },
      { text: "Write a book review. 200+ words.", effort: 3 },
    ],
  },
  {
    keywords: ["food", "cook", "culinary", "chef", "bake", "kitchen", "dinner", "restaurant", "eat", "cuisine"],
    tasks: [
      { text: "Cook a meal. Photo plated.", effort: 1 },
      { text: "Bake something from scratch. Photo.", effort: 2 },
      { text: "Try a new recipe. Photo + rating.", effort: 2 },
      { text: "Cook a 3-course meal. Photos.", effort: 3 },
      { text: "Make breakfast in bed. Selfie.", effort: 1 },
      { text: "Meal prep for 3 days. Photo.", effort: 2 },
      { text: "Cook her favorite dish. Video.", effort: 2 },
      { text: "Try a cuisine you've never had. Photo.", effort: 1 },
      { text: "Host a dinner for friends. Photo.", effort: 3 },
      { text: "Make homemade pasta/pizza. Video.", effort: 3 },
    ],
  },
  {
    keywords: ["travel", "adventure", "explore", "wander", "nature", "hike", "road", "trip", "outdoor", "wild"],
    tasks: [
      { text: "Go for a hike. Summit selfie.", effort: 2 },
      { text: "Visit a place you've never been. Photo.", effort: 2 },
      { text: "Plan a weekend itinerary. Share it.", effort: 1 },
      { text: "Sunrise hike. Photo proof.", effort: 3 },
      { text: "Explore a new neighborhood. Photo.", effort: 1 },
      { text: "Go camping overnight. Setup photo.", effort: 3 },
      { text: "Visit a museum. Favorite piece.", effort: 2 },
      { text: "Take a scenic drive. Photo.", effort: 1 },
      { text: "Try a new outdoor activity. Video.", effort: 3 },
      { text: "Stargaze and identify 3 constellations.", effort: 2 },
    ],
  },
  {
    keywords: ["career", "ambition", "ceo", "hustle", "business", "wealth", "finance", "driven", "success", "money"],
    tasks: [
      { text: "Wake up at 5AM. Screenshot alarm.", effort: 1 },
      { text: "Read a business article. Key takeaway.", effort: 1 },
      { text: "Complete a work task before noon. Proof.", effort: 1 },
      { text: "Network with someone new. Screenshot.", effort: 2 },
      { text: "Plan your week in detail. Share.", effort: 2 },
      { text: "Learn a new professional skill. 1 hour.", effort: 3 },
      { text: "Review your goals. Write 3 next steps.", effort: 1 },
      { text: "Read a chapter of a business book.", effort: 2 },
      { text: "Create a vision board. Photo.", effort: 2 },
      { text: "Complete a side project milestone. Proof.", effort: 3 },
    ],
  },
  {
    keywords: ["spiritual", "meditate", "mindful", "yoga", "soul", "inner", "peace", "calm", "zen", "gratitude"],
    tasks: [
      { text: "Meditate 10 minutes. Timer proof.", effort: 1 },
      { text: "Meditate 20 minutes. Headspace screenshot.", effort: 2 },
      { text: "Write 3 things you're grateful for. Share.", effort: 1 },
      { text: "Sunrise yoga. Photo.", effort: 2 },
      { text: "Digital detox 4 hours. Screenshot.", effort: 2 },
      { text: "Journal for 15 minutes. Photo of entry.", effort: 1 },
      { text: "Complete a 30-day meditation. Day check.", effort: 3 },
      { text: "Practice deep breathing 5 mins. Timer.", effort: 1 },
      { text: "Go tech-free for an evening. Proof.", effort: 2 },
      { text: "Write a letter to your future self.", effort: 3 },
    ],
  },
  {
    keywords: ["creative", "art", "music", "paint", "draw", "sing", "dance", "write", "poem", "design"],
    tasks: [
      { text: "Write a short poem. 8 lines.", effort: 1 },
      { text: "Draw or paint something. Photo.", effort: 2 },
      { text: "Learn a song on an instrument. Video.", effort: 3 },
      { text: "Write a handwritten letter. Photo.", effort: 1 },
      { text: "Create a playlist for her. Share link.", effort: 1 },
      { text: "Take 10 photos on a theme. Share best.", effort: 2 },
      { text: "Write a short story. 500 words.", effort: 3 },
      { text: "Record a voice note singing. Send.", effort: 2 },
      { text: "Make something with your hands. Photo.", effort: 2 },
      { text: "Dance to your favorite song. 30s video.", effort: 1 },
    ],
  },
  {
    keywords: ["discipline", "routine", "habit", "grind", "focus", "consistent", "dedicated", "strict", "commit"],
    tasks: [
      { text: "Wake up at 5AM for 3 days. Proof.", effort: 2 },
      { text: "No social media 24h. Screenshot.", effort: 2 },
      { text: "Cold shower 5 minutes. Timer video.", effort: 2 },
      { text: "Complete a 7-day streak of anything.", effort: 3 },
      { text: "Follow your routine and log it. Share.", effort: 1 },
      { text: "No sugar for 48 hours. Meal log.", effort: 2 },
      { text: "Read every day for a week. Log.", effort: 3 },
      { text: "Make your bed every day. 7-day photo.", effort: 1 },
      { text: "Complete all tasks before 10AM. Proof.", effort: 1 },
      { text: "30-day challenge day check-in. Photo.", effort: 3 },
    ],
  },
  {
    keywords: ["romance", "date", "love", "couple", "relationship", "romantic", "passion", "sweet", "thoughtful"],
    tasks: [
      { text: "Write a handwritten love note. Photo.", effort: 1 },
      { text: "Plan a surprise date. Itinerary.", effort: 2 },
      { text: "Cook a romantic dinner. Setup photo.", effort: 2 },
      { text: "Send a voice note saying why you care.", effort: 1 },
      { text: "Plan a weekend getaway. Share plan.", effort: 3 },
      { text: "Learn her love language. Quiz result.", effort: 1 },
      { text: "Write 10 things you love about her.", effort: 1 },
      { text: "Create a memory jar. Photo.", effort: 2 },
      { text: "Recreate your first date. Photo.", effort: 3 },
      { text: "Stargaze and name a star after her.", effort: 2 },
    ],
  },
  {
    keywords: ["social", "party", "friends", "outgoing", "people", "charisma", "fun", "vibe", "connection"],
    tasks: [
      { text: "Call a friend you haven't spoken to. Proof.", effort: 1 },
      { text: "Attend a social event. Photo.", effort: 2 },
      { text: "Compliment a stranger. Share the story.", effort: 1 },
      { text: "Host a game night. Group photo.", effort: 2 },
      { text: "Volunteer for a cause. Photo proof.", effort: 3 },
      { text: "Have a deep conversation. Key insight.", effort: 2 },
      { text: "Organize a group outing. Photo.", effort: 3 },
      { text: "Do something kind for a neighbor. Story.", effort: 1 },
      { text: "Reach out to an old friend. Screenshot.", effort: 1 },
      { text: "Join a club or meetup. Photo proof.", effort: 3 },
    ],
  },
];

function findBestCategory(name: string, description: string): number {
  const text = `${name} ${description}`.toLowerCase();
  let bestScore = 0;
  let bestIdx = 0;

  CATEGORIES.forEach((cat, idx) => {
    let score = 0;
    cat.keywords.forEach((kw) => {
      if (text.includes(kw)) {
        score += kw.length;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  });

  return bestIdx;
}

function getDifficultyEffort(difficulty: string): 1 | 2 | 3 {
  if (difficulty === "easy") return 1;
  if (difficulty === "hard") return 3;
  return 2;
}

function pickTasks(
  pool: { text: string; effort: 1 | 2 | 3 }[],
  targetEffort: 1 | 2 | 3,
  count: number
): string[] {
  const filtered = pool.filter((t) => Math.abs(t.effort - targetEffort) <= 1);

  if (filtered.length >= count) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((t) => t.text);
  }

  const exact = [...pool].sort(() => Math.random() - 0.5);
  const result = exact.slice(0, count).map((t) => t.text);
  return result.length === count ? result : [
    ...result,
    ...[
      "Send a voice note saying something kind.",
      "Selfie with your morning coffee.",
      "Text: One thing you appreciate today.",
      "Take a photo of something beautiful.",
      "5-minute walk outside. Snap a photo.",
      "Write down 3 goals for the day.",
      "Send a screenshot of your step count.",
      "Read a page of any book. Snapshot.",
    ].slice(0, count - result.length),
  ];
}

export async function POST(req: Request) {
  try {
    const { name, difficulty, description } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Standard name is required" }, { status: 400 });
    }

    const catIdx = findBestCategory(name, description || "");
    const pool = CATEGORIES[catIdx].tasks;
    const targetEffort = getDifficultyEffort(difficulty || "medium");
    const tasks = pickTasks(pool, targetEffort, 8);

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate tasks" }, { status: 500 });
  }
}
