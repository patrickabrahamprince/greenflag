"use client";

export type TaskDetail = {
  title: string;
  instruction: string;
  time_estimate: string;
  verification_method: "photo" | "voice" | "video" | "location";
};

export function parseTaskDescription(description: string): TaskDetail {
  const colonIdx = description.indexOf(": ");
  const title = colonIdx > 0 ? description.slice(0, colonIdx) : "Task";
  const afterColon = colonIdx > 0 ? description.slice(colonIdx + 2) : description;
  const parenIdx = afterColon.lastIndexOf(" (");
  const instruction = parenIdx > 0 ? afterColon.slice(0, parenIdx) : afterColon;
  const meta = parenIdx > 0 ? afterColon.slice(parenIdx + 2, -1) : "";
  const [time_estimate, rawMethod] = meta.split(", ");
  const method = rawMethod as TaskDetail["verification_method"];
  return {
    title,
    instruction,
    time_estimate: time_estimate || "5 min",
    verification_method: ["photo", "voice", "video", "location"].includes(method)
      ? method
      : "photo",
  };
}
