'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  LayoutDashboard, 
  ArrowLeft, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle,
  Coins,
  Heart
} from 'lucide-react'

type Stats = {
  totalUsers: number, 
  totalMatches: number, 
  totalMessages: number, 
  pendingReports: number,
  todaySignups: number, 
  todayMatches: number, 
  todayMessages: number,
  recentUsers: any[], 
  recentMatches: any[], 
  recentMessages: any[], 
  reports: any[],
  userGrowth: any[], 
  matchActivity: any[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages' | 'reports'>('overview')
  const [userSearch, setUserSearch] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = (await supabase.from('profiles').select('is_admin').eq('id', user.id).single()) as any
      if (!profile?.is_admin) {
        router.push('/')
        return
      }

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
        supabase.from('connections').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('connections').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('id, name, email, created_at, coins, is_banned, role, gender').order('created_at', { ascending: false }).limit(100),
        supabase.from('connections').select('id, created_at, status, guest:profiles!connections_guest_id_fkey(name), host:profiles!connections_host_id_fkey(name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('messages').select('id, connection_id, created_at, content, sender_id, sender:profiles!messages_sender_id_fkey(name)').order('created_at', { ascending: false }).limit(150),
        supabase.from('reports').select('id, created_at, reason, status, reporter_id, reported_id, reporter:profiles!reports_reporter_id_fkey(name), reported:profiles!reports_reported_id_fkey(name)').order('created_at', { ascending: false }),
        supabase.from('admin_user_stats').select('*').limit(30),
        supabase.from('admin_match_stats').select('*').limit(30)
      ])

      setStats({
        totalUsers: totalUsers || 0, 
        totalMatches: totalMatches || 0, 
        totalMessages: totalMessages || 0, 
        pendingReports: pendingReports || 0,
        todaySignups: todaySignups || 0, 
        todayMatches: todayMatches || 0, 
        todayMessages: todayMessages || 0,
        recentUsers: recentUsers || [], 
        recentMatches: recentMatches || [], 
        recentMessages: recentMessages || [], 
        reports: reports || [],
        userGrowth: userGrowth || [], 
        matchActivity: matchActivity || []
      })
    } catch (e) {
      console.error('Error loading admin stats:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [router])

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to BAN this user?')) return
    setActionLoading(`ban-${userId}`)
    const { error } = await (supabase as any).rpc('admin_ban_user', { p_user_id: userId, p_reason: 'Banned by admin panel' })
    if (error) {
      alert(`Error banning user: ${error.message}`)
    } else {
      await loadData()
    }
    setActionLoading(null)
  }

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to UNBAN this user?')) return
    setActionLoading(`unban-${userId}`)
    const { error } = await (supabase as any).rpc('admin_unban_user', { p_user_id: userId })
    if (error) {
      alert(`Error unbanning user: ${error.message}`)
    } else {
      await loadData()
    }
    setActionLoading(null)
  }

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'actioned' | 'dismissed') => {
    setActionLoading(`report-${reportId}`)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await (supabase.from('reports') as any)
      .update({ 
        status, 
        resolved_at: new Date().toISOString(), 
        resolved_by: user?.id 
      })
      .eq('id', reportId)

    if (error) {
      alert(`Error updating report: ${error.message}`)
    } else {
      await loadData()
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading GreenFlag Admin...</p>
        </div>
      </div>
    )
  }

  // Filtered Lists
  const filteredUsers = stats?.recentUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id?.includes(userSearch)
  ) || []

  const filteredMessages = stats?.recentMessages.filter(m => 
    m.content?.toLowerCase().includes(messageSearch.toLowerCase()) || 
    m.sender?.name?.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.sender_id?.includes(messageSearch)
  ) || []

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans">
      
      {/* Sidebar Panel - macOS Style */}
      <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col justify-between h-screen sticky top-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[#222]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                <Heart className="w-5 h-5 text-black fill-black" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#D4AF37] tracking-tight">GreenFlag</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Admin Engine</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'overview' 
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'users' 
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              Users ({stats?.totalUsers})
            </button>

            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'messages' 
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages ({stats?.totalMessages})
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'reports' 
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Reports 
              {stats?.pendingReports && stats.pendingReports > 0 ? (
                <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {stats.pendingReports}
                </span>
              ) : null}
            </button>
          </nav>
        </div>

        {/* Footer / Exit */}
        <div className="p-4 border-t border-[#222]">
          <button 
            onClick={() => router.push('/discover')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#222] hover:border-gray-600 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top bar with active page name */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight capitalize text-white">{activeTab}</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time system state monitoring</p>
          </div>
          <div className="text-xs text-gray-400 bg-[#161616] border border-[#222] px-3.5 py-2 rounded-lg font-medium">
            System Live: <span className="text-emerald-400 font-bold ml-1">● Online</span>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPI 
                title="Total Members" 
                value={stats?.totalUsers} 
                sub={`+${stats?.todaySignups} today`} 
                icon={<Users className="w-4 h-4 text-[#D4AF37]" />}
              />
              <KPI 
                title="Total Connections" 
                value={stats?.totalMatches} 
                sub={`+${stats?.todayMatches} today`} 
                icon={<Heart className="w-4 h-4 text-[#D4AF37]" />}
              />
              <KPI 
                title="Messages Exchanged" 
                value={stats?.totalMessages} 
                sub={`+${stats?.todayMessages} today`} 
                icon={<MessageSquare className="w-4 h-4 text-[#D4AF37]" />}
              />
              <KPI 
                title="Open Reports" 
                value={stats?.pendingReports} 
                sub="Requires moderator action" 
                alert={stats?.pendingReports ? stats.pendingReports > 0 : false}
                icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
              />
            </div>

            {/* Visual Analytics - User Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* User growth graph container */}
              <div className="lg:col-span-2 bg-[#161616] border border-[#222] rounded-2xl p-6">
                <h3 className="text-md font-semibold text-white mb-6">User Signups &mdash; Last 30 Days</h3>
                {stats?.userGrowth && stats.userGrowth.length > 0 ? (
                  <div className="h-56 flex items-end gap-1.5 pt-4">
                    {stats.userGrowth.slice(0, 30).reverse().map((d: any) => {
                      const maxSignups = Math.max(...stats.userGrowth.map((x: any) => x.signups)) || 1;
                      const heightPercent = Math.max(4, (d.signups / maxSignups) * 100);
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-[#D4AF37] text-black font-bold text-[10px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-10">
                            {d.signups} signups ({new Date(d.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})})
                          </div>
                          {/* Bar */}
                          <div 
                            className="w-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-t group-hover:bg-[#D4AF37] transition duration-200"
                            style={{ height: `${heightPercent}%` }} 
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center border border-dashed border-[#222] rounded-xl text-gray-500 text-sm">
                    No signup history data found.
                  </div>
                )}
              </div>

              {/* Match Activity summary */}
              <div className="bg-[#161616] border border-[#222] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-semibold text-white mb-2">Match Connections</h3>
                  <p className="text-xs text-gray-500 mb-6">Total overview of connections created by members</p>
                  
                  {stats?.recentMatches && stats.recentMatches.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentMatches.slice(0, 4).map((m: any) => (
                        <div key={m.id} className="flex justify-between items-center bg-[#1e1e1e]/40 p-3 rounded-lg border border-[#222]">
                          <div>
                            <p className="text-xs font-semibold text-[#D4AF37]">{m.guest?.name || 'Guest'} &mdash; {m.host?.name || 'Host'}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{new Date(m.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            m.status === 'chat_unlocked' || m.status === 'completed' || m.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : m.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No match connections logged yet.</div>
                  )}
                </div>

                <button 
                  onClick={() => setActiveTab('users')}
                  className="w-full mt-6 py-2.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black rounded-lg text-xs font-bold transition duration-200"
                >
                  Manage System Users
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4 items-center bg-[#161616] p-4 rounded-xl border border-[#222]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Search members by name, email, or profile ID..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#222] focus:border-[#D4AF37] rounded-lg text-sm text-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Users Data Grid */}
            <div className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#111] text-gray-400 border-b border-[#222]">
                    <tr>
                      <th className="p-4 text-left font-semibold">User</th>
                      <th className="p-4 text-left font-semibold">Email</th>
                      <th className="p-4 text-left font-semibold">Metadata</th>
                      <th className="p-4 text-left font-semibold">Joined</th>
                      <th className="p-4 text-left font-semibold">Wallet</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]/80">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/5 transition duration-150">
                          <td className="p-4">
                            <span className="font-semibold text-white block">{u.name || 'No Name'}</span>
                            <span className="text-[10px] text-gray-500 block font-mono mt-0.5">{u.id}</span>
                          </td>
                          <td className="p-4 text-gray-300">{u.email || '(None)'}</td>
                          <td className="p-4">
                            <span className="text-xs uppercase bg-[#222] px-2 py-0.5 rounded text-gray-400">
                              {u.gender || u.role || 'Unset'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-[#D4AF37]">
                            <div className="flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5" />
                              {u.coins ?? 0}
                            </div>
                          </td>
                          <td className="p-4">
                            {u.is_banned ? (
                              <span className="text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10">Banned</span>
                            ) : (
                              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">Active</span>
                            )}
                          </td>
                          <td className="p-4">
                            {u.is_banned ? (
                              <button 
                                onClick={() => handleUnbanUser(u.id)}
                                disabled={actionLoading === `unban-${u.id}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg text-xs font-semibold transition"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {actionLoading === `unban-${u.id}` ? 'Unbanning...' : 'Unban'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBanUser(u.id)}
                                disabled={actionLoading === `ban-${u.id}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black rounded-lg text-xs font-semibold transition"
                              >
                                <Ban className="w-3 h-3" />
                                {actionLoading === `ban-${u.id}` ? 'Banning...' : 'Ban'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No members found matching "{userSearch}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-[#161616] p-4 rounded-xl border border-[#222]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Filter messages by content, sender name, or ID..."
                  value={messageSearch}
                  onChange={e => setMessageSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#222] focus:border-[#D4AF37] rounded-lg text-sm text-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Messages Data Table */}
            <div className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#111] text-gray-400 border-b border-[#222]">
                    <tr>
                      <th className="p-4 text-left font-semibold">Timestamp</th>
                      <th className="p-4 text-left font-semibold">Sender</th>
                      <th className="p-4 text-left font-semibold">Connection ID</th>
                      <th className="p-4 text-left font-semibold">Content</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]/80">
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((m: any) => (
                        <tr key={m.id} className="hover:bg-white/5 transition duration-150">
                          <td className="p-4 text-gray-500 text-xs">
                            {new Date(m.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-[#D4AF37]">
                            {m.sender?.name || 'System User'}
                            <span className="text-[10px] text-gray-500 block font-mono font-normal mt-0.5">{m.sender_id}</span>
                          </td>
                          <td className="p-4 text-gray-400 font-mono text-xs truncate max-w-[120px]" title={m.connection_id}>
                            {m.connection_id}
                          </td>
                          <td className="p-4 text-gray-200 font-medium max-w-lg break-words">
                            {m.content}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No messages found matching search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-2">System Moderation Tickets</h3>
            <p className="text-xs text-gray-500 -mt-4">Act on user complaints, evaluate violations, and manage bans.</p>

            {stats?.reports && stats.reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.reports.map((r: any) => {
                  const isPending = r.status === 'pending'
                  return (
                    <div key={r.id} className={`border rounded-2xl p-6 transition flex flex-col justify-between ${
                      isPending 
                        ? 'bg-[#161616] border-red-950/60 shadow-lg shadow-red-950/5' 
                        : 'bg-[#121212]/80 border-[#222]'
                    }`}>
                      <div>
                        {/* Heading / Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Ticket #{r.id}</span>
                            <p className="text-xs text-gray-400 mt-1">
                              Logged on: {new Date(r.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            isPending 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        {/* Parties involved */}
                        <div className="bg-[#0A0A0A]/60 border border-[#222] p-3 rounded-lg text-xs space-y-1.5 mb-4">
                          <p><span className="text-gray-500">Reporter:</span> <span className="font-semibold text-white">{r.reporter?.name || 'System Guest'}</span> <span className="text-gray-500 font-mono">({r.reporter_id})</span></p>
                          <p><span className="text-gray-500">Accused:</span> <span className="font-semibold text-[#D4AF37]">{r.reported?.name || 'System Host'}</span> <span className="text-gray-500 font-mono">({r.reported_id})</span></p>
                        </div>

                        {/* Complaint Details */}
                        <div className="space-y-1.5 mb-6">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Complaint Reason</span>
                          <p className="text-sm font-medium text-gray-200">{r.reason}</p>
                          {r.details && (
                            <p className="text-xs text-gray-400 mt-1 italic font-normal bg-[#0a0a0a]/30 p-2.5 rounded border border-[#222]/30">"{r.details}"</p>
                          )}
                        </div>
                      </div>

                      {/* Moderation Actions */}
                      {isPending && (
                        <div className="flex gap-2 border-t border-[#222] pt-4 mt-auto">
                          <button 
                            onClick={() => handleBanUser(r.reported_id)}
                            disabled={actionLoading === `ban-${r.reported_id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition duration-150"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Ban Accused
                          </button>
                          
                          <button 
                            onClick={() => handleResolveReport(r.id, 'dismissed')}
                            disabled={actionLoading === `report-${r.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition duration-150"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Dismiss
                          </button>
                          
                          <button 
                            onClick={() => handleResolveReport(r.id, 'reviewed')}
                            disabled={actionLoading === `report-${r.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37] disabled:opacity-50 text-[#D4AF37] hover:text-black rounded-lg text-xs font-bold transition duration-150"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-[#222] rounded-2xl text-gray-500 text-sm">
                No moderation tickets logged.
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  )
}

function KPI({ title, value, sub, alert, icon }: any) {
  return (
    <div className="bg-[#161616] border border-[#222] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-xs font-medium tracking-tight block">{title}</span>
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-[#222]">
            {icon}
          </div>
        </div>
        <p className={`text-3xl font-extrabold tracking-tight ${alert ? 'text-red-400' : 'text-white'}`}>
          {value !== undefined ? value.toLocaleString() : '0'}
        </p>
      </div>
      <p className="text-[10px] text-gray-500 font-semibold mt-3 flex items-center gap-1 uppercase tracking-wider">{sub}</p>
    </div>
  )
}