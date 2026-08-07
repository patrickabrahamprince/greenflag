'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Coins, X, Heart, Lock, Instagram, Briefcase, Ruler, Bell, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { LoadingLogo } from '@/components/shared/LoadingLogo'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { SocialProofLine } from '@/components/shared/SocialProofLine'
import { createClient } from '@/lib/supabase/client'
import { useCoinStore } from '@/lib/store'
import { hapticTap, hapticDecision, hapticSuccess } from '@/lib/haptics'
import { DiscoverySkeleton } from '@/components/discovery/DiscoverySkeleton'
import { getCached, setCached } from '@/lib/pageCache'
import { useFirstTimeHint } from '@/lib/hooks/useFirstTimeHint'
import { FirstTimeHint } from '@/components/shared/FirstTimeHint'
import { ChevronUp } from 'lucide-react'

const PROFILES_CACHE_KEY = 'discover:profiles'
const HAS_MORE_CACHE_KEY = 'discover:hasMore'

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
  photosUnlocked?: boolean
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>(() => getCached(PROFILES_CACHE_KEY) ?? [])
  const [pageLoading, setPageLoading] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(() => getCached(HAS_MORE_CACHE_KEY) ?? true)
  const [persona, setPersona] = useState<string | null>(null)
  const [confirmProfileId, setConfirmProfileId] = useState<string | null>(null)
  const [photoUnlockConfirm, setPhotoUnlockConfirm] = useState<string | null>(null)
  const [unlockingPhotoId, setUnlockingPhotoId] = useState<string | null>(null)
  const [unlockedPhotoIds, setUnlockedPhotoIds] = useState<Set<string>>(new Set())
  // placeholder-avatar.svg is a near-black icon on a near-black card --
  // swapping a failed side-photo's src to it read as a solid black hole,
  // not a placeholder. Tracking failed URLs and rendering an explicit
  // lighter-gray placeholder in that slot (instead of changing the grid's
  // row count) keeps the card's layout stable while scrolling.
  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Set<string>>(new Set())
  // Gates both the real feed fetch and its render until we know whether
  // this visit is about to redirect elsewhere (see the effect below) --
  // starts true so neither cached nor freshly-fetched cards can flash
  // before that's settled.
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({})
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set())
  const [nudgingId, setNudgingId] = useState<string | null>(null)
  const [nudgeDialog, setNudgeDialog] = useState<{ visible: boolean; charged: boolean; cost: number } | null>(null)
  const [nudgeConfirm, setNudgeConfirm] = useState<{ profileId: string; cost: number } | null>(null)
  // Which photo each card's carousel is currently showing, keyed by profile
  // id -- a single Record instead of per-card useState, since hooks can't
  // be called inside the profiles.map() below.
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({})
  const coinBalance = useCoinStore((s) => s.balance)
  const deductCoins = useCoinStore((s) => s.deduct)
  const router = useRouter()
  const supabase = createClient()
  const { show: showSwipeHint, dismiss: dismissSwipeHint } = useFirstTimeHint('discover-swipe-up')

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
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { if (!cancelled) setCheckingAccess(false); return }
      supabase.from('profiles').select('persona').eq('id', user.id).single().then(({ data }) => {
        if (cancelled) return
        if (data?.persona) setPersona(data.persona)

        // A woman without an active Standard shouldn't be able to browse
        // Discover at all -- BottomNav has its own safety net for this, but
        // that's a sibling effect that resolves asynchronously, so Discover
        // itself would render (including its "no new profiles" empty state,
        // or briefly some other man's card straight from the pageCache
        // hydrated at mount) for a beat before the redirect landed.
        // checkingAccess holds the real feed fetch and render off entirely
        // until this settles, so pressing back into Discover from Standard
        // Builder can't flash a misleading card or empty state.
        if (data?.persona === 'woman') {
          fetch('/api/standards/standard-builder')
            .then(res => (res.ok ? res.json() : null))
            .then(sData => {
              if (cancelled) return
              if (sData && sData.redirect !== '/my-connections') {
                router.replace('/standard/builder')
                return // navigating away -- leave checkingAccess true
              }
              setCheckingAccess(false)
            })
            .catch(() => { if (!cancelled) setCheckingAccess(false) })
        } else {
          setCheckingAccess(false)
        }
      })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (checkingAccess) return
    if (!fetchedForPage.current.has(page)) {
      fetchedForPage.current.add(page)
      fetchProfiles()
    }
  }, [page, checkingAccess])

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

  function showNudgeSentDialog(charged: boolean, cost: number) {
    setNudgeDialog({ visible: true, charged, cost })
    setTimeout(() => setNudgeDialog(prev => prev ? { ...prev, visible: false } : null), 1400)
    setTimeout(() => setNudgeDialog(null), 1900)
  }

  async function sendNudge(profileId: string, confirm: boolean) {
    const res = await fetch(`/api/nudge/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || 'Failed to send nudge')
      return
    }
    if (data.needsConfirm) {
      setNudgeConfirm({ profileId, cost: data.cost })
      return
    }
    if (data.charged && data.cost) {
      deductCoins(data.cost)
    }
    showNudgeSentDialog(!!data.charged, data.cost || 0)
  }

  async function handleNudge(profileId: string) {
    if (nudgingId) return
    hapticDecision()
    setNudgingId(profileId)
    try {
      await sendNudge(profileId, false)
    } catch {
      toast.error('Failed to send nudge')
    } finally {
      setNudgingId(null)
    }
  }

  async function handleConfirmNudge() {
    if (!nudgeConfirm) return
    const { profileId } = nudgeConfirm
    setNudgingId(profileId)
    try {
      await sendNudge(profileId, true)
    } catch {
      toast.error('Failed to send nudge')
    } finally {
      setNudgingId(null)
      setNudgeConfirm(null)
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
      const stillHasMore = data.length >= 3
      if (!stillHasMore) setHasMore(false)
      setCached(HAS_MORE_CACHE_KEY, stillHasMore)
      setProfiles(prev => {
        const next = page === 0 ? data : [...prev, ...data]
        setCached(PROFILES_CACHE_KEY, next)
        return next
      })
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
      const stillHasMore = data.length >= 3
      if (!stillHasMore) setHasMore(false)
      setCached(HAS_MORE_CACHE_KEY, stillHasMore)
      setProfiles(data)
      setCached(PROFILES_CACHE_KEY, data)
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
        hapticTap()
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
      deductCoins(500)
      setProfiles(prev => {
        const next = prev.filter(p => p.id !== profileId)
        setCached(PROFILES_CACHE_KEY, next)
        return next
      })
      hapticSuccess()
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

  async function handlePhotoUnlock(profileId: string) {
    setUnlockingPhotoId(profileId)
    try {
      const res = await fetch(`/api/photo-unlock/${profileId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to unlock photos')
        return
      }
      if (!data.alreadyUnlocked && data.cost) {
        deductCoins(data.cost)
      }
      setUnlockedPhotoIds(prev => new Set(prev).add(profileId))
    } catch {
      toast.error('Failed to unlock photos')
    } finally {
      setUnlockingPhotoId(null)
    }
  }

  if (checkingAccess) {
    return (
      <div className="min-h-dvh flex items-center justify-center screen-gradient">
        <LoadingLogo />
      </div>
    )
  }

  // First-ever fetch (nothing on screen yet) gets the real skeleton --
  // subsequent infinite-scroll pages keep the small inline spinner further
  // down, since by then there's already content to anchor against.
  if (page === 0 && pageLoading && profiles.length === 0) {
    return <DiscoverySkeleton />
  }

  return (
    <div className="relative screen-gradient min-h-dvh max-w-app mx-auto">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app flex flex-col pointer-events-none">
        <div className="flex items-center justify-end px-5 pt-safe-top pb-10 bg-gradient-to-b from-black/70 via-black/25 to-transparent">
          <div className="pointer-events-auto">
            {persona === 'woman' ? (
              <div className="glass-surface border-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-display font-semibold text-ink/70">
                <span className="text-gold text-[10px]">◆</span>
                {coinBalance}
              </div>
            ) : (
              <CoinBadge />
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onScroll={dismissSwipeHint}
        className="snap-y snap-mandatory overflow-y-scroll overscroll-none scroll-smooth h-[calc(100dvh-5rem)] scrollbar-hide"
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
            <div className="absolute inset-0 bg-black">
              {(() => {
                const photos = (p.photos ?? []).filter(Boolean) as string[]
                const total = photos.length
                const idx = total > 0 ? ((cardPhotoIdx[p.id] ?? 0) % total + total) % total : 0
                const src = photos[idx]
                // Blur is a paywall cue for men unlocking a woman's card --
                // a woman browsing men should always see clear photos. Only
                // the first photo is ever shown clear; swiping to any later
                // photo hits the paywall. Photo unlock (100 coins,
                // /api/photo-unlock) is its own purchase, separate from
                // Meet Her Standard -- once paid, photosUnlocked persists
                // across visits.
                const isPhotosUnlocked = persona === 'woman' || !!p.photosUnlocked || unlockedPhotoIds.has(p.id)
                const isLocked = idx > 0 && !isPhotosUnlocked

                const goTo = (nextIdx: number) => {
                  if (total <= 1) return
                  setCardPhotoIdx(prev => ({ ...prev, [p.id]: ((nextIdx % total) + total) % total }))
                }

                return (
                  <div className="relative w-full h-full overflow-hidden">
                    {!src || failedPhotoUrls.has(src) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#2A2A2C]">
                        <ImageOff className="w-9 h-9 text-white/25" />
                        <span className="text-white/30 text-xs font-medium">No photo available</span>
                      </div>
                    ) : (
                      <img
                        src={src}
                        alt=""
                        className={`w-full h-full object-cover ${isLocked ? 'blur scale-110' : ''}`}
                        onError={() => src && setFailedPhotoUrls(prev => new Set(prev).add(src))}
                      />
                    )}

                    {isLocked && (
                      <button
                        onClick={() => { hapticTap(); setPhotoUnlockConfirm(p.id) }}
                        aria-label="Unlock"
                        className="glass-surface absolute inset-0 m-auto z-20 flex items-center justify-center gap-1.5 h-9 w-fit px-4 rounded-full active:scale-95 transition-all shadow-lg"
                      >
                        <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="text-white text-xs uppercase tracking-wide font-display font-bold whitespace-nowrap">Unlock Photos</span>
                      </button>
                    )}

                    {total > 1 && (
                      <div className="absolute top-3 inset-x-3 z-10 flex gap-1">
                        {photos.map((_, dotIdx) => (
                          <div
                            key={dotIdx}
                            className={`flex-1 h-[3px] rounded-full transition-colors ${dotIdx === idx ? 'bg-white' : 'bg-white/30'}`}
                          />
                        ))}
                      </div>
                    )}

                    {total > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx - 1) }}
                          aria-label="Previous photo"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx + 1) }}
                          aria-label="Next photo"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}

                    {typeof p.match_percentage === 'number' && (
                      <div className="absolute top-12 left-3 z-10 flex flex-col items-start gap-1">
                        <div className="glass-surface flex items-center gap-1.5 rounded-full px-3 py-1.5">
                          <span className="text-gold text-xs">◆</span>
                          <span className="font-display font-bold text-white text-sm whitespace-nowrap">
                            {p.match_percentage}% Greenflag Alignment
                          </span>
                        </div>
                        {persona === 'woman' && !!interestCounts[p.id] && (
                          <span className="glass-surface rounded-full px-3 py-1 text-white/80 text-[11px] whitespace-nowrap">
                            Intention from {interestCounts[p.id]} {interestCounts[p.id] === 1 ? 'person' : 'people'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Frosted layer directly over the photo, faded out via mask so
                it only affects the lower portion where the info block sits
                -- the gradient scrim right after handles the actual text
                contrast/darkening on top of this blur. */}
            <div
              className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-md pointer-events-none"
              style={{
                WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
                maskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
              }}
            />

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
              {(() => {
                const shownInterests = (p.interests_have?.length ? p.interests_have : p.interests ?? []).slice(0, 5)
                const lookingFor = (p.interests_looking_for?.length ? p.interests_looking_for : p.looking_for_interests ?? [])
                  .filter((interest) => !shownInterests.includes(interest))
                  .slice(0, 3)
                return (
                  <>
                    <div className={persona === 'woman' ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2'}>
                      {shownInterests.map((interest: string) => {
                        const isMatched = Array.isArray(p.match_reasons) && p.match_reasons.includes(interest);
                        const sizeClass = persona === 'woman' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
                        return (
                          <span
                            key={interest}
                            className={
                              (isMatched
                                ? `glass-surface ${sizeClass} rounded-full bg-gold text-white font-medium shadow-[0_2px_10px_rgba(192,38,211,0.5)] leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_16px_rgba(192,38,211,0.8)] active:scale-95`
                                : `glass-surface ${sizeClass} rounded-full text-ink font-medium leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-white/10 active:scale-95`)
                            }
                          >
                            {interest}
                          </span>
                        );
                      })}
                    </div>
                    {lookingFor.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-ink/40 text-xs font-semibold uppercase tracking-wide leading-none">Values</span>
                        {lookingFor.map((interest: string) => (
                          <span
                            key={interest}
                            className="px-2.5 py-1 text-xs rounded-full border border-white/20 text-ink/70 font-medium leading-none"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
              {p.bio && (
                <div>
                  <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1.5 leading-none">The Standard</p>
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
                      {expandedBios.has(p.id) ? 'Show less' : '...more'}
                    </button>
                  )}
                </div>
              )}

              <div className={persona === 'woman' ? 'flex items-center gap-4 pt-2 shrink-0' : 'flex items-center justify-center gap-5 pt-2 shrink-0'}>
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
                      disabled={nudgingId === p.id}
                      aria-label="Nudge"
                      className="glass-surface flex-1 h-14 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {nudgingId === p.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <>
                          <Bell className="w-5 h-5 text-white" />
                          <span className="text-white text-xs uppercase tracking-wide font-display font-bold">Nudge</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { hapticTap(); scrollToNext(i) }}
                      aria-label="Pass"
                      className="glass-surface size-14 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                    >
                      <X className="w-6 h-6 text-ink/60" />
                    </button>
                    <button
                      onClick={() => { hapticDecision(); setConfirmProfileId(p.id) }}
                      disabled={likingId === p.id}
                      aria-label="Meet Her Standard"
                      className="size-16 rounded-full flex items-center justify-center active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 shrink-0"
                      style={{ background: 'linear-gradient(135deg, #E879F9 0%, #C026D3 45%, #86198F 100%)', boxShadow: '0 4px 20px -4px rgba(192, 38, 211, 0.45)' }}
                    >
                      {likingId === p.id ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      ) : (
                        <Heart className="w-7 h-7 text-white" fill="white" />
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
            <h2 className="font-display text-2xl text-ink mb-2">You're All Caught Up</h2>
            <p className="text-ink/50 text-sm max-w-xs">
              No new profiles align with your Standard right now. Check back again soon.
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
            <h4 className="font-display text-2xl text-ink mb-2">Make Your Move?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-3">
              500 coins begins your 3-day pursuit — worth it if she&apos;s the one.
            </p>
            <SocialProofLine className="text-[11px] text-ink/40 mb-6" />
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmProfileId(null)}
                className="btn-secondary flex-1 whitespace-nowrap"
              >
                Not Now
              </button>
              <button
                onClick={async () => {
                  const targetId = confirmProfileId;
                  hapticDecision();
                  await handleBegin(targetId);
                  setConfirmProfileId(null);
                }}
                disabled={likingId === confirmProfileId}
                className="btn-primary flex-1 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {likingId === confirmProfileId ? <Loader2 className="w-4 h-4 animate-spin" /> : "I'm In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {photoUnlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Unlock Photos?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              100 coins reveals her other photos — yours to keep.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setPhotoUnlockConfirm(null)}
                className="btn-secondary flex-1 whitespace-nowrap"
              >
                Not Now
              </button>
              <button
                onClick={() => {
                  const targetId = photoUnlockConfirm;
                  setPhotoUnlockConfirm(null);
                  hapticDecision();
                  handlePhotoUnlock(targetId);
                }}
                disabled={unlockingPhotoId === photoUnlockConfirm}
                className="btn-primary flex-1 whitespace-nowrap disabled:opacity-50"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {nudgeDialog && (
        <div
          className={`fixed inset-x-0 top-24 z-[60] flex justify-center pointer-events-none transition-opacity duration-500 ${nudgeDialog.visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="glass-surface rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl border border-white/10">
            <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white font-display text-sm font-semibold leading-tight">Nudge Sent</p>
              {nudgeDialog.charged && (
                <p className="text-ink/50 text-[11px] leading-tight mt-0.5">{nudgeDialog.cost} coins invested</p>
              )}
            </div>
          </div>
        </div>
      )}

      {nudgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Nudge Again?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              You've already nudged this profile. Nudging again will cost {nudgeConfirm.cost} coins.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setNudgeConfirm(null)} disabled={nudgingId === nudgeConfirm.profileId} className="btn-secondary flex-1 whitespace-nowrap disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmNudge}
                disabled={nudgingId === nudgeConfirm.profileId}
                className="btn-primary flex-1 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {nudgingId === nudgeConfirm.profileId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Nudge Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {profiles.length > 0 && (
        <FirstTimeHint
          show={showSwipeHint}
          icon={<ChevronUp className="w-4 h-4 text-gold" />}
          text="Swipe up to see the next profile"
          onDismiss={dismissSwipeHint}
          position="bottom"
        />
      )}
    </div>
  )
}
