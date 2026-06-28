// /app/likes/page.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { TopNav } from '@/components/layout/TopNav';
import { LikesList } from '@/components/likes/LikesList';

export const dynamic = 'force-dynamic';

export default async function LikesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <TopNav />
      <LikesList />
    </main>
  );
}
