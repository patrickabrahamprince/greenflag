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
        await signInWithGoogleWeb()
        await redirectAfterAuth()
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code !== 'USER_CANCELLED') {
        console.error('Google sign-in error:', err)
        setError('Google Sign-In is unavailable on web. Please sign in with email or demo login below.')
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
    <div className="relative isolate min-h-dvh flex flex-col justify-between p-6 pt-safe-top pb-safe-bottom bg-white text-[#1C1C1E] overflow-hidden">
      <OnboardingBackground />

      {/* Brand Header */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 my-auto animate-fade-in z-10">
        <div className="w-18 h-18 bg-[#1C1C1E] p-3.5 rounded-2xl shadow-md border border-stone-200 flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="GreenFlag"
            width={64}
            height={64}
            className="w-full h-full object-contain animate-logo-in"
            priority
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-[#1C1C1E] tracking-tight">GreenFlag</h1>
          <p className="text-stone-500 text-xs font-medium">
            Travel Getaways • Dating on the Way
          </p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-sm mx-auto animate-slide-up z-10">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl text-center mb-4 shadow-xs">
            {error}
          </div>
        )}

        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-3.5">
          <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} onSuccess={redirectAfterAuth} />

          {Capacitor.getPlatform() !== 'android' && (
            <AppleButton onClick={handleAppleLogin} loading={appleLoading} />
          )}

          {!showEmailLogin ? (
            <>
              <button
                type="button"
                onClick={handleShowEmailToggle}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 text-[#1C1C1E] font-bold text-xs py-3.5 px-4 rounded-full border border-stone-300 shadow-2xs transition-all active:scale-[0.98]"
              >
                <Mail className="w-4 h-4 text-stone-500" />
                <span>Continue with Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('reviewer-woman@greenflag.app', 'GreenFlag2026!')}
                className="w-full flex items-center justify-center gap-2 bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs py-3.5 px-4 rounded-full shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Instant Reviewer Sign In (Sarah)</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3 animate-fade-in pt-1">
              <div className="flex bg-[#F4F4F5] p-1 rounded-full border border-stone-200 mb-2">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${!isSignUp ? 'bg-[#1C1C1E] text-white shadow-2xs' : 'text-stone-500 hover:text-[#1C1C1E]'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${isSignUp ? 'bg-[#1C1C1E] text-white shadow-2xs' : 'text-stone-500 hover:text-[#1C1C1E]'}`}
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
                className="w-full p-3.5 bg-[#F4F4F5] border border-stone-200 rounded-2xl text-xs font-medium text-[#1C1C1E] focus:outline-none focus:border-[#1C1C1E] focus:bg-white transition-all"
              />
              <input
                data-testid="password"
                type="password"
                placeholder={isSignUp ? 'Create Password (min 6 chars)' : 'Password'}
                value={password}
                onChange={(e) => handlePasswordInput(e.target.value)}
                required
                minLength={6}
                className="w-full p-3.5 bg-[#F4F4F5] border border-stone-200 rounded-2xl text-xs font-medium text-[#1C1C1E] focus:outline-none focus:border-[#1C1C1E] focus:bg-white transition-all"
              />
              <button
                data-testid="login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs rounded-full shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" /> : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setShowEmailLogin(false); setError(''); }}
                className="block mx-auto text-xs text-stone-500 hover:text-[#1C1C1E] font-medium transition-colors pt-1"
              >
                Back to all options
              </button>
            </form>
          )}
        </div>

        {!showEmailLogin && (
          <p className="text-center text-[11px] text-stone-400 font-normal mt-4">
            By signing in, you agree to our <a href="/terms" className="underline hover:text-stone-700">Terms</a> & <a href="/privacy" className="underline hover:text-stone-700">Privacy Policy</a>
          </p>
        )}
      </div>

      <TermsGateModal
        open={pendingAction !== null}
        onAccept={handleAcceptTerms}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
}
