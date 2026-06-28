'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Coins, X, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { ProfileImageCarousel } from '@/components/shared/ProfileImageCarousel'
import { createClient } from '@/lib/supabase/client'

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
            className="snap-start snap-always min-h-screen w-full flex flex-col relative"
          >
            <div className="absolute inset-0 w-full h-full">
              <ProfileImageCarousel images={p.photos} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <h1 className="font-['Playfair_Display'] text-4xl text-white font-semibold">
                {p.name}
              </h1>
              <p className="font-['Inter'] text-sm text-white/80 tracking-wide uppercase mt-1">
                {p.age ? `${p.age}` : ''}{p.age && p.city_auto ? ' · ' : ''}{p.city_auto}
              </p>
              {p.bio && (
                <p className="text-white/90 text-base leading-relaxed max-w-md mt-3">{p.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {(p.interests_have ?? p.interests ?? []).slice(0, 5).map((interest: string) => (
                  <span key={interest} className="px-3 py-1 border border-white/30 text-white/90 text-xs uppercase tracking-wide">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="fixed bottom-24 right-8 flex flex-col gap-3 z-40">
              <button
                onClick={() => scrollToNext(i)}
                aria-label="Pass"
                className="size-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-95 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => {
                  if (persona === 'woman') {
                    handleBegin(p.id);
                  } else {
                    setConfirmProfileId(p.id);
                  }
                }}
                disabled={loading}
                aria-label="Like"
                className="size-14 rounded-full bg-[#C9A961] flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Heart className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        ))}
        {loading && (
          <div className="snap-start min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C9A961]" size={32} />
          </div>
        )}
      </div>

      {confirmProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#FAF9F7] p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-[#C9A961]" />
            </div>
            <h4 className="font-['Playfair_Display'] text-2xl text-ink mb-2">Unlock Standard?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              This action will deduct 100 coins from your wallet to begin a 3-day connection request.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmProfileId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetId = confirmProfileId;
                  setConfirmProfileId(null);
                  handleBegin(targetId);
                }}
                className="btn-primary flex-1"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
