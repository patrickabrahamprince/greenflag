// /app/profile/[id]/page.tsx

import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { TopNav } from '@/components/layout/TopNav';
import { PhotoGrid } from '@/components/profile/PhotoGrid';
import { getProfile } from '@/lib/supabase/profile';
import { ProfileActions } from './ProfileActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ViewProfilePage({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getProfile(params.id);

  if (!profile) {
    notFound();
  }

  const isOwn = session.user.id === profile.id;

  return (
    <main className="min-h-screen bg-[#FAF9F7] pb-24">
      <TopNav />
      
      <div className="max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <h1 className="font-['Playfair_Display'] text-2xl italic font-bold text-[#1A1A1A]">
          {profile.name}, {profile.age}
        </h1>

        <PhotoGrid photos={profile.photos} editable={false} />

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-xl">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50 mb-2">
            Bio
          </h3>
          <p className="text-sm leading-relaxed text-[#1A1A1A]/85 whitespace-pre-wrap">
            {profile.bio || "No bio description written yet."}
          </p>
        </div>

        {profile.instagram_handle && (
          <div className="bg-white border border-[#E8E6E1] px-5 py-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#1A1A1A]/50 font-medium">Instagram</span>
            <a
              href={`https://instagram.com/${profile.instagram_handle}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#C9A961] font-bold"
            >
              @{profile.instagram_handle}
            </a>
          </div>
        )}

        {!isOwn && <ProfileActions otherUserId={profile.id} />}
      </div>
    </main>
  );
}
