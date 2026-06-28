// /lib/supabase/profile.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Photo, Like, Profile } from '@/types/profile';

export const getSupabaseClient = () => {
  return createClientComponentClient();
};

export async function uploadPhoto(file: File, position: number): Promise<Photo> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const filePath = `${user.id}/${Date.now()}.jpg`;

  // 1. Upload file to profile-photos bucket
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data: publicUrlData } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
  const url = publicUrlData.publicUrl;

  // 3. Check if this is the first photo (position = 0) to set as primary
  const isPrimary = position === 0;

  // 4. Save photo record to public.photos
  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      user_id: user.id,
      url,
      position,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data as Photo;
}

export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Fetch photo to get the file path in storage
  const { data: photo } = await supabase
    .from('photos')
    .select('url')
    .eq('id', photoId)
    .single();

  if (photo) {
    // Extract file path from public URL
    const urlParts = photo.url.split('/profile-photos/');
    if (urlParts.length > 1) {
      const storagePath = urlParts[1];
      await supabase.storage.from('profile-photos').remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (error) throw error;
}

export async function reorderPhotos(photoIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Update positions sequentially based on array index
  const updates = photoIds.map((id, index) => {
    return supabase
      .from('photos')
      .update({ position: index, is_primary: index === 0 })
      .eq('id', id);
  });

  await Promise.all(updates);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) return null;

  // Fetch related photos
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  const typedPhotos: Photo[] = (photosError ? [] : (photos as Photo[])) || [];

  return {
    ...profile,
    photos: typedPhotos,
  } as Profile;
}

export async function getLikesReceived(): Promise<Like[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('likes_received' as any)
    .select('*');

  if (error) throw error;
  return (data as Like[]) || [];
}

export async function createLike(
  toUserId: string,
  type: 'like' | 'super' = 'like'
): Promise<{ match: boolean; conversationId?: string }> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const currentUserId = user.id;

  // 1. Check not blocked either direction
  const { data: blocked } = await supabase
    .from('blocked_pairs')
    .select('host_id')
    .or(
      `and(host_id.eq.${currentUserId},guest_id.eq.${toUserId}),and(host_id.eq.${toUserId},guest_id.eq.${currentUserId})`
    )
    .maybeSingle();

  if (blocked) throw new Error('Cannot like blocked user');

  // 2. Check if we already liked the user
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('from_user_id', currentUserId)
    .eq('to_user_id', toUserId)
    .maybeSingle();

  if (!existingLike) {
    // 2a. Insert new like
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        from_user_id: currentUserId,
        to_user_id: toUserId,
        type,
      });

    if (insertError) throw insertError;
  }

  // 3. Check for reciprocal like
  const { data: reciprocalLike } = await supabase
    .from('likes')
    .select('*')
    .eq('from_user_id', toUserId)
    .eq('to_user_id', currentUserId)
    .maybeSingle();

  if (reciprocalLike) {
    // Reciprocal like exists! Establish a match and conversation.
    const [user1_id, user2_id] =
      currentUserId < toUserId
        ? [currentUserId, toUserId]
        : [toUserId, currentUserId];

    // Create match record
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({ user1_id, user2_id })
      .select()
      .single();

    if (matchError) throw matchError;

    // Create conversation record
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ user1_id, user2_id })
      .select()
      .single();

    if (convError) throw convError;

    // Fetch profile names for notification personalization
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', currentUserId)
      .single();

    const { data: otherUserProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', toUserId)
      .single();

    const currentUserName = currentUserProfile?.name || 'Someone';
    const otherUserName = otherUserProfile?.name || 'Someone';

    // Trigger match notifications for both users
    try {
      await supabase.rpc('create_notification', {
        p_user_id: toUserId,
        p_type: 'match',
        p_title: 'New Match!',
        p_body: `${currentUserName} liked you back`,
        p_link: `/chat/${conv.id}`,
        p_metadata: { conversationId: conv.id },
      });

      await supabase.rpc('create_notification', {
        p_user_id: currentUserId,
        p_type: 'match',
        p_title: 'New Match!',
        p_body: `You matched with ${otherUserName}`,
        p_link: `/chat/${conv.id}`,
        p_metadata: { conversationId: conv.id },
      });
    } catch (notifyErr) {
      console.error('Match notification triggers failed:', notifyErr);
    }

    return { match: true, conversationId: conv.id };
  }

  return { match: false };
}
