'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { AdminUser } from '@/components/admin/types';
import { UserProfileHeader } from '@/components/admin/UserProfileHeader';
import { UserActions } from '@/components/admin/UserActions';
import { UserCoinHistory } from '@/components/admin/UserCoinHistory';
import { UserConnectionsList } from '@/components/admin/UserConnectionsList';

interface CoinTx {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface UserConn {
  id: string;
  status: string;
  current_day: number;
  tasks_completed: number;
  started_at: string;
  expires_at: string | null;
  guest_name?: string;
  host_name?: string;
}

interface UserData {
  user: AdminUser;
  coinTransactions: CoinTx[];
  connections: UserConn[];
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const d = await res.json();
      setData(d);
    } catch {}
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#8E8E93] text-sm">User not found</p>
        <button onClick={() => router.push('/admin/users')} className="btn-secondary text-xs mt-4">Back to Users</button>
      </div>
    );
  }

  const { user, coinTransactions, connections } = data;

  return (
    <div className="animate-fade-in max-w-4xl">
      <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-[#8E8E93] hover:text-[#EDEADE] transition-colors mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <UserProfileHeader user={user} />
      <UserActions userId={user.id} isBanned={!!user.is_banned} onRefresh={fetchUser} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-[#EDEADE] mb-3">Profile Details</h3>
          <dl className="space-y-2 text-xs">
            {[
              ['Persona', user.persona || user.gender],
              ['Age', user.age],
              ['City', user.city_auto || user.city],
              ['Job', user.job],
              ['Height', user.height],
              ['Bio', user.bio, 'user-bio'],
              ['Interests', user.interests?.join(', ')],
              ['Coins', user.coins ?? 0],
              ['Connections', user.connected_count ?? 0],
              ['Last Active', user.last_active ? new Date(user.last_active).toLocaleString() : '-'],
              ['Joined', new Date(user.created_at).toLocaleString()],
              ['Banned Reason', user.banned_reason || user.ban_reason || '-'],
            ].map(([label, value, testId]) => (
              <div key={String(label)} className="flex justify-between">
                <dt className="text-[#8E8E93]">{String(label)}</dt>
                <dd className="text-[#EDEADE] text-right max-w-[60%] truncate"
                  data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' && testId ? testId : undefined}
                >{String(value || '-')}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <UserCoinHistory transactions={coinTransactions} currentBalance={user.coins ?? 0} />
        </div>
      </div>

      <div className="mt-4">
        <UserConnectionsList connections={connections} userId={user.id} />
      </div>

      {user.photos && user.photos.length > 0 && (
        <div className="mt-4 bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-[#EDEADE] mb-3">Photos</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {user.photos.map((photo, i) => (
              <img key={i} src={photo} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
