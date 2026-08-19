'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogleNative, signInWithAppleNative } from '@/lib/native/socialLogin'
import { Loader2, Sparkles, Camera } from 'lucide-react'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { AppleButton } from '@/components/ui/AppleButton'
import { TermsGateModal } from '@/components/auth/TermsGateModal'
import { hasAcceptedTerms, markTermsAccepted, getTermsAcceptedAt } from '@/lib/termsGate'
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Google/Apple are the front door now; email/password stays as a
  // fallback for existing password accounts (and for automated tests,
  // which can't drive a real OAuth picker) behind a "Having trouble?"
  // reveal instead of showing by default.
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Restore typed email and password if user returns from Terms / Privacy / etc.
  useEffect(() => {
    try {
      const savedEmail = sessionStorage.getItem('gf_login_email')
      const savedPassword = sessionStorage.getItem('gf_login_password')
      const savedShow = sessionStorage.getItem('gf_login_show_form')
      if (savedEmail) setEmail(savedEmail)
      if (savedPassword) setPassword(savedPassword)
      if (savedShow === 'true' || savedEmail || savedPassword) {
        setShowEmailLogin(true)
      }
    } catch {}
  }, [])

  const handleEmailInput = (val: string) => {
    setEmail(val)
    try { sessionStorage.setItem('gf_login_email', val) } catch {}
  }

  const handlePasswordInput = (val: string) => {
    setPassword(val)
    try { sessionStorage.setItem('gf_login_password', val) } catch {}
  }

  const handleShowEmailToggle = () => {
    setShowEmailLogin(true)
    try { sessionStorage.setItem('gf_login_show_form', 'true') } catch {}
  }

  // First sign-in/sign-up action on this device shows a one-time terms
  // gate before running the real handler; every action afterward runs
  // straight through since acceptance is remembered.
  const withTermsGate = (action: () => void) => {
    if (hasAcceptedTerms()) {
      action()
    } else {
      setPendingAction(() => action)
    }
  }

  const handleAcceptTerms = () => {
    markTermsAccepted()
    const action = pendingAction
    setPendingAction(null)
    action?.()
  }

  // Shared by both native social flows -- signInWithOAuth (web) redirects
  // through /auth/callback and handles this itself, but signInWithIdToken
  // resolves with a session already established in this same page load,
  // so the native path needs its own post-auth redirect.
  const redirectAfterAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    // Best-effort, non-blocking -- this column may not exist yet in every
    // environment (see the accompanying migration), and a write failure
    // here must never be the reason login itself fails. The localStorage
    // timestamp survives regardless; this just also ties it to the
    // account once we have a user id to attach it to.
    const acceptedAt = getTermsAcceptedAt()
    if (acceptedAt) {
      supabase.from('profiles').update({ terms_accepted_at: acceptedAt }).eq('id', user.id).then(({ error }) => {
        if (error && process.env.NODE_ENV === 'development') console.error('Failed to persist terms_accepted_at:', error.message)
      })
    }
    try {
      sessionStorage.removeItem('gf_login_email')
      sessionStorage.removeItem('gf_login_password')
      sessionStorage.removeItem('gf_login_show_form')
    } catch {}

    const { data: profile } = await supabase.from('profiles').select('is_admin, onboarding_completed').eq('id', user.id).single()

    // Android only: the client Supabase calls above already see the new
    // session (it's held in memory), but the session cookie itself is
    // written into Android's WebView CookieManager asynchronously. A hard
    // navigation fired immediately can reach middleware.ts before that
    // write lands, so middleware sees no cookie, treats the request as
    // signed out, and bounces it back to a login page -- looks like the
    // sign-in silently failed. iOS's WKWebView doesn't have this lag.
    if (Capacitor.getPlatform() === 'android') {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    if (profile?.is_admin) window.location.href = '/admin'
    else if (!profile?.onboarding_completed) window.location.href = '/onboard'
    else window.location.href = '/discover'
  }

  // Google/Apple both go through withTermsGate (see handleGoogleLogin/
  // handleAppleLogin below) -- this fallback form skipped it entirely,
  // so anyone using "Having trouble?" never saw the terms gate at all.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    withTermsGate(handleLoginInner)
  }

  const handleLoginInner = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await redirectAfterAuth()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => withTermsGate(handleGoogleLoginInner)

  const handleGoogleLoginInner = async () => {
    setGoogleLoading(true)
    try {
      // Native gets the real iOS account picker via Google's SDK; web keeps
      // the existing hosted-redirect flow (in-app native, in-browser web --
      // a WKWebView redirect has no access to the device's signed-in
      // Google accounts the way the native SDK does).
      if (Capacitor.isNativePlatform()) {
        await signInWithGoogleNative()
        await redirectAfterAuth()
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code !== 'USER_CANCELLED') {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // Required alongside Google -- Apple guideline 4.8 requires offering
  // Sign in with Apple wherever another third-party social login is
  // offered. The native path additionally needs the Sign In with Apple
  // capability enabled on the App ID in the Apple Developer Portal; the
  // web path needs Apple configured as an OAuth provider in Supabase.
  // Neither is done yet, so both branches are wired up ahead of that.
  const handleAppleLogin = () => withTermsGate(handleAppleLoginInner)

  const handleAppleLoginInner = async () => {
    setAppleLoading(true)
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithAppleNative()
        await redirectAfterAuth()
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code !== 'USER_CANCELLED') {
        setError(err instanceof Error ? err.message : 'Apple sign-in failed')
      }
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <div className="relative isolate min-h-dvh flex flex-col p-6 pt-safe-top pb-safe-bottom bg-base">
      <OnboardingBackground image="/onboarding/hero.jpg" light />

      {/* Logo centers in whatever space is left above the buttons instead
          of the whole block being centered as one unit -- that's what
          actually pins Google/Apple to the bottom of the screen instead
          of just "lower than before". */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
        <Image
          src="/logo.png"
          alt="GreenFlag"
          width={144}
          height={144}
          className="w-36 h-36 animate-logo-in"
          style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(210,4,45,0.25))' }}
        />

      </div>

      <div className="w-full max-w-sm mx-auto animate-slide-up">
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
        </div>

        {!showEmailLogin ? (
          <button
            onClick={handleShowEmailToggle}
            className="block mx-auto mt-8 text-xs text-ink/40 hover:text-ink underline underline-offset-4 decoration-ink/20 hover:decoration-ink/40 transition-colors"
          >
            Having trouble?
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input
              data-testid="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => handleEmailInput(e.target.value)}
              required
              className="input w-full"
            />
            <input
              data-testid="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handlePasswordInput(e.target.value)}
              required
              className="input w-full"
            />
            <button data-testid="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign In'}
            </button>
          </form>
        )}
      </div>
      <TermsGateModal
        open={pendingAction !== null}
        onAccept={handleAcceptTerms}
        onClose={() => setPendingAction(null)}
      />
    </div>
  )
}
