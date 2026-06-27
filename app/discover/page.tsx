'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CoinBadge } from '@/components/shared/coin-badge'
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel'
import { createClient } from '@/lib/supabase/client'

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [persona, setPersona] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const observer = useRef<IntersectionObserver>()
  const lastProfileRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const fetchedForPage = useRef<Set<number>>(new Set())

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('persona').eq('id', user.id).single().then(({ data }) => {
        if (data?.persona) setPersona(data.persona)
      })
    })
  }, [])

  useEffect(() => {
    if (!fetchedForPage.current.has(page)) {
      fetchedForPage.current.add(page)
      fetchProfiles()
    }
  }, [page])

  async function fetchProfiles() {
    setLoading(true)
    try {
      const res = await fetch('/api/discover')
      const json = await res.json()
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = (json.profiles ?? []).filter((p: any) => p.photos?.length > 0)
      if (data.length < 3) setHasMore(false)
      setProfiles(prev => page === 0 ? data : [...prev, ...data])
    } catch {
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  async function handleBegin(profileId: string) {
    if (loading) return
    setLoading(true)
    try {
      if (persona === 'woman') {
        router.push(`/profile/${profileId}`)
        return
      }
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ woman_id: profileId })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to start')
      }
      const { connectionId: connection_id } = await res.json()
      router.push(`/intentions/${connection_id}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative bg-[#0A0A0A] min-h-screen">
      <div className="fixed top-0 z-50 w-full flex items-center justify-between pt-safe px-4 py-4 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent">
        <button onClick={() => router.push('/connections')} className="btn-ghost p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <CoinBadge />
      </div>

      <div className="snap-y snap-mandatory overflow-y-scroll overscroll-none h-screen">
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}
            className="snap-start h-screen w-full flex flex-col"
          >
            <div className="w-full flex-shrink-0 max-h-[55vh] overflow-hidden mt-14" style={{ aspectRatio: '3/4' }}>
              <ProfileImageCarousel images={p.photos} />
            </div>

            <div className="flex-1 flex flex-col px-4 pb-14">
              <div className="flex flex-col gap-1 pt-5">
                <h1 className="text-white text-2xl font-semibold">
                  {p.name}{p.age ? `, ${p.age}` : ''}
                </h1>
                <p className="text-white/50 text-sm">{p.city_auto}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {(p.interests_have ?? p.interests ?? []).slice(0, 5).map((interest: string) => (
                  <span key={interest} className="px-3 py-1 rounded-full bg-white/10 text-[#EDEADE] text-xs">
                    {interest}
                  </span>
                ))}
              </div>

              <div className="mt-auto mb-16">
                <Button
                  onClick={() => handleBegin(p.id)}
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-black text-base font-semibold active:scale-95 disabled:opacity-50 h-14"
                >
                  {loading ? <Loader2 className="animate-spin" /> : persona === 'woman' ? 'View Profile' : 'Meet Her Standard'}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="snap-start h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          </div>
        )}
      </div>
    </div>
  )
}
