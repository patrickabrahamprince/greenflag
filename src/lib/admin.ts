import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export function getAdminClient() {
  return createClient(
    env.supabaseUrl,
    env.supabaseServiceRole,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function requireAdmin(): Promise<{ adminId: string } | Response> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }
  return { adminId: user.id };
}
