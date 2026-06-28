// /app/profile/edit/page.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Photo, Profile } from '@/types/profile';
import { EditProfileForm } from './EditProfileForm';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch profiles
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profileData) {
    redirect('/onboard');
  }

  // Fetch photos
  const { data: photosData } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', session.user.id)
    .order('position', { ascending: true });

  const photos: Photo[] = (photosData as Photo[]) || [];

  const profile: Profile = {
    ...profileData,
    photos,
  } as Profile;

  return (
    <main className="min-h-screen bg-[#FAF9F7] py-6">
      <EditProfileForm initialProfile={profile} />
    </main>
  );
}
