import { TASK_BANK, TaskTemplate } from './task-templates';

function shuffle<T>(arr: T[]): T[] {
  // Fisher‑Yates shuffle – deterministic randomness.
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK_DAY1: TaskTemplate = {
  title: 'Intro Selfie',
  instruction: 'Selfie with today date visible on phone screen.',
  time_estimate: '2 min',
  verification_method: 'photo',
  day_preference: 1,
  category: 'intro'
};

const FALLBACK_DAY5: TaskTemplate = {
  title: 'Voice Intro',
  instruction: '30s voice note: Why did you apply to my Standard?',
  time_estimate: '5 min',
  verification_method: 'voice',
  day_preference: 5,
  category: 'vibe'
};

const FALLBACK_DAY8: TaskTemplate = {
  title: 'Final Plan',
  instruction: '60s voice note: Plan our first meet if we connect. Be specific.',
  time_estimate: '15 min',
  verification_method: 'voice',
  day_preference: 8,
  category: 'effort'
};

export function generateTasksFromTags(
  aboutMeTags: string[] = [],
  lookingForTags: string[] = [],
  count: number = 8
): (TaskTemplate & { day_number?: number })[] {
  // 1. Combine aboutMeTags + lookingForTags into one array.
  const tags = [...aboutMeTags, ...lookingForTags];

  // 2. Pull all TaskTemplate[] from TASK_BANK for each tag. Flatten into pool.
  const rawPool: TaskTemplate[] = [];
  for (const tag of tags) {
    const templates = TASK_BANK[tag];
    if (templates) {
      rawPool.push(...templates);
    }
  }

  // 3. De-dupe pool by title using new Map().
  const map = new Map<string, TaskTemplate>();
  for (const t of rawPool) {
    map.set(t.title, t);
  }
  const pool = Array.from(map.values());

  // 4. Force structure: Pick 1 from day_preference:1, 1 from day_preference:5, 1 from day_preference:8.
  // We search the pool for these preferences.
  // Day‑specific candidates respecting constraints
  let day1Candidate: TaskTemplate | undefined;
  let day5Candidate: TaskTemplate | undefined;
  let day8Candidate: TaskTemplate | undefined;

  // 1️⃣ Day 1 must be 2 min photo (gym rule may override title)
  if (aboutMeTags.includes('Gym Partner')) {
    // Prefer a gym‑related photo task
    day1Candidate = pool.find(
      (t) =>
        t.time_estimate === '2 min' &&
        t.verification_method === 'photo' &&
        /gym/i.test(t.title)
    );
  }
  // Fallback to any 2 min photo if not gym‑specific
  if (!day1Candidate) {
    day1Candidate = pool.find(
      (t) => t.time_estimate === '2 min' && t.verification_method === 'photo'
    );
  }

  // 2️⃣ Day 5 must be voice or video
  day5Candidate = pool.find(
    (t) => t.day_preference === 5 && /voice|video/.test(t.verification_method)
  );
  if (!day5Candidate) {
    day5Candidate = pool.find(
      (t) => /voice|video/.test(t.verification_method)
    );
  }

  // 3️⃣ Day 8 must be 15 min (any method)
  day8Candidate = pool.find(
    (t) => t.day_preference === 8 && t.time_estimate === '15 min'
  );
  if (!day8Candidate) {
    day8Candidate = pool.find((t) => t.time_estimate === '15 min');
  }

  // Use fallbacks when a candidate is still missing
  const finalDay1 = day1Candidate || FALLBACK_DAY1;
  const finalDay5 = day5Candidate || FALLBACK_DAY5;
  const finalDay8 = day8Candidate || FALLBACK_DAY8;

  // Compile selected fixed tasks and tracking set to prevent duplicate selection
  const selectedFixed = [finalDay1, finalDay5, finalDay8];
  const usedTitles = new Set(selectedFixed.map((t) => t.title));

  // The remaining pool of candidates from tags that aren't the selected fixed tasks
  let remainingCandidates = pool.filter((t) => !usedTitles.has(t.title));

  // If the pool is too small (< 8 in total) we need fallback tasks from the general TASK_BANK.
  if (usedTitles.size + remainingCandidates.length < count) {
    const backupPool: TaskTemplate[] = [];
    for (const tag in TASK_BANK) {
      for (const t of TASK_BANK[tag]) {
        if (!usedTitles.has(t.title) && !pool.some(pt => pt.title === t.title)) {
          backupPool.push(t);
        }
      }
    }
    remainingCandidates.push(...shuffle(backupPool));
  }

  // Shuffle remaining candidates and take up to 5 (or whatever is needed to reach count)
  // Build remaining tasks while respecting global constraints
  const maxVoice = 2;
  const maxPhotoStreak = 3;
  const used = new Set<string>([finalDay1.title, finalDay5.title, finalDay8.title]);
  const fixedTasks = [finalDay1, finalDay5, finalDay8];

  const result: (TaskTemplate | undefined)[] = [];
  // Insert day‑specific fixed tasks at their positions
  result[0] = finalDay1; // Day 1
  result[4] = finalDay5; // Day 5 (index 4)
  result[7] = finalDay8; // Day 8 (index 7)

  // Helper counters
  let voiceCount = fixedTasks.filter((t) => t.verification_method === 'voice').length;

  // Helper to check photo streak
  const photoStreak = () => {
    let streak = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i]?.verification_method === 'photo') streak++;
      else streak = 0;
    }
    return streak;
  };

  // Fill the remaining slots (indices 1‑3,5‑6)
  const slots = [1, 2, 3, 5, 6];
  const shuffledCandidates = shuffle(remainingCandidates);
  let candIdx = 0;

  for (const slot of slots) {
    // Try to find a candidate that respects constraints
    while (candIdx < shuffledCandidates.length) {
      const cand = shuffledCandidates[candIdx++];
      if (used.has(cand.title)) continue;

      // Voice limit check
      if (cand.verification_method === 'voice' && voiceCount >= maxVoice) continue;

      // Tentatively place and test photo streak
      result[slot] = cand;
      const currentStreak = (() => {
        let streak = 0;
        for (let i = 0; i <= slot; i++) {
          if (result[i]?.verification_method === 'photo') streak++;
          else streak = 0;
        }
        return streak;
      })();
      if (currentStreak > maxPhotoStreak) {
        result[slot] = undefined;
        continue; // skip this candidate
      }

      // Accept candidate
      used.add(cand.title);
      if (cand.verification_method === 'voice') voiceCount++;
      break;
    }
    // If slot still empty, use a generic fallback that fits constraints
    if (!result[slot]) {
      const fallback = {
        title: 'Fallback Task',
        instruction: 'Complete this task.',
        time_estimate: '5 min',
        verification_method: 'photo',
        category: 'intro'
      } as TaskTemplate;
      result[slot] = fallback;
    }
  }

  // Assign day numbers (1‑8)
  const finalList = (result as TaskTemplate[]).map((t, idx) => ({ ...t, day_number: idx + 1 }));
  return finalList;

}
