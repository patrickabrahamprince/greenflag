import { supabase } from "./supabase";

export async function requireAuth(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id;
}

export async function requireOnboarded(): Promise<string | null> {
  const userId = await requireAuth();
  if (!userId) return null;
  const { data } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
  if (!data || data.name === "User" || !data.name) return null;
  return userId;
}
