'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Coins, X, Heart, Lock } from 'lucide-react'
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
  const router = useRouter()
  const supabase = createClient()

  const scrollRef = useRef<HTMLDivElement>(null)

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
    <div className="relative bg-[#FAF9F7] min-h-screen">
      <div className="fixed top-0 z-50 w-full flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/40 via-black/10 to-transparent">
        <button onClick={() => router.push('/messages')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
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
            <div className="relative w-full aspect-[3/4] flex-shrink-0 overflow-hidden rounded-b-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] grid grid-cols-3 gap-0.5 bg-black">
              <div className="col-span-2 relative">
                <img
                  src={p.photos?.[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
                />
              </div>
              <div className="col-span-1 grid grid-rows-2 gap-0.5">
                {[p.photos?.[1] ?? p.photos?.[0], p.photos?.[2] ?? p.photos?.[0]].map((src: string | undefined, idx: number) => (
                  <div key={idx} className="relative overflow-hidden">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover blur-md scale-110"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F0EDE9]" />
                    )}
                  </div>
                ))}
              </div>
              {persona !== 'woman' && (
                <button
                  onClick={() => setConfirmProfileId(p.id)}
                  className="absolute top-1/2 right-[16.5%] -translate-y-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 active:scale-95 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs uppercase tracking-wide font-medium">Unlock</span>
                </button>
              )}
              {typeof p.match_percentage === 'number' && (
                <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-[#C9A961] text-xs">◆</span>
                  <span className="font-['Playfair_Display'] italic text-white text-sm">
                    {p.match_percentage}% Standard Match
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF9F7] to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 flex flex-col px-8 pt-3 pb-10">
              <h1 className="font-['Playfair_Display'] text-4xl text-ink font-semibold tracking-tight">
                {p.name}
              </h1>
              <p className="font-['Inter'] text-sm text-ink/60 tracking-wide uppercase mt-1">
                {p.age ? `${p.age}` : ''}{p.age && p.city_auto ? ' · ' : ''}{p.city_auto}
              </p>
              {p.bio && (
                <p className="text-ink/80 text-base leading-relaxed max-w-md mt-3 font-light">{p.bio}</p>
              )}
              {Array.isArray(p.match_reasons) && p.match_reasons.length > 0 && (
                <p className="text-[#C9A961] text-xs uppercase tracking-wide mt-4">
                  Shares your standard on {p.match_reasons.slice(0, 3).join(', ')}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {(p.interests_have ?? p.interests ?? []).slice(0, 5).map((interest: string) => (
                  <span
                    key={interest}
                    className="px-4 py-2 rounded-full bg-white border border-[#C9A961]/40 text-ink text-sm font-medium shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="h-px bg-[#E8E6E1] mt-6" />

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => scrollToNext(i)}
                  aria-label="Pass"
                  className="size-14 rounded-full bg-[#F0EDE9] border border-[#E8E6E1] flex items-center justify-center active:scale-95 transition-all"
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
                  className="flex-1 h-14 rounded-full bg-[#C9A961] shadow-[0_4px_16px_rgba(201,169,97,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
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
          <div className="snap-start min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C9A961]" size={32} />
          </div>
        )}
      </div>

      {confirmProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm bg-[#FAF9F7] rounded-2xl shadow-2xl p-8 text-center">
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
