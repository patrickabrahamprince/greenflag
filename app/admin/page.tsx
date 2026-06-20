'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const router = useRouter()

  const load = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const profile = profileData as any
      if (!profile?.is_admin) { setError('Not admin'); setLoading(false); return }

      const res = await fetch('/api/admin')
      if (!res.ok) throw new Error('Failed to load admin data')
      const adminData = await res.json()
      setData(adminData)
      setLoading(false)
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const banUser = async (id: string, reason: string) => {
    await fetch(`/api/admin/users/${id}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    load()
  }

  const unbanUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}/unban`, { method: 'POST' })
    load()
  }

  const toggleAdmin = async (id: string, _current: boolean) => {
    await fetch(`/api/admin/users/${id}/set-admin`, { method: 'POST' })
    load()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user + all data? Cannot undo.')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
  }

  const deleteReport = async (id: string) => {
    await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] text-white p-8">Loading...</div>
  if (error) return <div className="min-h-screen bg-[#0A0A0A] text-red-400 p-8">Error: {error}</div>

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#D4AF37]">GreenFlag Admin</h1>
        <button onClick={load} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-sm hover:bg-[#2A2A2A]">Refresh</button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[#2A2A2A] overflow-x-auto">
        {(['overview', 'users', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 capitalize whitespace-nowrap ${tab === t? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400'}`}>
            {t} {t === 'reports' && data?.reports?.length > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full ml-1">{data.reports.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Total Users" value={data?.profiles} />
          <KPI label="Banned" value={data?.users?.filter((u: any) => u.is_banned).length} />
          <KPI label="Matches" value={data?.connections} />
          <KPI label="Reports" value={data?.reports?.length} />
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text-gray-400">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u: any) => (
                <tr key={u.id} className="border-t border-[#2A2A2A]">
                  <td className="p-3">
                    <div className="font-medium">{u.name || 'No name'}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="p-3">
                    {u.is_admin && <span className="bg-[#D4AF37] text-black text-xs px-2 py-1 rounded">Admin</span>}
                    {u.is_banned && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded ml-1">Banned</span>}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{u.created_at? new Date(u.created_at).toLocaleDateString() : ''}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      {u.is_banned? (
                        <button onClick={() => unbanUser(u.id)} className="px-3 py-1 bg-green-600 text-xs rounded hover:bg-green-700">Unban</button>
                      ) : (
                        <button onClick={() => banUser(u.id, prompt('Ban reason:') || 'Violation')} className="px-3 py-1 bg-red-600 text-xs rounded hover:bg-red-700">Ban</button>
                      )}
                      <button onClick={() => toggleAdmin(u.id, u.is_admin)} className="px-3 py-1 bg-[#2A2A2A] text-xs rounded hover:bg-[#3A3A3A]">
                        {u.is_admin? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-red-900 text-xs rounded hover:bg-red-800">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          {data?.reports?.length === 0 && <div className="text-gray-500 text-center py-8">No reports</div>}
          {data?.reports?.map((r: any) => (
            <div key={r.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-red-400 font-medium">{r.reporter?.name || 'Unknown'}</span>
                  <span className="text-gray-500 mx-2">reported</span>
                  <span className="text-white font-medium">{r.reported?.name || 'Unknown'}</span>
                </div>
                <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{r.reason || 'No reason provided'}</p>
              <div className="flex gap-2">
                <button onClick={() => banUser(r.reported_id, `Report: ${r.reason}`)} className="px-3 py-1 bg-red-600 text-xs rounded hover:bg-red-700">Ban User</button>
                <button onClick={() => deleteReport(r.id)} className="px-3 py-1 bg-[#2A2A2A] text-xs rounded hover:bg-[#3A3A3A]">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KPI({ label, value }: any) {
  return <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
    <p className="text-gray-400 text-xs">{label}</p>
    <p className="text-3xl font-bold text-white mt-1">{value?? 0}</p>
  </div>
}
