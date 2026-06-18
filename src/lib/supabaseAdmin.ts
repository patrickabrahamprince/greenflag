import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRole,
  {
    auth: { persistSession: false },
  }
);

export default supabaseAdmin;
