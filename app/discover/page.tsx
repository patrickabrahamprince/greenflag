'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Coins, X, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel'
import { createClient } from '@/lib/supabase/client'

import { ProfileCard } from '@/components/discover/ProfileCard'

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [persona, setPersona] = useState<string | null>(null)
  const [confirmProfileId, setConfirmProfileId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollRef = useRef<HTMLDivElement>(null)

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

  function scrollToNext(index: number) {
    const container = scrollRef.current
    if (!container) return
    const next = container.children[index + 1] as HTMLElement | undefined
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative bg-[#FAF9F7] min-h-screen">
      <div className="fixed top-0 z-50 w-full flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/40 via-black/10 to-transparent">
        <button onClick={() => router.push('/connections')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <CoinBadge />
      </div>

      <div ref={scrollRef} className="snap-y snap-mandatory overflow-y-scroll overscroll-none h-screen">
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}
            className="snap-start snap-always min-h-screen w-full flex flex-col"
          >
            <ProfileCard profile={p} onSwipe={() => scrollToNext(i)} />
          </div>
        ))}
        {loading && (
          <div className="snap-start min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C9A961]" size={32} />
          </div>
        )}
      </div>
    </div>
  )
}
