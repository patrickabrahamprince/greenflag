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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm">User not found</p>
        <button onClick={() => router.push('/admin/users')} className="btn-secondary text-xs mt-4">Back to Users</button>
      </div>
    );
  }

  const { user, coinTransactions, connections } = data;

  return (
    <div className="animate-fade-in max-w-4xl">
      <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <UserProfileHeader user={user} />
      <UserActions userId={user.id} userName={user.name} isBanned={!!user.is_banned} isAdmin={user.is_admin} approvalStatus={user.approval_status} onRefresh={fetchUser} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Profile Details</h3>
          <dl className="space-y-2 text-xs">
            {[
              ['Approval Status', user.approval_status || '-'],
              ['Persona', user.persona || user.gender],
              ['Age', user.age],
              ['Date of Birth', user.dob],
              ['City', user.city_auto || user.city],
              ['Phone', user.phone ? `${user.phone}${user.phone_verified ? ' (verified)' : ' (unverified)'}` : '-'],
              ['Job', user.job],
              ['Height', user.height],
              ['Bio', user.bio, 'user-bio'],
              ['Coins', user.coins ?? 0],
              ['Connections', user.connected_count ?? 0],
              ['Last Active', user.last_active ? new Date(user.last_active).toLocaleString() : '-'],
              ['Joined', new Date(user.created_at).toLocaleString()],
              ['Banned Reason', user.banned_reason || user.ban_reason || '-'],
              ['Rejection Reason', user.approval_reason || '-'],
            ].map(([label, value, testId]) => (
              <div key={String(label)} className="flex justify-between">
                <dt className="text-gray-500">{String(label)}</dt>
                <dd className="text-gray-900 text-right max-w-[60%] truncate"
                  data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' && testId ? testId : undefined}
                >{String(value || '-')}</dd>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Instagram</dt>
              <dd className="text-right">
                {user.instagram_url ? (
                  <a
                    href={user.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline underline-offset-2 hover:text-[#e0bd76]"
                  >
                    {user.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@')}
                  </a>
                ) : (
                  <span className="text-gray-900">-</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <UserCoinHistory transactions={coinTransactions} currentBalance={user.coins ?? 0} />
        </div>
      </div>

      {(user.interests_have?.length || user.interests_looking_for?.length || user.quiz_answers) && (
        <div className="mt-4 bg-white border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Interests & Quiz Answers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {!!user.interests_have?.length && (
              <div>
                <dt className="text-gray-500 mb-1">Interests</dt>
                <dd className="text-gray-900">{user.interests_have.join(', ')}</dd>
              </div>
            )}
            {!!user.interests_looking_for?.length && (
              <div>
                <dt className="text-gray-500 mb-1">Looking For</dt>
                <dd className="text-gray-900">{user.interests_looking_for.join(', ')}</dd>
              </div>
            )}
          </div>
          {user.quiz_answers && Object.keys(user.quiz_answers).length > 0 && (
            <dl className="space-y-1.5 text-xs mt-4 pt-4 border-t border-white/[0.06]">
              {Object.entries(user.quiz_answers).map(([q, a]) => (
                <div key={q} className="flex justify-between gap-4">
                  <dt className="text-gray-500 capitalize">{q.replace(/_/g, ' ')}</dt>
                  <dd className="text-gray-900 text-right">{a}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <div className="mt-4">
        <UserConnectionsList connections={connections} userId={user.id} />
      </div>

      {user.photos && user.photos.length > 0 && (
        <div className="mt-4 bg-white border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Photos</h3>
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
