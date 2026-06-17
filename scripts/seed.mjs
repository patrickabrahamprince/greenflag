import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iaeqrsxwsngfynzuwbkf.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!anonKey) { console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"); process.exit(1); }

const key = serviceKey || anonKey;
const supabase = createClient(supabaseUrl, key);
const isAdmin = !!serviceKey;

if (!isAdmin) console.warn("No SUPABASE_SERVICE_ROLE_KEY found — using data URIs (RLS bypass not available).");

const PROFILES = [
  { id: "00000000-0000-0000-0000-000000000001", role: "man", name: "Rahul", age: 25, city: "Mumbai", bio: "Product. Discipline over motivation.", color: "#3B82F6" },
  { id: "00000000-0000-0000-0000-000000000010", role: "woman", name: "Priya", age: 24, city: "Mumbai", bio: "Read 47 books this year. If you cannot name 3 authors, do not reach out.", color: "#EC4899" },
  { id: "00000000-0000-0000-0000-000000000011", role: "woman", name: "Aisha", age: 26, city: "Bangalore", bio: "5am or do not engage. PR: 100kg deadlift. Caliber required.", color: "#F59E0B" },
  { id: "00000000-0000-0000-0000-000000000012", role: "woman", name: "Maya", age: 22, city: "Delhi", bio: "Digital artist. 200-day streak. Looking for those who match my energy.", color: "#10B981" },
];

function svgDataUri(name, color) {
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}"/><circle cx="200" cy="160" r="60" fill="rgba(255,255,255,0.3)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="48" font-family="sans-serif" font-weight="bold">${initial}</text><ellipse cx="200" cy="300" rx="80" ry="40" fill="rgba(255,255,255,0.2)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function uploadOrDataUri(profile, index) {
  if (!isAdmin) return svgDataUri(index > 1 ? profile.name.charAt(0).toUpperCase() : profile.name, profile.color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${profile.color}"/><circle cx="200" cy="160" r="60" fill="rgba(255,255,255,0.3)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="48" font-family="sans-serif" font-weight="bold">${profile.name.charAt(0).toUpperCase()}</text><ellipse cx="200" cy="300" rx="80" ry="40" fill="rgba(255,255,255,0.2)"/></svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const filePath = `seed/${profile.id}/${index}.svg`;
  const { error } = await supabase.storage.from("photos").upload(filePath, blob, { contentType: "image/svg+xml", upsert: true });
  if (error) {
    if (error.message.includes("row-level security") || error.message.includes("violates")) return svgDataUri(profile.name, profile.color);
    console.error(`Upload failed for ${profile.name}:`, error.message);
    return svgDataUri(profile.name, profile.color);
  }
  const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);
  return publicUrl;
}

async function seed() {
  const photoUrls = {};
  for (const p of PROFILES) {
    const urls = [];
    const count = p.role === "man" ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const url = await uploadOrDataUri(p, i + 1);
      urls.push(url);
    }
    photoUrls[p.id] = urls;
    console.log(`Photo(s) for ${p.name}: ${urls[0].substring(0, 50)}...`);
  }

  for (const p of PROFILES) {
    const { error } = await supabase.from("profiles").upsert({
      id: p.id, role: p.role, name: p.name, age: p.age, city: p.city, bio: p.bio, photos: photoUrls[p.id],
    }, { onConflict: "id" });
    if (error) console.error(`Profile ${p.name}: ${error.message}`);
    else console.log(`Upserted: ${p.name}`);
  }

  const tests = [
    { id: "10000000-0000-0000-0000-000000000001", host_id: "00000000-0000-0000-0000-000000000010", name: "Book Lover", difficulty: "medium", is_active: true },
    { id: "10000000-0000-0000-0000-000000000002", host_id: "00000000-0000-0000-0000-000000000011", name: "Fitness", difficulty: "hard", is_active: true },
    { id: "10000000-0000-0000-0000-000000000003", host_id: "00000000-0000-0000-0000-000000000012", name: "Foodie", difficulty: "easy", is_active: true },
  ];
  for (const t of tests) {
    const { error } = await supabase.from("tests").upsert(t, { onConflict: "id" });
    if (error) console.error(`Test ${t.name}: ${error.message}`);
    else console.log(`Upserted test: ${t.name}`);
  }

  const TASKS = [
    "Send a voice note introducing yourself and why this standard matters to you.",
    "Share a photo of your current read / workout / meal related to this standard.",
    "Write a 100-word reflection on what this standard means to you.",
    "Record a 30-second video of your progress today.",
    "Share a screenshot of something you learned today related to this standard.",
    "Send a photo of your setup / space dedicated to this standard.",
    "Write a letter to your future self about this journey.",
    "Final submission: a photo or video showing your transformation.",
  ];
  let taskId = 1;
  for (const test of tests) {
    for (let d = 1; d <= 8; d++) {
      const { error } = await supabase.from("tasks").upsert({
        id: `30000000-0000-0000-0000-${String(taskId).padStart(12, "0")}`,
        test_id: test.id, day_number: d, description: TASKS[d - 1],
      }, { onConflict: "id" });
      if (error) console.error(`Task day ${d}: ${error.message}`);
      taskId++;
    }
    console.log(`Tasks for: ${test.name}`);
  }

  const connId = "40000000-0000-0000-0000-000000000001";
  const { error: connErr } = await supabase.from("connections").upsert({
    id: connId, test_id: "10000000-0000-0000-0000-000000000001",
    host_id: "00000000-0000-0000-0000-000000000010",
    guest_id: "00000000-0000-0000-0000-000000000001",
    status: "active", tasks_completed: 1, current_day: 2,
    expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
  }, { onConflict: "id" });
  if (connErr) console.error("Connection:", connErr.message);
  else console.log("Upserted connection");

  for (let d = 1; d <= 2; d++) {
    const { error } = await supabase.from("submissions").upsert({
      id: `20000000-0000-0000-0000-${String(d).padStart(12, "0")}`,
      connection_id: connId, day_number: d,
      proof_url: svgDataUri(d === 1 ? "✓" : "?", d === 1 ? "#22C55E" : "#F59E0B"),
      status: d === 1 ? "approved" : "submitted",
    }, { onConflict: "id" });
    if (error) console.error(`Submission day ${d}: ${error.message}`);
  }
  console.log("Submissions done");

  const msgs = [
    { sender_id: "00000000-0000-0000-0000-000000000001", content: "Hey! Starting day 1." },
    { sender_id: "00000000-0000-0000-0000-000000000010", content: "Welcome! Looking forward to your submissions." },
    { sender_id: "00000000-0000-0000-0000-000000000001", content: "Just submitted day 1." },
    { sender_id: "00000000-0000-0000-0000-000000000010", content: "Great, keep going!" },
  ];
  for (const m of msgs) {
    const { error } = await supabase.from("messages").insert({
      connection_id: connId, sender_id: m.sender_id, content: m.content,
    });
    if (error) console.error(`Message: ${error.message}`);
  }
  console.log("Messages done");

  console.log("\n✓ Seed complete!");
}

seed().catch(console.error);
