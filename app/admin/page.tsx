'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Stats = {
  totalUsers: number, totalMatches: number, totalMessages: number, pendingReports: number,
  todaySignups: number, todayMatches: number, todayMessages: number,
  recentUsers: any[], recentMatches: any[], recentMessages: any[], reports: any[],
  userGrowth: any[], matchActivity: any[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'reports'>('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = (await supabase.from('profiles').select('is_admin').eq('id', user.id).single()) as any
      if (!profile?.is_admin) return router.push('/')

      const today = new Date().toISOString().split('T')[0]

      const [
        { count: totalUsers },
        { count: totalMatches },
        { count: totalMessages },
        { count: pendingReports },
        { count: todaySignups },
        { count: todayMatches },
        { count: todayMessages },
        { data: recentUsers },
        { data: recentMatches },
        { data: recentMessages },
        { data: reports },
        { data: userGrowth },
        { data: matchActivity }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('matches').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('id, name, email, created_at, coins, is_banned').order('created_at', { ascending: false }).limit(20),
        supabase.from('matches').select('id, created_at, status, user1:profiles!matches_user1_id_fkey(name), user2:profiles!matches_user2_id_fkey(name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('messages').select('id, created_at, content, sender:profiles!messages_sender_id_fkey(name), receiver:profiles!messages_receiver_id_fkey(name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('reports').select('id, created_at, reason, status, reporter:profiles!reports_reporter_id_fkey(name), reported:profiles!reports_reported_id_fkey(name)').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('admin_user_stats').select('*').limit(30),
        supabase.from('admin_match_stats').select('*').limit(30)
      ])

      setStats({
        totalUsers: totalUsers || 0, totalMatches: totalMatches || 0, totalMessages: totalMessages || 0, pendingReports: pendingReports || 0,
        todaySignups: todaySignups || 0, todayMatches: todayMatches || 0, todayMessages: todayMessages || 0,
        recentUsers: recentUsers || [], recentMatches: recentMatches || [], recentMessages: recentMessages || [], reports: reports || [],
        userGrowth: userGrowth || [], matchActivity: matchActivity || []
      })
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const banUser = async (userId: string) => {
    await (supabase.from('profiles') as any).update({ is_banned: true }).eq('id', userId)
    window.location.reload()
  }

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] text-white p-8">Loading admin data...</div>

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#D4AF37] mb-6">GreenFlag Admin</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#2A2A2A]">
        {(['overview', 'users', 'messages', 'reports'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPI title="Total Users" value={stats?.totalUsers} sub={`+${stats?.todaySignups} today`} />
            <KPI title="Total Matches" value={stats?.totalMatches} sub={`+${stats?.todayMatches} today`} />
            <KPI title="Messages Sent" value={stats?.totalMessages} sub={`+${stats?.todayMessages} today`} />
            <KPI title="Pending Reports" value={stats?.pendingReports} sub="Needs review" alert />
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Growth - Last 30 Days</h2>
            <div className="h-48 flex items-end gap-1">
              {stats?.userGrowth.slice(0, 30).reverse().map((d: any) => (
                <div key={d.date} className="flex-1 bg-[#D4AF37] opacity-70 hover:opacity-100"
                  style={{ height: `${(d.signups / Math.max(...stats.userGrowth.map((x: any) => x.signups))) * 100}%` }}
                  title={`${d.date}: ${d.signups} signups`} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text-gray-400">
              <tr><th className="p-3 text-left">User</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Joined</th><th className="p-3 text-left">Coins</th><th className="p-3 text-left">Action</th></tr>
            </thead>
            <tbody>
              {stats?.recentUsers.map((u: any) => (
                <tr key={u.id} className="border-t border-[#2A2A2A]">
                  <td className="p-3">{u.name} {u.is_banned && <span className="text-red-400 text-xs">[BANNED]</span>}</td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-[#D4AF37]">{u.coins}</td>
                  <td className="p-3"><button onClick={() => banUser(u.id)} className="text-red-400 text-xs hover:underline">Ban</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages Tab - WHO SENT WHAT TO WHOM */}
      {activeTab === 'messages' && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text-gray-400">
              <tr><th className="p-3 text-left">Time</th><th className="p-3 text-left">From</th><th className="p-3 text-left">To</th><th className="p-3 text-left">Message</th></tr>
            </thead>
            <tbody>
              {stats?.recentMessages.map((m: any) => (
                <tr key={m.id} className="border-t border-[#2A2A2A]">
                  <td className="p-3 text-gray-500 text-xs">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-3 text-[#D4AF37]">{m.sender?.name}</td>
                  <td className="p-3 text-white">{m.receiver?.name}</td>
                  <td className="p-3 text-gray-300 max-w-md truncate">{m.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {stats?.reports.map((r: any) => (
            <div key={r.id} className="bg-[#1A1A1A] border border-red-900 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm"><span className="text-[#D4AF37]">{r.reporter?.name}</span> reported <span className="text-red-400">{r.reported?.name}</span></p>
                  <p className="text-gray-400 mt-1">Reason: {r.reason}</p>
                  <p className="text-gray-500 text-xs mt-2">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <button className="text-red-400 text-sm hover:underline">Ban User</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KPI({ title, value, sub, alert }: any) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
      <p className="text-gray-400 text-xs">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${alert? 'text-red-400' : 'text-white'}`}>{value || 0}</p>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
  )
}