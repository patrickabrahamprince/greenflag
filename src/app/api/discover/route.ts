import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: tests, error } = await supabase
    .from("tests")
    .select("*, host:host_id(*)")
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(tests);
}
