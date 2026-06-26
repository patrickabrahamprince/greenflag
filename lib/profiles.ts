import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface OppositeGenderProfile {
  id: string;
  name: string;
  gender: 'man' | 'woman';
  avatar: string | null;
  onboarding_completed: boolean;
}

/**
 * Returns all completed profiles of the opposite gender.
 *
 * RLS migration `20261202000000_fix_profiles_rls_critical.sql` has been applied
 * to the production DB — the `opposite_gender_only` policy now handles gender
 * gating server-side. This app-level filter is kept as defence-in-depth.
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
    .select('id, name, gender, avatar, onboarding_completed')
    .neq('id', currentUserId)
    .eq('onboarding_completed', true)
    .neq('gender', currentUserGender)
    .not('gender', 'is', null);

  if (error) {
    return { profiles: [], error: error.message };
  }

  return { profiles: profiles as OppositeGenderProfile[], error: null };
}
