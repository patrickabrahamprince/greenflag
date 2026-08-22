'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Coins, X, Heart, Lock, Instagram, Briefcase, Ruler, Bell, ImageOff, ChevronLeft, ChevronRight, Gift, Flag, MapPin, MoreVertical } from 'lucide-react'
import { LoadingLogo } from '@/components/shared/LoadingLogo'
import toast from 'react-hot-toast'
import { CoinBadge } from '@/components/shared/coin-badge'
import { InsufficientCoinsDialog } from '@/components/shared/InsufficientCoinsDialog'
import { IconButton } from '@/components/shared/IconButton'
import { MatchMomentOverlay } from '@/components/shared/MatchMomentOverlay'
import { SocialProofLine } from '@/components/shared/SocialProofLine'
import { createClient } from '@/lib/supabase/client'
import { useCoinStore, useUserStore } from '@/lib/store'
import { GIFT_TYPES } from '@/lib/gift-types'
import { MEET_STANDARD_COST } from '@/lib/coin-costs'
import { hapticTap, hapticDecision, hapticSuccess } from '@/lib/haptics'
import { DiscoverySkeleton } from '@/components/discovery/DiscoverySkeleton'
import { getCached, setCached } from '@/lib/pageCache'
import { useFirstTimeHint } from '@/lib/hooks/useFirstTimeHint'
import { useNudge } from '@/lib/hooks/useNudge'
import { useGifting } from '@/lib/hooks/useGifting'
import { usePhotoUnlock } from '@/lib/hooks/usePhotoUnlock'
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion'
import { FirstTimeHint } from '@/components/shared/FirstTimeHint'
import { ChevronUp } from 'lucide-react'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { DayExplanationModal } from '@/components/shared/DayExplanationModal'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { BlockReportModal } from '@/components/discover/BlockReportModal'
import { ProfileCard } from '@/components/discovery/ProfileCard'
import { ProfilesList } from '@/components/discovery/ProfilesList'

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
  const [insufficientCoinsMessage, setInsufficientCoinsMessage] = useState<string | null>(null)
  const [matchMoment, setMatchMoment] = useState<{ theirPhoto: string | null; nextPath: string | null } | null>(null)
  const currentUser = useUserStore((s) => s.user)
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
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({})
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set())
  const [blockReportModalId, setBlockReportModalId] = useState<string | null>(null)
  const [blockReportModalName, setBlockReportModalName] = useState('')
  const { nudgingId, nudgeDialog, nudgeConfirm, handleNudge, handleConfirmNudge, cancelNudgeConfirm } =
    useNudge(setInsufficientCoinsMessage)
  const { giftPickerProfileId, sendingGiftType, openGiftPicker, closeGiftPicker, handleSendGift } =
    useGifting(setInsufficientCoinsMessage)
  const {
    photoUnlockConfirm,
    unlockingPhotoId,
    unlockedPhotoIds,
    openPhotoUnlockConfirm,
    closePhotoUnlockConfirm,
    handlePhotoUnlock,
  } = usePhotoUnlock(setInsufficientCoinsMessage)
  const prefersReducedMotion = usePrefersReducedMotion()
  // Which photo each card's carousel is currently showing, keyed by profile
  // id -- a single Record instead of per-card useState, since hooks can't
  // be called inside the profiles.map() below.
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({})
  const deductCoins = useCoinStore((s) => s.deduct)
  const router = useRouter()
  const supabase = createClient()
  const { show: showSwipeHint, dismiss: dismissSwipeHint } = useFirstTimeHint('discover-swipe-up')
  const { isComplete: onboardingComplete, markComplete: completeOnboarding, isLoading: onboardingLoading } = useOnboarding()
  const [showDayExplanation, setShowDayExplanation] = useState<1 | 2 | 3 | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const cardTouchStart = useRef<Record<string, { x: number; y: number }>>({})

  // The confirm/gift/photo-unlock dialogs are `fixed inset-0` overlays,
  // not children of the snap-scroll feed -- fixed positioning alone
  // doesn't stop a drag that starts over the overlay from still
  // scrolling the feed underneath it on mobile Safari/WKWebView. Locking
  // the feed's own scroll container while any of them is open (instead
  // of relying on the overlay to block it) is what actually stops that.
  const anyDialogOpen = !!(confirmProfileId || photoUnlockConfirm || giftPickerProfileId)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.style.overflowY = anyDialogOpen ? 'hidden' : ''
  }, [anyDialogOpen])

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
    // Neither call below normally rejects (the Supabase client resolves
    // with an { error } field rather than throwing for ordinary query
    // failures), but a real connectivity drop during the request can still
    // reject the promise -- without a .catch() here, that left the page
    // stuck on the loading logo forever since nothing else ever sets
    // checkingAccess back to false.
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
              if (sData && !sData.isActive && (!sData.intentions || sData.intentions.length < 9)) {
                router.replace('/standard/builder')
                return // navigating away -- leave checkingAccess true
              }
              setCheckingAccess(false)
            })
            .catch(() => { if (!cancelled) setCheckingAccess(false) })
        } else {
          setCheckingAccess(false)
        }
      }, () => { if (!cancelled) setCheckingAccess(false) })
    }).catch(() => { if (!cancelled) setCheckingAccess(false) })
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

  function onTouchStart() {
    // Dismissing here (gesture start, before any scrolling happens) instead
    // of via onScroll matters: onScroll fires dozens of times through an
    // active swipe, and on the very first swipe (before the hint's state
    // has flipped) each of those firings could trigger a re-render of the
    // whole card list while WebKit's momentum-scroll gesture is still in
    // progress -- WebKit is known to abort/stick scroll-snap when DOM
    // inside the scrolling container mutates mid-gesture.
    dismissSwipeHint()
  }

  function scrollToNext(index: number) {
    const container = scrollRef.current
    if (!container) return
    // Profile cards are children[0], children[1], ... -- the *next* card
    // after index i is children[i + 1].
    const next = container.children[index + 1] as HTMLElement | undefined
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  function handlePass(profileId: string, index: number) {
    // Remove the profile from state so it doesn't reappear on scroll
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== profileId)
      setCached(PROFILES_CACHE_KEY, next)
      return next
    })
    // Then scroll to the next card
    scrollToNext(index)
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
      const theirPhoto = profiles.find(p => p.id === profileId)?.photos?.[0] ?? null
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: profileId })
      })
      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'insufficient_funds') {
          setInsufficientCoinsMessage('You need more coins to meet her Standard. Top up to keep going.')
          return
        }
        throw new Error(err.error || 'Failed to like profile')
      }
      const { matchId } = await res.json()
      deductCoins(MEET_STANDARD_COST)
      setProfiles(prev => {
        const next = prev.filter(p => p.id !== profileId)
        setCached(PROFILES_CACHE_KEY, next)
        return next
      })
      hapticSuccess()
      setMatchMoment({ theirPhoto, nextPath: matchId ? `/task/${matchId}` : null })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLikingId(null)
    }
  }

  const handleMatchMomentContinue = useCallback(() => {
    const nextPath = matchMoment?.nextPath ?? null
    setMatchMoment(null)
    if (nextPath) {
      router.push(nextPath)
    }
  }, [matchMoment, router])

  if (checkingAccess) {
    // Plain flat black -- NOT bg-base/screen-gradient, which are actually
    // identical to each other (both apply the same wine-glow radial via
    // globals.css) and would look no different here. This screen
    // immediately follows the onboarding transition overlay (flat
    // bg-black/40 blur) for a woman without an active Standard, who
    // bounces straight through to /standard/builder a beat later. The
    // glow's warm color reads as a visible shift between those two
    // back-to-back loading moments; true flat black keeps it one
    // continuous dark screen instead of two different-looking ones.
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
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
    <div className="relative screen-gradient h-[calc(100dvh-5rem)] max-w-app mx-auto">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app flex flex-col pointer-events-none">
        <div className="flex items-center justify-between px-5 pt-safe-top pb-10 bg-gradient-to-b from-black/70 via-black/25 to-transparent">
          <div className="pointer-events-auto">
            <CoinBadge onClick={() => { hapticTap(); router.push('/coins'); }} />
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        className="snap-y snap-mandatory overflow-y-scroll overscroll-none scroll-smooth h-dvh scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {profiles.map((p, i) => (
          <div
            key={p.id}
            ref={i === profiles.length - 1 ? lastProfileRef : null}
            data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'profile-card' : undefined}
            className={`snap-start snap-always h-dvh w-full relative overflow-hidden ${prefersReducedMotion ? '' : 'animate-card-enter'}`}
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
                  <div
                    className="relative w-full h-full overflow-hidden"
                    onTouchStart={(e) => {
                      // This card is edge-to-edge (inset-0), so a touch
                      // starting near the left edge to swipe to the
                      // previous photo also lands inside
                      // SwipeBackGesture's edge-swipe zone. Without this,
                      // that same touch bubbles up and triggers
                      // router.back() off Discover (a bottom-nav tab)
                      // instead of just changing the photo.
                      e.stopPropagation()
                      cardTouchStart.current[p.id] = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                    }}
                    onTouchEnd={(e) => {
                      const start = cardTouchStart.current[p.id]
                      delete cardTouchStart.current[p.id]
                      if (!start) return
                      const dx = e.changedTouches[0].clientX - start.x
                      const dy = e.changedTouches[0].clientY - start.y
                      // Dominant-horizontal + distance check, same pattern as
                      // ProfileImageCarousel -- a vertical swipe (the much
                      // more common gesture here, for moving to the next
                      // profile) never satisfies this, so it's left alone
                      // for the outer scroll-snap container to handle.
                      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                        goTo(idx + (dx > 0 ? -1 : 1))
                      }
                    }}
                  >
                    {!src || failedPhotoUrls.has(src) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-well">
                        <ImageOff className="w-9 h-9 text-ink/25" />
                        <span className="text-ink/30 text-xs font-medium">No photo available</span>
                      </div>
                    ) : (
                      <img
                        src={src}
                        alt=""
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className={`w-full h-full object-cover ${isLocked ? 'blur scale-110' : ''}`}
                        onError={() => src && setFailedPhotoUrls(prev => new Set(prev).add(src))}
                      />
                    )}

                    {isLocked && (
                      <button
                        onClick={() => { hapticTap(); openPhotoUnlockConfirm(p.id) }}
                        aria-label="Unlock"
                        className="glass-surface absolute inset-0 m-auto z-20 flex items-center justify-center gap-1.5 h-9 w-fit px-4 rounded-full active:scale-95 transition-all shadow-lg"
                      >
                        <Lock className="w-3.5 h-3.5 text-ink shrink-0" />
                        <span className="text-ink text-xs uppercase tracking-wide font-display font-bold whitespace-nowrap">Unlock Photos</span>
                      </button>
                    )}

                    {total > 1 && (
                      <>
                        {/* Story-style segmented progress bar, one segment per
                            photo -- the deck's own photo-position indicator.
                            Purely additive on top of the existing swipe/tap
                            chevron navigation below; doesn't replace it. */}
                        <div className="absolute top-safe-top inset-x-3 z-10 flex gap-1 pt-3">
                          {photos.map((_, segIdx) => (
                            <div key={segIdx} className="flex-1 h-1 rounded-full bg-ink/20 shadow-[0_0_2px_rgba(0,0,0,0.5)] overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full transition-all duration-200"
                                style={{ width: segIdx <= idx ? '100%' : '0%' }}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx - 1) }}
                          aria-label="Previous photo"
                          className="absolute left-2 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                        >
                          <ChevronLeft className="w-5 h-5 text-ink" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); hapticTap(); goTo(idx + 1) }}
                          aria-label="Next photo"
                          className="absolute right-2 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
                        >
                          <ChevronRight className="w-5 h-5 text-ink" />
                        </button>
                      </>
                    )}

                    {/* Compatibility badge -- solid Crimson pill, white
                        glyph + percentage, top-right per the design system
                        (previously a translucent glass pill, top-left).
                        Crimson is dark/saturated -- unlike Mindaro, this
                        needs white text/icon, not dark. */}
                    {typeof p.match_percentage === 'number' && (
                      <div className="absolute top-safe-top right-3 mt-8 z-10 flex flex-col items-end gap-1">
                        <div className="bg-gold flex items-center gap-1 rounded-pill pl-2 pr-2.5 py-1">
                          <Flag className="w-3 h-3 text-ink" fill="currentColor" />
                          <span className="font-display font-bold text-ink text-xs whitespace-nowrap">
                            {p.match_percentage}%
                          </span>
                        </div>
                        {persona === 'woman' && !!interestCounts[p.id] && (
                          <span className="glass-surface rounded-full px-3 py-1 text-ink/80 text-[11px] whitespace-nowrap">
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

            {/* The card now runs the full screen height (photo extends all
                the way down, with the floating glass nav sitting on top of
                it) instead of leaving a dead reserved strip below the card
                for the nav -- pb-32 clears the nav's real footprint (its
                own height plus env(safe-area-inset-bottom)) from the true
                bottom of the screen. */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-32 pt-10">
              <div>
                {/* Name + age on one line, location on its own line below
                    with a pin glyph -- matches the deck's card typography
                    (was name/age-and-city stacked as two differently-styled
                    lines with no location icon). */}
                <h1 className="font-display text-title text-ink leading-none">
                  {p.name}{p.age ? `, ${p.age}` : ''}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {p.city_auto && (
                    <p className="flex items-center gap-1 font-sans text-label text-ink/70 leading-none">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {p.city_auto}
                    </p>
                  )}
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
                // Card shows at most 5 tags total, not 5 "have" + 3
                // "values" -- have-interests get priority, values only
                // fill whatever room is left under that cap.
                const MAX_CARD_TAGS = 5
                const shownInterests = (p.interests_have?.length ? p.interests_have : p.interests ?? []).slice(0, MAX_CARD_TAGS)
                const lookingFor = (p.interests_looking_for?.length ? p.interests_looking_for : p.looking_for_interests ?? [])
                  .filter((interest) => !shownInterests.includes(interest))
                  .slice(0, Math.max(0, MAX_CARD_TAGS - shownInterests.length))
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
                                // Solid Crimson fill needs white text --
                                // Crimson is dark/saturated (unlike
                                // Dateasy's light Mindaro, which needed
                                // dark text here instead).
                                ? `${sizeClass} rounded-full bg-gold text-ink font-medium shadow-[0_2px_10px_rgba(210,4,45,0.4)] leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_16px_rgba(210,4,45,0.6)] active:scale-95`
                                : `glass-surface ${sizeClass} rounded-full text-ink font-medium leading-none cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-raised/5 active:scale-95`)
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
                            className="px-2.5 py-1 text-xs rounded-full border border-raised text-ink/70 font-medium leading-none"
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

              <div className={persona === 'woman' ? 'flex items-center gap-4 pt-2 shrink-0' : 'flex items-center justify-center gap-4 pt-2 shrink-0'}>
                {persona === 'woman' ? (
                  <>
                    <button
                      onClick={() => handleBegin(p.id)}
                      disabled={likingId === p.id}
                      aria-label="View Profile"
                      className="btn-primary flex-1 h-12 flex items-center justify-center gap-1.5"
                    >
                      {likingId === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-ink" />
                      ) : (
                        <>
                          <Heart className="w-4 h-4 text-ink" />
                          <span className="text-ink text-xs uppercase tracking-wide font-display font-bold">View Profile</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleNudge(p.id)}
                      disabled={nudgingId === p.id}
                      aria-label="Nudge"
                      className="glass-surface flex-1 h-12 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {nudgingId === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-ink" />
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-ink" />
                          <span className="text-ink text-xs uppercase tracking-wide font-display font-bold">Nudge</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { hapticTap(); setBlockReportModalId(p.id); setBlockReportModalName(p.name) }}
                      aria-label="More options"
                      className="glass-surface w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all"
                    >
                      <MoreVertical className="w-4 h-4 text-ink" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Dismiss = dark/well fill, Gift = secondary Lavender
                        fill, Like/pursue = the largest, primary Pinkish-Red
                        circle -- the deck's dismiss/like color treatment,
                        adapted to this app's real 3 actions (there's no
                        gift-giving in the Dateasy concept to copy a color
                        from). Was 46px glass circles + a 48px gradient-fill
                        heart; now 56px flat circles + a 64px primary. */}
                    <IconButton
                      icon={<X className="w-5 h-5" />}
                      label="Pass"
                      variant="dark"
                      onClick={() => { hapticTap(); handlePass(p.id, i) }}
                      className="shrink-0"
                    />
                    <IconButton
                      icon={<Gift className="w-5 h-5" />}
                      label="Send Gift"
                      variant="lavender"
                      onClick={() => { hapticTap(); openGiftPicker(p.id) }}
                      className="shrink-0"
                    />
                    <button
                      onClick={() => { hapticDecision(); setConfirmProfileId(p.id) }}
                      disabled={likingId === p.id}
                      aria-label="Meet Her Standard"
                      className="w-16 h-16 rounded-full flex items-center justify-center active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 shrink-0 bg-[#D2042D]"
                    >
                      {likingId === p.id ? (
                        <Loader2 className="w-6 h-6 animate-spin text-ink" />
                      ) : (
                        <Heart className="w-7 h-7 text-ink" fill="currentColor" />
                      )}
                    </button>
                    <button
                      onClick={() => { hapticTap(); setBlockReportModalId(p.id); setBlockReportModalName(p.name) }}
                      aria-label="More options"
                      className="glass-surface w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0"
                    >
                      <MoreVertical className="w-4 h-4 text-ink" />
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
        {/* Was gated on profiles.length === 0, so once you'd loaded any
            profiles at all there was nothing rendered after the last real
            card -- no snap target to land on and, with overscroll disabled,
            nothing to bounce you back either. Swiping past the last card
            just left the view stuck in dead overscrolled space. Gating on
            !hasMore instead means there's always a final snap target,
            whether the list started empty or you scrolled to the end of it. */}
        {!pageLoading && !hasMore && (
          <div className="snap-start min-h-dvh flex flex-col items-center justify-center px-8 text-center animate-fade-in">
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
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-overlay rounded-card shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Make Your Move?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-3">
              {MEET_STANDARD_COST} coins begins your 3-day pursuit — worth it if she&apos;s the one.
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
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-overlay rounded-card shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Unlock Photos?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              100 coins reveals her other photos — yours to keep.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => closePhotoUnlockConfirm()}
                className="btn-secondary flex-1 whitespace-nowrap"
              >
                Not Now
              </button>
              <button
                onClick={() => {
                  const targetId = photoUnlockConfirm;
                  closePhotoUnlockConfirm();
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

      {giftPickerProfileId && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-overlay rounded-card shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Send a Gift</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              A no-commitment way to stand out — no match required.
            </p>
            <div className="space-y-2.5 mb-4">
              {GIFT_TYPES.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(giftPickerProfileId, gift.id)}
                  disabled={!!sendingGiftType}
                  className="w-full glass-surface rounded-xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <span className="flex items-center gap-2.5 text-ink font-display text-sm font-semibold">
                    <span className="text-xl">{gift.emoji}</span>
                    {gift.label}
                  </span>
                  {sendingGiftType === gift.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : (
                    <span className="text-gold text-xs font-display font-bold">{gift.cost} coins</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => closeGiftPicker()}
              disabled={!!sendingGiftType}
              className="btn-secondary w-full whitespace-nowrap disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {insufficientCoinsMessage && (
        <InsufficientCoinsDialog
          message={insufficientCoinsMessage}
          onDismiss={() => setInsufficientCoinsMessage(null)}
        />
      )}

      <MatchMomentOverlay
        open={!!matchMoment}
        myPhoto={currentUser?.photos?.[0] ?? null}
        theirPhoto={matchMoment?.theirPhoto ?? null}
        onContinue={handleMatchMomentContinue}
      />

      {nudgeDialog && (
        <div
          className={`fixed inset-x-0 top-24 z-[60] flex justify-center pointer-events-none transition-opacity duration-500 ${nudgeDialog.visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="glass-surface rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl border border-raised">
            <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-ink font-display text-sm font-semibold leading-tight">Nudge Sent</p>
              {nudgeDialog.charged && (
                <p className="text-ink/50 text-[11px] leading-tight mt-0.5">{nudgeDialog.cost} coins invested</p>
              )}
            </div>
          </div>
        </div>
      )}

      {nudgeConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-overlay rounded-card shadow-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-gold" />
            </div>
            <h4 className="font-display text-2xl text-ink mb-2">Nudge Again?</h4>
            <p className="text-ink/60 text-sm leading-relaxed mb-6">
              You've already nudged this profile. Nudging again will cost {nudgeConfirm.cost} coins.
            </p>
            <div className="flex gap-4">
              <button onClick={() => cancelNudgeConfirm()} disabled={nudgingId === nudgeConfirm.profileId} className="btn-secondary flex-1 whitespace-nowrap disabled:opacity-50">
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

      {/* Onboarding Modal */}
      {!onboardingLoading && !onboardingComplete && (
        <OnboardingFlow onComplete={completeOnboarding} />
      )}

      {/* Day Explanation Modal */}
      {showDayExplanation && (
        <DayExplanationModal day={showDayExplanation} onClose={() => setShowDayExplanation(null)} />
      )}

      {/* Block/Report Modal */}
      {blockReportModalId && (
        <BlockReportModal
          profileId={blockReportModalId}
          profileName={blockReportModalName}
          isOpen={!!blockReportModalId}
          onClose={() => setBlockReportModalId(null)}
        />
      )}

    </div>
  )
}
