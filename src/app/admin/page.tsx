import { getAdminUser } from '@/lib/admin';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import AdminCharts from '@/components/AdminCharts';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

// Disable caching – page will be regenerated on every request
export const revalidate = 0;

async function getStats() {
  // Verify admin
  const admin = await getAdminUser();
  if (!admin) redirect('/login');

  // Parallel queries
  const promises = [
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).maybeSingle(),
    supabaseAdmin
      .from('tests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'live'),
    supabaseAdmin.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('connections').select('id', { count: 'exact', head: true }).eq('messages_unlocked', true),
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabaseAdmin
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('banned', true),
  ];

  const [totalUsers, liveStandards, activeMatches, pendingReviews, chatsUnlocked, signupsToday, submissionsToday, bannedUsers] =
    await Promise.all(promises);

  // Signups per day last 7 days (client-side aggregation)
  const { data: profiles7 } = await supabaseAdmin
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at');

  const signupCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    signupCounts[d] = 0;
  }
  profiles7?.forEach((p) => {
    const d = p.created_at.split('T')[0];
    if (signupCounts[d] !== undefined) {
      signupCounts[d]++;
    }
  });
  const signups7 = Object.entries(signupCounts).map(([date, count]) => ({ date, count }));

  // Submissions by status (parallel head-counts)
  const [submittedCount, approvedCount, rejectedCount] = await Promise.all([
    supabaseAdmin.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabaseAdmin.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
  ]);

  const submissionsByStatus = [
    { status: 'submitted', count: submittedCount.count ?? 0 },
    { status: 'approved', count: approvedCount.count ?? 0 },
    { status: 'rejected', count: rejectedCount.count ?? 0 },
  ];

  // Latest 10 signups
  const { data: latestSignups } = await supabaseAdmin
    .from('profiles')
    .select('id, name, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    totalUsers: totalUsers.count ?? 0,
    liveStandards: liveStandards.count ?? 0,
    activeMatches: activeMatches.count ?? 0,
    pendingReviews: pendingReviews.count ?? 0,
    chatsUnlocked: chatsUnlocked.count ?? 0,
    signupsToday: signupsToday.count ?? 0,
    submissionsToday: submissionsToday.count ?? 0,
    bannedUsers: bannedUsers.count ?? 0,
    signups7: signups7 ?? [],
    submissionsByStatus: submissionsByStatus ?? [],
    latestSignups: latestSignups ?? [],
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cardData = [
    { title: 'Total Users', value: stats.totalUsers },
    { title: 'Live Standards', value: stats.liveStandards },
    { title: 'Active Matches', value: stats.activeMatches },
    { title: 'Pending Reviews', value: stats.pendingReviews },
    { title: 'Chats Unlocked', value: stats.chatsUnlocked },
    { title: 'Signups Today', value: stats.signupsToday },
    { title: 'Submissions Today', value: stats.submissionsToday },
    { title: 'Banned Users', value: stats.bannedUsers },
  ];

  const signupChartData = stats.signups7.map((row: any) => ({
    date: new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: Number(row.count),
  }));

  const submissionChartData = stats.submissionsByStatus.map((row: any) => ({
    status: row.status,
    count: Number(row.count),
  }));

  return (
    <>
      {/* Auto‑refresh every 30 seconds */}
      <meta httpEquiv="refresh" content="30" />

      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cardData.map((card) => (
            <div
              key={card.title}
              className="bg-white shadow-sm rounded-lg p-4 text-center"
            >
              <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <AdminCharts signupChartData={signupChartData} submissionChartData={submissionChartData} />

        {/* Latest Signups Table */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-lg font-medium mb-4">Latest 10 Signups</h4>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {stats.latestSignups.map((user: any) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.name ?? '—'}
                    </a>
                  </td>
                  <td className="px-4 py-2">{user.phone ?? '—'}</td>
                  <td className="px-4 py-2">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
