import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });
  const user = users.users.find((u) => u.email === email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { error } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
