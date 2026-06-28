import { createClient } from '@/lib/supabase/client';
import type { ReportReason, Block } from '@/types/moderation';

export async function blockUser(userId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (user.id === userId) return { error: 'Cannot block yourself' };

  const { error } = await supabase
    .from('blocked_pairs')
    .insert({ host_id: user.id, guest_id: userId });

  return { error: error?.message ?? null };
}

export async function unblockUser(userId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('blocked_pairs')
    .delete()
    .or(
      `and(host_id.eq.${user.id},guest_id.eq.${userId}),and(host_id.eq.${userId},guest_id.eq.${user.id})`
    );

  return { error: error?.message ?? null };
}

export async function reportUser(
  userId: string,
  reason: ReportReason,
  details: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  if (user.id === userId) return { error: 'Cannot report yourself' };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_id: userId,
    reason,
    details: details || null,
  });

  return { error: error?.message ?? null };
}

export async function unmatchUser(userId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase.rpc('unmatch_user', {
    p_other_user_id: userId,
  });

  if (error) return { error: error.message };
  const result = data as { success?: boolean; error?: string } | null;
  if (!result?.success) return { error: result?.error ?? 'unmatch_failed' };
  return { error: null };
}

export async function getBlockedUsers(): Promise<{
  blocks: (Block & { blocked_profile: { id: string; name: string; photos: string[] | null } })[];
  error: string | null;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { blocks: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('blocked_pairs')
    .select('host_id, guest_id, created_at')
    .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`);

  if (error) return { blocks: [], error: error.message };

  const otherIds = (data ?? []).map((b) => (b.host_id === user.id ? b.guest_id : b.host_id));
  if (otherIds.length === 0) return { blocks: [], error: null };

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, photos')
    .in('id', otherIds);

  if (profilesError) return { blocks: [], error: profilesError.message };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const blocks = (data ?? []).map((b) => {
    const otherId = b.host_id === user.id ? b.guest_id : b.host_id;
    return {
      ...b,
      blocked_profile: profileMap.get(otherId) ?? { id: otherId, name: 'Unknown', photos: [] },
    };
  });

  return { blocks, error: null };
}
