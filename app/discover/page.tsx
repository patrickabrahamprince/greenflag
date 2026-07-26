'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Coins, X, Heart, Lock, Instagram, Briefcase, Ruler, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { createClient } from '@/lib/supabase/client'

interface DiscoverProfile {
  id: string
  name: string
  age?: number
  city?: string
  city_auto?: string
  bio?: string
  job?: string
  height?: string
  photos?: string[]
  interests?: string[]
  interests_have?: string[]
  looking_for_interests?: string[]
  interests_looking_for?: string[]
  blur_key?: string
  instagram_url?: string
  match_percentage?: number
  match_reasons?: string[]
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [pageLoading, setPageLoading] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [persona, setPersona] = useState<string | null>(null)
  const [approvalBanner, setApprovalBanner] = useState<'pending' | 'approved' | null>(null)
  const [confirmProfileId, setConfirmProfileId] = useState<string | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({})
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set())
  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set())
  const [nudgingId, setNudgingId] = useState<string | null>(null)
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
      supabase.from('profiles').select('persona, approval_status').eq('id', user.id).single().then(({ data }) => {
        if (data?.persona) setPersona(data.persona)
        if (data?.persona !== 'man') return

        if (data?.approval_status === 'pending') {
          setApprovalBanner('pending')
        } else if (
          data?.approval_status === 'approved' &&
          localStorage.getItem(`gf_seen_approved:${user.id}`) !== '1'
        ) {
          setApprovalBanner('approved')
        }
      })
    })
  }, [])

  const dismissApprovedBanner = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) localStorage.setItem(`gf_seen_approved:${user.id}`, '1')
    })
    setApprovalBanner(null)
  }

  useEffect(() => {
    if (!fetchedForPage.current.has(page)) {
      fetchedForPage.current.add(page)
      fetchProfiles()
    }
  }, [page])

  // Interest-count line only renders on the woman's view of a man's card,
  // so only fetch it there -- one lightweight call per newly-seen profile.
  useEffect(() => {
    if (persona !== 'woman') return
    const missing = profiles.filter(p => !(p.id in interestCounts))
    if (missing.length === 0) return
    missing.forEach(p => {
      fetch(`/api/user/${p.id}/interest-count`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setInterestCounts(prev => ({ ...prev, [p.id]: data.count }))
        })
        .catch(() => {})
    })
  }, [persona, profiles, interestCounts])

  function toggleBioExpanded(id: string) {
    setExpandedBios(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleNudge(profileId: string) {
    if (nudgingId) return
    setNudgingId(profileId)
    try {
      const res = await fetch(`/api/nudge/${profileId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to send nudge')
        return
      }
      setNudgedIds(prev => new Set(prev).add(profileId))
      toast.success('Nudge sent!')
    } catch {
      toast.error('Failed to send nudge')
    } finally {
      setNudgingId(null)
    }
  }

  async function fetchProfiles() {
    setPageLoading(true)
    try {
      const res = await fetch('/api/discover')
      const json = await res.json()
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = (json.profiles ?? []).filter((p: DiscoverProfile) => (p.photos?.length ?? 0) > 0)
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
      const data = (json.profiles ?? []).filter((p: DiscoverProfile) => (p.photos?.length ?? 0) > 0)
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
    // children[0] is the pull-to-refresh loader div, so profile cards
    // start at children[1] -- index i's card lives at children[i + 1],
    // making the *next* card children[i + 2].
    const next = container.children[index + 2] as HTMLElement | undefined
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
    <div className="relative screen-gradient min-h-dvh max-w-app mx-auto">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app flex flex-col pointer-events-none">
        {approvalBanner && (
          <button
            onClick={() => {
              if (approvalBanner === 'approved') dismissApprovedBanner()
              router.push('/profile')
            }}
            className="pointer-events-auto glass-surface mx-3 mt-2 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 text-left"
          >
            <span className="text-xs text-white font-medium truncate">
              {approvalBanner === 'pending'
                ? 'Your account will be verified shortly'
                : "You're approved! Tap to view your profile"}
            </span>
            {approvalBanner === 'approved' && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); dismissApprovedBanner() }}
                className="text-white/50 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        )}

        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/40 via-black/10 to-transparent">
          <button onClick={() => router.push('/messages')} className="pointer-events-auto w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="pointer-events-auto">
            <CoinBadge />
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`snap-y snap-mandatory overflow-y-scroll overscroll-none scroll-smooth ${approvalBanner ? 'h-[calc(100dvh-7rem)]' : 'h-[calc(100dvh-5rem)]'}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}
            className="snap-start snap-always h-[calc(100dvh-5rem)] w-full relative overflow-hidden animate-fade-in"
          >
            <div className="absolute inset-0 grid grid-cols-3 gap-px bg-black">
              <div className="col-span-2 relative">
                <img
                  src={p.photos?.[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
                />
                {typeof p.match_percentage === 'number' && (
                  <div className="absolute top-12 left-3 z-10 flex flex-col items-start gap-1">
                    <div className="glass-surface flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <span className="text-gold text-xs">◆</span>
                      <span className="font-display font-bold text-white text-sm whitespace-nowrap">
                        {p.match_percentage}% GreenFlag Match
                      </span>
                    </div>
                    {persona === 'woman' && interestCounts[p.id] !== undefined && (
                      <span className="glass-surface rounded-full px-3 py-1 text-white/80 text-[11px] whitespace-nowrap">
                        {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'person has' : 'people have'} shown interest on this profile
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="relative col-span-1 overflow-hidden">
                {(() => {
                  const extraPhotos = [p.photos?.[1], p.photos?.[2]].filter(Boolean) as string[]
                  // Blur is a paywall cue for men unlocking a woman's card --
                  // a woman browsing men should always see clear photos.
                  const photoClass = `w-full h-full object-cover ${persona === 'woman' ? '' : 'blur-md scale-110'}`
                  if (extraPhotos.length === 0) {
                    return (
                      <img
                        src={p.photos?.[0]}
                        alt=""
                        className={photoClass}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    )
                  }
                  return (
                    <div
                      className="grid gap-px h-full"
                      style={{ gridTemplateRows: `repeat(${extraPhotos.length}, 1fr)` }}
                    >
                      {extraPhotos.map((src, idx) => (
                        <div key={idx} className="relative overflow-hidden">
                          <img
                            src={src}
                            alt=""
                            className={photoClass}
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
                    className="glass-surface absolute inset-0 m-auto z-20 flex items-center justify-center gap-2 h-12 w-fit px-4 rounded-full active:scale-95 transition-all shadow-lg"
                  >
                    <Lock className="w-4 h-4 text-white shrink-0" />
                    <span className="text-white text-sm uppercase tracking-wide font-display font-bold whitespace-nowrap">Unlock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom scrim: photo is full-bleed behind this, so the info
                block needs a gradient underlay for the white text to stay
                legible against whatever's in the shot. */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-6 pt-10">
              <div>
                <h1 className="font-serif text-4xl text-ink font-semibold leading-none">
                  {p.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <p className="font-sans text-sm text-ink/60 tracking-wide uppercase leading-none">
                    {p.age ? `${p.age}` : ''}{p.age && p.city_auto ? ' · ' : ''}{p.city_auto}
                  </p>
                  {p.instagram_url && (
                    <a
                      href={p.instagram_url.startsWith('http') ? p.instagram_url : `https://instagram.com/${p.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-gold font-medium leading-none"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      {p.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || 'Instagram'}
                    </a>
                  )}
                </div>
              </div>
              {(p.job || p.height) && (
                <div className="flex items-center gap-4 flex-wrap">
                  {p.job && (
                    <span className="flex items-center gap-1.5 text-sm text-ink/70 font-medium leading-none">
                      <Briefcase className="w-3.5 h-3.5 text-ink/40 shrink-0" />
                      {p.job}
                    </span>
                  )}
                  {p.height && (
                    <span className="flex items-center gap-1.5 text-sm text-ink/70 font-medium leading-none">
                      <Ruler className="w-3.5 h-3.5 text-ink/40 shrink-0" />
                      {p.height}
                    </span>
                  )}
                </div>
              )}
              <div className={persona === 'woman' ? 'flex flex-nowrap gap-2 overflow-x-auto' : 'flex flex-wrap gap-2'}>
                {(p.interests_have?.length ? p.interests_have : p.interests ?? []).slice(0, 5).map((interest: string) => {
                  const isMatched = Array.isArray(p.match_reasons) && p.match_reasons.includes(interest);
                  return (
                    <span
                      key={interest}
                      className={
                        (isMatched
                          ? 'glass-surface px-4 py-2 rounded-full bg-gold text-white text-sm font-medium shadow-[0_2px_10px_rgba(192,38,211,0.5)] leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_16px_rgba(192,38,211,0.8)] active:scale-95'
                          : 'glass-surface px-4 py-2 rounded-full text-ink text-sm font-medium leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white/10 active:scale-95') +
                        (persona === 'woman' ? ' shrink-0' : '')
                      }
                    >
                      {interest}
                    </span>
                  );
                })}
              </div>
              {p.bio && (
                <div>
                  <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1.5 leading-none">About</p>
                  <p
                    className={`text-ink/80 text-base leading-relaxed max-w-md font-light whitespace-pre-line ${expandedBios.has(p.id) ? '' : 'line-clamp-3'}`}
                  >
                    {p.bio}
                  </p>
                  {p.bio.length > 120 && (
                    <button
                      onClick={() => toggleBioExpanded(p.id)}
                      className="text-gold text-xs font-medium mt-1"
                    >
                      {expandedBios.has(p.id) ? 'Show less' : 'and more...'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2 shrink-0">
                {persona === 'woman' ? (
                  <>
                    <button
                      onClick={() => handleBegin(p.id)}
                      disabled={likingId === p.id}
                      aria-label="View Profile"
                      className="btn-primary flex-1 h-14 flex items-center justify-center gap-2"
                    >
                      {likingId === p.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <Heart className="w-5 h-5 text-white" />
                          <span className="text-white text-xs uppercase tracking-wide font-display font-bold">View Profile</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleNudge(p.id)}
                      disabled={nudgingId === p.id || nudgedIds.has(p.id)}
                      aria-label="Nudge"
                      className="glass-surface flex-1 h-14 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {nudgingId === p.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <Bell className="w-5 h-5 text-white" />
                          <span className="text-white text-xs uppercase tracking-wide font-display font-bold">
                            {nudgedIds.has(p.id) ? 'Nudged' : 'Nudge'}
                          </span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => scrollToNext(i)}
                      aria-label="Pass"
                      className="glass-surface size-14 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                    >
                      <X className="w-6 h-6 text-ink/60" />
                    </button>
                    <button
                      onClick={() => setConfirmProfileId(p.id)}
                      disabled={likingId === p.id}
                      aria-label="Like"
                      className="btn-primary flex-1 h-14 flex items-center justify-center gap-2"
                    >
                      {likingId === p.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <Heart className="w-5 h-5 text-white" />
                          <span className="text-white text-xs uppercase tracking-wide font-display font-bold">Meet Her Standard</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {pageLoading && (
          <div className="snap-start min-h-[100dvh] flex items-center justify-center">
            <Loader2 className="animate-spin text-gold" size={32} />
          </div>
        )}
        {!pageLoading && profiles.length === 0 && (
          <div className="snap-start min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6 text-gold" />
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
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Unlock Standard?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              This action will deduct 500 coins from your wallet to begin a 3-day connection request.
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
