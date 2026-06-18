// src/lib/__tests__/generate-tasks.test.ts
import { generateTasksFromTags } from "../generate-tasks";

test("Gym Partner tag ensures gym selfie on Day 1", () => {
  const tasks = generateTasksFromTags(["Gym Partner"], [], 8);
  expect(tasks).toHaveLength(8);
  const day1 = tasks.find((t) => t.day_number === 1);
  expect(day1).toBeDefined();
  expect(day1?.time_estimate).toBe("2 min");
  expect(day1?.verification_method).toBe("photo");
  expect(/gym/i.test(day1?.title ?? "")).toBeTruthy();
});
