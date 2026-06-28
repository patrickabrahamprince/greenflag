import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface OppositeGenderProfile {
  id: string;
  name: string;
  persona: 'man' | 'woman';
  avatar: string | null;
  onboarding_completed: boolean;
}

/**
 * Returns all completed profiles of the opposite persona.
 *
 * RLS migration `20261203000000_ship_phase1_fixes.sql` makes `persona` the
 * source of truth (the `gender` column is dropped). This app-level filter
 * is kept as defence-in-depth alongside the `view_opposite_gender` RLS policy.
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
    .select('persona')
    .eq('id', user.id)
    .single();

  if (!currentProfile?.persona) {
    return { profiles: [], error: null };
  }

  const currentUserPersona = currentProfile.persona;
  const currentUserId = user.id;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, persona, avatar, onboarding_completed')
    .neq('id', currentUserId)
    .eq('onboarding_completed', true)
    .neq('persona', currentUserPersona)
    .not('persona', 'is', null);

  if (error) {
    return { profiles: [], error: error.message };
  }

  return { profiles: profiles as OppositeGenderProfile[], error: null };
}
