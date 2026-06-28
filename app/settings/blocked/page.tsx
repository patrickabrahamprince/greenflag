import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ban } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UnblockButton } from '@/components/moderation/UnblockButton';

export default async function BlockedUsersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: blocks } = await supabase
    .from('blocked_pairs')
    .select('host_id, guest_id, created_at')
    .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const otherIds = (blocks ?? []).map((b) => (b.host_id === user.id ? b.guest_id : b.host_id));

  const { data: profiles } = otherIds.length
    ? await supabase.from('profiles').select('id, name, photos').in('id', otherIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="min-h-screen bg-[#FAF9F7] px-8 pb-24">
      <div className="flex items-center gap-3 py-6">
        <Link href="/settings" className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-['Playfair_Display'] text-2xl text-[#1A1A1A]">Blocked Users</h1>
      </div>

      {otherIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F0EDE9] flex items-center justify-center mb-4">
            <Ban className="w-6 h-6 text-[#1A1A1A]/40" />
          </div>
          <p className="text-[#1A1A1A]/50 text-sm">You haven&apos;t blocked anyone</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(blocks ?? []).map((b) => {
            const otherId = b.host_id === user.id ? b.guest_id : b.host_id;
            const profile = profileMap.get(otherId);
            return (
              <div
                key={otherId}
                className="flex items-center justify-between p-4 border border-[#E8E6E1] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0EDE9] overflow-hidden flex items-center justify-center">
                    {profile?.photos?.[0] ? (
                      <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-['Playfair_Display'] italic text-[#1A1A1A]/50">
                        {profile?.name?.[0] ?? '?'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[#1A1A1A]">{profile?.name ?? 'Unknown'}</span>
                </div>
                <UnblockButton userId={otherId} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
