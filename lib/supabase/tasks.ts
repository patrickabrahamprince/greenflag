// Stub data layer for the tasks/submissions system described in docs/tasks-spec.md.
// `tasks` and `submissions` do not exist in the DB yet (no migrations landed) — these
// return mock data so the UI can be built against a stable shape.

export interface Task {
  id: string;
  conversationId: string;
  dayNumber: 1 | 2 | 3;
  promptText: string;
  isActive: boolean;
}

export interface Submission {
  id: string;
  conversationId: string;
  userId: string;
  dayNumber: 1 | 2 | 3;
  audioUrl: string;
  createdAt: string;
}

const MOCK_PROMPTS: Record<1 | 2 | 3, string> = {
  1: 'What made you smile today?',
  2: 'What are you looking for right now?',
  3: 'What would a great first date with you look like?',
};

export async function getTasks(conversationId: string): Promise<Task[]> {
  return [1, 2, 3].map((dayNumber) => ({
    id: `mock-task-${conversationId}-${dayNumber}`,
    conversationId,
    dayNumber: dayNumber as 1 | 2 | 3,
    promptText: MOCK_PROMPTS[dayNumber as 1 | 2 | 3],
    isActive: true,
  }));
}

export async function getSubmissions(conversationId: string): Promise<Submission[]> {
  return [];
}
