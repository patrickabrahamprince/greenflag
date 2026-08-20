import { createServerSupabaseClient } from '@/lib/supabase/server';

// The admin panel accepts two independent kinds of session: the opaque
// admin_session cookie minted by /api/admin/login's password flow, and a
// regular Supabase Auth session (Google/Apple/email) whose profile has
// is_admin set. The latter lets an admin who signed in the normal way
// reach /admin directly, without a second password prompt.
export async function isValidAdminOpaqueSession(sessionToken: string | undefined): Promise<boolean> {
  if (!sessionToken) return false;
  const supabase = await createServerSupabaseClient();
  const { data } = await (supabase as any)
    .from('admin_sessions')
    .select('expires_at')
    .eq('session_token', sessionToken)
    .maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

export async function isAdminSupabaseSession(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  return !!profile?.is_admin;
}
