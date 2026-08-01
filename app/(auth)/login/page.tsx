'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogleNative, signInWithAppleNative } from '@/lib/native/socialLogin'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { AppleButton } from '@/components/ui/AppleButton'
import { SignOutStrip } from './sign-out'
import { TermsGateModal } from '@/components/auth/TermsGateModal'
import { hasAcceptedTerms, markTermsAccepted } from '@/lib/termsGate'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // Shared by password login and both native social flows -- signInWithOAuth
  // (web) redirects through /auth/callback and handles this itself, but
  // signInWithPassword and signInWithIdToken both resolve with a session
  // already established in this same page load, so they need their own
  // post-auth redirect.
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
    <div className="min-h-dvh flex items-center justify-center p-6 pt-safe-top pb-safe-bottom" style={{ background: 'radial-gradient(ellipse 140% 90% at 50% -25%, rgba(192, 38, 211, 0.45) 0%, rgba(124, 58, 237, 0.22) 35%, rgba(11, 6, 20, 0) 70%), radial-gradient(ellipse 100% 70% at 100% 100%, rgba(124, 58, 237, 0.18) 0%, transparent 60%), #0B0614' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="GreenFlag" className="w-36 h-36 mx-auto animate-logo-in" />
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input data-testid="email" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
          <input data-testid="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button data-testid="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-ink/40 text-xs uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>
        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
        </div>

        <p className="text-ink/50 text-sm mt-8 text-center">
          New to Greenflag?{' '}
          <Link href="/signup" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold transition-colors">
            Begin Your Journey
          </Link>
        </p>
        <SignOutStrip />
      </div>
      <TermsGateModal
        open={pendingAction !== null}
        onAccept={handleAcceptTerms}
        onClose={() => setPendingAction(null)}
      />
    </div>
  )
}
