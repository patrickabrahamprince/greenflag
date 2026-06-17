import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ exists: false });
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
    if (!serviceRole) {
      return NextResponse.json({ exists: false, error: "Server not configured" });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRole,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: profile } = await supabase.from("profiles").select("id").eq("phone", phone).maybeSingle();
    if (profile) return NextResponse.json({ exists: true });

    const { data: users } = await supabase.auth.admin.listUsers();
    const exists = users?.users.some((u) => u.phone === phone) ?? false;
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false, error: "Server error" }, { status: 500 });
  }
}
