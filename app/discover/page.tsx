'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Coins, X, Heart, Lock, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { createClient } from '@/lib/supabase/client'

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [persona, setPersona] = useState<string | null>(null)
  const [confirmProfileId, setConfirmProfileId] = useState<string | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const pulling = useRef(false)

  const observer = useRef<IntersectionObserver>()
  const lastProfileRef = useCallback((node: HTMLDivElement) => {
    if (pageLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [pageLoading, hasMore])

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
    setPageLoading(true)
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
      setPageLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    fetchedForPage.current.clear()
    setHasMore(true)
    try {
      const res = await fetch('/api/discover')
      const json = await res.json()
      const data = (json.profiles ?? []).filter((p: any) => p.photos?.length > 0)
      if (data.length < 3) setHasMore(false)
      setProfiles(data)
      setPage(0)
      fetchedForPage.current.add(0)
      scrollRef.current?.scrollTo({ top: 0 })
    } catch {
      toast.error('Failed to refresh')
    } finally {
      setRefreshing(false)
      setPullDistance(0)
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    if ((scrollRef.current?.scrollTop ?? 0) > 0) return
    touchStartY.current = e.touches[0].clientY
    pulling.current = true
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || touchStartY.current === null) return
    const delta = e.touches[0].clientY - touchStartY.current
    if (delta > 0 && (scrollRef.current?.scrollTop ?? 0) === 0) {
      setPullDistance(Math.min(delta * 0.5, 90))
    } else {
      pulling.current = false
    }
  }

  function onTouchEnd() {
    if (!pulling.current) return
    pulling.current = false
    touchStartY.current = null
    if (pullDistance > 60) {
      handleRefresh()
    } else {
      setPullDistance(0)
    }
  }

  function scrollToNext(index: number) {
    const container = scrollRef.current
    if (!container) return
    const next = container.children[index + 1] as HTMLElement | undefined
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleBegin(profileId: string) {
    if (likingId) return
    setLikingId(profileId)
    try {
      if (persona === 'woman') {
        router.push(`/profile/${profileId}`)
        return
      }
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: profileId })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to like profile')
      }
      const { matchId } = await res.json()
      setProfiles(prev => prev.filter(p => p.id !== profileId))
      if (matchId) {
        router.push(`/task/${matchId}`)
      } else {
        toast.success("You've met her Standard")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLikingId(null)
    }
  }

  return (
    <div className="relative bg-[#000000] min-h-dvh max-w-app mx-auto">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none">
        <button onClick={() => router.push('/messages')} className="pointer-events-auto w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="pointer-events-auto">
          <CoinBadge />
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="snap-y snap-mandatory overflow-y-scroll overscroll-none scroll-smooth h-[calc(100dvh-5rem)]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-[#D4AF37] ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}
            className="snap-start snap-always h-[calc(100dvh-5rem)] w-full flex flex-col animate-fade-in"
          >
            <div className="w-full flex-shrink-0 px-4 pt-4">
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] grid grid-cols-3 gap-1 bg-black">
                <div className="col-span-2 relative">
                  <img
                    src={p.photos?.[0]}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
                  />
                  {typeof p.match_percentage === 'number' && (
                    <div className="absolute top-12 left-3 z-10 flex items-center gap-1.5 bg-black/35 backdrop-blur-md rounded-full px-3 py-1.5">
                      <span className="text-[#D4AF37] text-xs">◆</span>
                      <span className="font-display italic text-white text-sm whitespace-nowrap">
                        {p.match_percentage}% GreenFlag Match
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative col-span-1 overflow-hidden">
                  {(() => {
                    const extraPhotos = [p.photos?.[1], p.photos?.[2]].filter(Boolean) as string[]
                    if (extraPhotos.length === 0) {
                      return (
                        <img
                          src={p.photos?.[0]}
                          alt=""
                          className="w-full h-full object-cover blur-md scale-110"
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                      )
                    }
                    return (
                      <div
                        className="grid gap-1 h-full"
                        style={{ gridTemplateRows: `repeat(${extraPhotos.length}, 1fr)` }}
                      >
                        {extraPhotos.map((src, idx) => (
                          <div key={idx} className="relative overflow-hidden">
                            <img
                              src={src}
                              alt=""
                              className="w-full h-full object-cover blur-md scale-110"
                              onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                  {persona !== 'woman' && (
                    <button
                      onClick={() => setConfirmProfileId(p.id)}
                      className="absolute inset-0 m-auto z-20 flex items-center justify-center gap-2 h-12 w-fit px-4 bg-black/60 backdrop-blur-md rounded-full active:scale-95 transition-all shadow-lg"
                    >
                      <Lock className="w-4 h-4 text-white shrink-0" />
                      <span className="text-white text-sm uppercase tracking-wide font-semibold whitespace-nowrap">Unlock</span>
                    </button>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col px-6 pt-6 pb-6">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <h1 className="font-display text-4xl text-ink font-semibold tracking-tight">
                  {p.name}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <p className="font-['Inter'] text-sm text-ink/60 tracking-wide uppercase">
                    {p.age ? `${p.age}` : ''}{p.age && p.city_auto ? ' · ' : ''}{p.city_auto}
                  </p>
                  {p.instagram_url && (
                    <a
                      href={p.instagram_url.startsWith('http') ? p.instagram_url : `https://instagram.com/${p.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-[#D4AF37] font-medium"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      {p.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || 'Instagram'}
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(p.interests_have?.length ? p.interests_have : p.interests ?? []).slice(0, 5).map((interest: string) => {
                    const isMatched = Array.isArray(p.match_reasons) && p.match_reasons.includes(interest);
                    return (
                      <span
                        key={interest}
                        className={
                          isMatched
                            ? 'px-4 py-2 rounded-full bg-[#D4AF37] text-white text-sm font-medium shadow-[0_2px_10px_rgba(201,169,97,0.35)]'
                            : 'px-4 py-2 rounded-full bg-[#1C1C1E] text-ink text-sm font-medium shadow-[0_2px_10px_rgba(0,0,0,0.08)]'
                        }
                      >
                        {interest}
                      </span>
                    );
                  })}
                </div>
                {p.bio && (
                  <p className="text-ink/80 text-base leading-relaxed max-w-md mt-5 font-light">{p.bio}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 shrink-0">
                <button
                  onClick={() => scrollToNext(i)}
                  aria-label="Pass"
                  className="size-14 rounded-full bg-[#1C1C1E] shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center active:scale-95 transition-all shrink-0"
                >
                  <X className="w-6 h-6 text-ink/60" />
                </button>
                <button
                  onClick={() => {
                    if (persona === 'woman') {
                      handleBegin(p.id);
                    } else {
                      setConfirmProfileId(p.id);
                    }
                  }}
                  disabled={likingId === p.id}
                  aria-label="Like"
                  className="flex-1 h-14 rounded-full bg-[#D4AF37] shadow-[0_4px_16px_rgba(201,169,97,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {likingId === p.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <Heart className="w-5 h-5 text-white" />
                      <span className="text-white text-xs uppercase tracking-wide font-medium">
                        {persona === 'woman' ? 'View Profile' : 'Meet Her Standard'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        {pageLoading && (
          <div className="snap-start min-h-[100dvh] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          </div>
        )}
        {!pageLoading && profiles.length === 0 && (
          <div className="snap-start min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h2 className="font-display text-2xl text-ink mb-2">You&apos;ve seen everyone</h2>
            <p className="text-ink/50 text-sm max-w-xs">
              No new profiles match your standard right now. Check back soon, or revisit your existing connections.
            </p>
          </div>
        )}
      </div>

      {confirmProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Unlock Standard?</h4>
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
