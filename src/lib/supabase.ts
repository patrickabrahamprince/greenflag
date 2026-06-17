import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    client = createBrowserClient(url, key);
  }
  return client;
}

export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getClient(), prop, getClient());
  },
});
