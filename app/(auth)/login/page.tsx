'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogleNative, signInWithAppleNative } from '@/lib/native/socialLogin'
import { Loader2 } from 'lucide-react'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { AppleButton } from '@/components/ui/AppleButton'
import { TermsGateModal } from '@/components/auth/TermsGateModal'
import { hasAcceptedTerms, markTermsAccepted } from '@/lib/termsGate'
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
    const { data: profile } = await supabase.from('profiles').select('is_admin, onboarding_completed').eq('id', user.id).single()
    if (profile?.is_admin) window.location.href = '/admin'
    else if (!profile?.onboarding_completed) window.location.href = '/onboard'
    else window.location.href = '/discover'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="relative isolate min-h-dvh flex flex-col p-6 pt-safe-top pb-safe-bottom bg-[#0B0614]">
      <OnboardingBackground image="/onboarding/hero.jpg" />

      {/* Logo centers in whatever space is left above the buttons instead
          of the whole block being centered as one unit -- that's what
          actually pins Google/Apple to the bottom of the screen instead
          of just "lower than before". */}
      <div className="flex-1 flex items-center justify-center">
        <img src="/logo.png" alt="GreenFlag" className="w-36 h-36 animate-logo-in" />
      </div>

      <div className="w-full max-w-sm mx-auto">
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
        </div>

        {!showEmailLogin ? (
          <button
            onClick={() => setShowEmailLogin(true)}
            className="block mx-auto mt-8 text-xs text-ink/40 hover:text-ink underline underline-offset-4 decoration-ink/20 hover:decoration-ink/40 transition-colors"
          >
            Having trouble?
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input data-testid="email" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
            <input data-testid="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
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
