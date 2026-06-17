import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Invalid email or password (min 6 chars)" }, { status: 400 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingUser = existing?.users.find((u) => u.email === email);

  if (existingUser) {
    // Confirm email and update password
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: existingUser });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: data.user });
}
