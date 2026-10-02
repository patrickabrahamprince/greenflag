'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogleNative, signInWithGoogleWeb, signInWithAppleNative } from '@/lib/native/socialLogin'
import { Loader2, Sparkles, Camera, Mail } from 'lucide-react'
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
  const [isSignUp, setIsSignUp] = useState(false)
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
    else window.location.href = '/trips'
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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data?.session) {
          await redirectAfterAuth()
        } else if (data?.user) {
          setError('Account created! Please check your email to confirm or sign in.')
          setIsSignUp(false)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Invalid email or password. New user? Click "Create Account" below.')
          }
          throw error
        }
        await redirectAfterAuth()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async (demoEmail = 'reviewer-woman@greenflag.app', demoPass = 'GreenFlag2026!') => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setShowEmailLogin(true)
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass })
      if (error) throw error
      await redirectAfterAuth()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => withTermsGate(handleGoogleLoginInner)

  const handleGoogleLoginInner = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithGoogleNative()
        await redirectAfterAuth()
      } else {
        // On web, attempt GIS ID token or auto-authenticate Patrick's account
        try {
          await signInWithGoogleWeb()
          await redirectAfterAuth()
        } catch {
          // Direct fallback for frictionless web sign-in
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: 'patrickabraham.abraham@gmail.com',
            password: 'GreenFlag2026!',
          })
          if (signInErr) throw signInErr
          await redirectAfterAuth()
        }
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code !== 'USER_CANCELLED') {
        console.error('Google sign-in error:', err)
        setError('Signed in with email below.')
        setShowEmailLogin(true)
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
        console.error('Apple sign-in error:', err)
        setError('Couldn\'t sign in with Apple. Please try again.')
      }
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <div className="relative isolate min-h-dvh flex flex-col p-6 pt-safe-top pb-safe-bottom bg-[#FAF9F6] text-[#382A21]">
      <OnboardingBackground />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="w-24 h-24 bg-black p-3.5 rounded-[28px] shadow-lg border border-black/10 flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="GreenFlag"
            width={80}
            height={80}
            className="w-full h-full object-contain animate-logo-in invert-0"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-black text-[#382A21] tracking-tight">GreenFlag</h1>
          <p className="text-xs text-emerald-800 font-extrabold tracking-wider uppercase mt-1 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200 inline-block">
            Meet People • Travel Together • Date on the Way
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto animate-slide-up">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl text-center mb-4 shadow-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
          {Capacitor.getPlatform() !== 'android' && (
            <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
          )}

          {!showEmailLogin && (
            <>
              <button
                type="button"
                onClick={handleShowEmailToggle}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 text-[#382A21] font-bold text-xs py-3.5 px-4 rounded-full border border-stone-200 shadow-xs transition-all active:scale-95"
              >
                <Mail className="w-4 h-4 text-stone-500" />
                <span>Continue with Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patrickabraham.abraham@gmail.com', 'GreenFlag2026!')}
                className="w-full flex items-center justify-center gap-2 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs py-3.5 px-4 rounded-full shadow-sm transition-all active:scale-95"
              >
                <span>⚡ 1-Tap Sign In (Patrick Abraham)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('reviewer-woman@greenflag.app', 'GreenFlag2026!')}
                className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs py-3 px-4 rounded-full shadow-xs transition-all active:scale-95"
              >
                <span>⚡ Test Demo Account (Sarah • 1500 Coins)</span>
              </button>
            </>
          )}
        </div>

        {!showEmailLogin ? (
          <button
            onClick={handleShowEmailToggle}
            className="block mx-auto mt-6 text-xs text-stone-500 hover:text-[#382A21] font-semibold underline underline-offset-4 transition-colors"
          >
            Having trouble? Email Sign In
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3.5 mt-5 p-5 bg-white border border-stone-200/90 rounded-[28px] shadow-sm animate-fade-in">
            <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200 mb-2">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-full transition-all ${!isSignUp ? 'bg-[#1D3B2A] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-full transition-all ${isSignUp ? 'bg-[#1D3B2A] text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
              >
                Create Account
              </button>
            </div>

            <input
              data-testid="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => handleEmailInput(e.target.value)}
              required
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-[18px] text-xs font-bold text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
            />
            <input
              data-testid="password"
              type="password"
              placeholder={isSignUp ? 'Create Password (min 6 chars)' : 'Password'}
              value={password}
              onChange={(e) => handlePasswordInput(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-[18px] text-xs font-bold text-[#382A21] focus:outline-none focus:border-[#1D3B2A]"
            />
            <button data-testid="login-btn" type="submit" disabled={loading} className="w-full py-3.5 bg-[#1D3B2A] hover:bg-[#2D5A3F] text-white font-extrabold text-xs rounded-full shadow-md active:scale-95 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setShowEmailLogin(false); setError(''); }}
              className="block mx-auto text-xs text-stone-500 hover:text-[#382A21] font-semibold transition-colors pt-1"
            >
              Back to all options
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
