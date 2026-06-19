'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Analytics = {
  totalUsers: number
  hosts: number
  guests: number
  activeToday: number
  signupsToday: number
  connectionsCreated: number
  coinsInCirculation: number
}

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/analytics/overview')
    .then(res => {
        if (res.status === 401) return router.push('/login')
        if (res.status === 403) return router.push('/')
        return res.json()
      })
    .then(setData)
    .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="p-8 text-white">Loading...</div>

  const kpis = [
    { label: 'Total Users', value: data?.totalUsers?? 0 },
    { label: 'Hosts', value: data?.hosts?? 0 },
    { label: 'Guests', value: data?.guests?? 0 },
    { label: 'Active Today', value: data?.activeToday?? 0 },
    { label: 'Signups Today', value: data?.signupsToday?? 0 },
    { label: 'Connections', value: data?.connectionsCreated?? 0 },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/admin/users" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Users</Link>
          <Link href="/admin/reports" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Reports</Link>
          <Link href="/admin/audit" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Audit Log</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm">{kpi.label}</div>
            <div className="text-3xl font-bold mt-2">{kpi.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-sm">Coins in Circulation</div>
        <div className="text-2xl font-bold mt-1">{(data?.coinsInCirculation?? 0).toLocaleString()}</div>
      </div>
    </div>
  )
}