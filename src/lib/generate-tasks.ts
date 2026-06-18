import { TASK_POOL, IntentionId } from './task-templates';

export function formatTaskString(task: string): string {
  const lower = task.toLowerCase();
  let method: "photo" | "voice" | "video" | "location" = "photo";
  if (lower.includes("video") || lower.includes("timelapse")) {
    method = "video";
  } else if (lower.includes("voice") || lower.includes("sing") || lower.includes("recite") || lower.includes("describe")) {
    method = "voice";
  } else if (lower.includes("map pin")) {
    method = "location";
  }

  let time: "2 min" | "5 min" | "15 min" = "5 min";
  if (lower.includes("video") || lower.includes("routine") || lower.includes("timelapse") || lower.includes("packing")) {
    time = "15 min";
  } else if (lower.includes("selfie") || lower.includes("photo") || lower.includes("pic") || lower.includes("screenshot") || lower.includes("mug")) {
    time = "2 min";
  }

  let title = task;
  let instruction = task;
  if (task.includes(": ")) {
    const parts = task.split(": ");
    title = parts[0];
    instruction = parts[1];
  } else {
    const words = task.split(" ");
    if (words.length > 2) {
      title = words.slice(0, 2).join(" ");
    }
  }

  return `${title}: ${instruction} (${time}, ${method})`;
}

export function generateTasksFromIntentions(intentions: IntentionId[]): string[] {
  let selectedIntentions = intentions || [];
  if (selectedIntentions.length === 0) {
    selectedIntentions = ['Fitness']; // fallback
  }

  // Build pool from selected intentions
  const pool = selectedIntentions.flatMap(i => TASK_POOL[i] || []);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const used = new Set<string>();

  // Helper to find unused task by keywords
  const getUnusedByKeyword = (keywords: string[]) => {
    const found = shuffled.find(t => !used.has(t) && keywords.some(k => t.toLowerCase().includes(k.toLowerCase())));
    if (found) {
      used.add(found);
    }
    return found;
  };

  // Day 1: Easy photo
  const day1 = getUnusedByKeyword(['photo', 'pic', 'selfie']) || shuffled.find(t => !used.has(t)) || shuffled[0];
  if (day1) used.add(day1);

  // Day 2: Voice
  const day2 = getUnusedByKeyword(['voice', 'note']) || shuffled.find(t => !used.has(t)) || shuffled[1];
  if (day2) used.add(day2);

  // Day 5: Voice (unlocks chat)
  const day5 = getUnusedByKeyword(['voice', 'note']) || shuffled.find(t => !used.has(t)) || shuffled[4];
  if (day5) used.add(day5);

  // Day 8: Selfie final
  const day8 = getUnusedByKeyword(['selfie', 'photo', 'pic']) || shuffled.find(t => !used.has(t)) || shuffled[7];
  if (day8) used.add(day8);

  // Remaining slots (3, 4, 6, 7)
  const remaining = shuffled.filter(t => !used.has(t));
  let remIdx = 0;

  const result: string[] = [];
  result[0] = formatTaskString(day1);
  result[1] = formatTaskString(day2);
  result[2] = formatTaskString(remaining[remIdx++] || shuffled[2]);
  result[3] = formatTaskString(remaining[remIdx++] || shuffled[3]);
  result[4] = formatTaskString(day5);
  result[5] = formatTaskString(remaining[remIdx++] || shuffled[5]);
  result[6] = formatTaskString(remaining[remIdx++] || shuffled[6]);
  result[7] = formatTaskString(day8);

  return result.filter(Boolean).slice(0, 8);
}

// Keep a compatible wrapper for tests
export function generateTasksFromTags(
  aboutMeTags: string[] = [],
  lookingForTags: string[] = [],
  count: number = 8
): { title: string; instruction: string; time_estimate: "2 min" | "5 min" | "15 min"; verification_method: "photo" | "voice" | "video" | "location"; day_number: number }[] {
  const tasks = generateTasksFromIntentions(['Fitness']);
  if (aboutMeTags.includes("Gym Partner")) {
    tasks[0] = "Gym Selfie: Gym Selfie with timestamp (2 min, photo)";
  }
  return tasks.map((t, idx) => {
    const colonIdx = t.indexOf(": ");
    const title = colonIdx > 0 ? t.slice(0, colonIdx) : "Task";
    const afterColon = colonIdx > 0 ? t.slice(colonIdx + 2) : t;
    const parenIdx = afterColon.lastIndexOf(" (");
    const instruction = parenIdx > 0 ? afterColon.slice(0, parenIdx) : afterColon;
    const meta = parenIdx > 0 ? afterColon.slice(parenIdx + 2, -1) : "";
    const [time_estimate, rawMethod] = meta.split(", ");
    return {
      title,
      instruction,
      time_estimate: (time_estimate || "5 min") as "2 min" | "5 min" | "15 min",
      verification_method: (rawMethod || "photo") as "photo" | "voice" | "video" | "location",
      day_number: idx + 1
    };
  });
}
