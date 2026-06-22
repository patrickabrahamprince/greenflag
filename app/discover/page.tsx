'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CoinBadge } from '@/components/shared/coin-badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
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
      if (res.status === 401 || res.status === 403) {
        router.push('/login')
        return
      }
      const data = json.profiles ?? []
      if (data.length < 3) setHasMore(false)
      setProfiles(prev => page === 0 ? data : [...prev, ...data])
    } catch {
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  async function handleBegin(hostId: string) {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ woman_id: hostId })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to start')
      }
      const { connectionId: connection_id } = await res.json()
      router.push(`/intentions/${connection_id}/1`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profiles?.length && !loading) {
    return <EmptyState title="No one new" description="Check back soon" />
  }

  return (
    <div className="relative bg-[#0A0A0A]">
      <div className="fixed top-0 z-50 w-full pt-safe px-6 py-4 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent">
        <CoinBadge />
      </div>

      <div className="h- w-full snap-y snap-mandatory overflow-y-scroll overscroll-none">
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            className="snap-start h- w-full relative"
          >
            <Image
              src={p.photos[0]}
              alt={p.name}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 w-full p-6 pb-safe">
              <h1 className="text-[#EDEADE] text-4xl font-playfair">{p.name}, {p.age}</h1>
              <p className="text-[#EDEADE]/80">{p.city_auto}</p>

              <div className="flex gap-2 my-4 max-w-[90%] flex-wrap">
                {p.interests?.slice(0, 3).map((interest: string) => (
                  <span key={interest} className="px-3 py-1 rounded-full bg-white/10 text-[#EDEADE] text-sm truncate">
                    {interest}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => handleBegin(p.id)}
                disabled={loading}
                className="min-h- w-full bg-[#D4AF37] text-black text-lg font-bold active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Meet Her Standard'}
              </Button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="snap-start h- flex items-center justify-center">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          </div>
        )}
      </div>
    </div>
  )
}
