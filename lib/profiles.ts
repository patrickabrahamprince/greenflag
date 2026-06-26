import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface OppositeGenderProfile {
  id: string;
  name: string;
  gender: 'man' | 'woman';
  avatar_url: string | null;
  onboarding_completed: boolean;
}

/**
 * Returns all completed profiles of the opposite gender.
 *
 * Server-side filtering only — true server-side protection requires dropping
 * the `profiles_public_read` RLS policy via migration
 * `20261202000000_fix_profiles_rls_critical.sql`. Without that fix, the
 * raw API bypasses this gender filter because RLS permits SELECT on any
 * active profile regardless of gender.
 */
export async function getOppositeGenderProfiles(): Promise<{
  profiles: OppositeGenderProfile[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { profiles: [], error: 'Unauthorized' };
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single();

  if (!currentProfile?.gender) {
    return { profiles: [], error: null };
  }

  const currentUserGender = currentProfile.gender;
  const currentUserId = user.id;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, gender, avatar_url, onboarding_completed')
    .neq('id', currentUserId)
    .eq('onboarding_completed', true)
    .neq('gender', currentUserGender)
    .not('gender', 'is', null);

  if (error) {
    return { profiles: [], error: error.message };
  }

  return { profiles: profiles as OppositeGenderProfile[], error: null };
}
