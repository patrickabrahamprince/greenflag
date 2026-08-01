'use client'
import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogleNative, signInWithAppleNative } from '@/lib/native/socialLogin'
import { SignupHeader } from '@/components/discovery/SignupHeader'
import { AuthModeToggle } from '@/components/discovery/AuthModeToggle'
import { EmailSignupForm } from '@/components/discovery/EmailSignupForm'
import { PhoneOtpForm } from '@/components/discovery/PhoneOtpForm'
import { OtpVerificationForm } from '@/components/discovery/OtpVerificationForm'
import { SignupFooter } from '@/components/discovery/SignupFooter'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { AppleButton } from '@/components/ui/AppleButton'
import { TermsGateModal } from '@/components/auth/TermsGateModal'
import { hasAcceptedTerms, markTermsAccepted } from '@/lib/termsGate'

type AuthMode = 'email' | 'phone'
type PhoneStep = 'number' | 'otp'

export default function SignupPage() {
  const [mode, setMode] = useState<AuthMode>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [e164Phone, setE164Phone] = useState('')
  const [displayDigits, setDisplayDigits] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const supabase = createClient()

  // First sign-up action on this device shows a one-time terms gate
  // before running the real handler; every action afterward runs
  // straight through since acceptance is remembered (see login/page.tsx
  // for the matching gate on returning users).
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

  const handleGoogleSignup = () => withTermsGate(handleGoogleSignupInner)

  const handleGoogleSignupInner = async () => {
    setGoogleLoading(true)
    try {
      // Native gets the real iOS account picker; web keeps the existing
      // hosted-redirect flow. See handleGoogleLogin in
      // app/(auth)/login/page.tsx for why these need to differ.
      if (Capacitor.isNativePlatform()) {
        await signInWithGoogleNative()
        window.location.href = '/'
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

  // Required alongside Google -- Apple guideline 4.8. See handleAppleLogin
  // in app/(auth)/login/page.tsx for why this won't work until Sign In
  // with Apple is configured in the Developer Portal + Supabase.
  const handleAppleSignup = () => withTermsGate(handleAppleSignupInner)

  const handleAppleSignupInner = async () => {
    setAppleLoading(true)
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithAppleNative()
        window.location.href = '/'
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

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setPhoneStep('number')
    setOtp('')
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    withTermsGate(() => handleEmailSignupInner())
  }

  const handleEmailSignupInner = async () => {
    setLoading(true)
    setError('')
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError('Welcome. Please sign in to continue.')
        setLoading(false)
        window.location.href = '/login'
        return
      }
      window.location.href = '/'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setLoading(false)
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    withTermsGate(() => handleSendOtpInner())
  }

  const handleSendOtpInner = async () => {
    setLoading(true)
    setError('')
    try {
      if (!e164Phone) {
        setError('Please enter a valid number')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signInWithOtp({ phone: e164Phone })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setPhoneStep('otp')
      setLoading(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!e164Phone) {
        setError('Invalid phone number')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.verifyOtp({ phone: e164Phone, token: otp, type: 'sms' })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (name && data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, name, persona: 'man' })
      }
      window.location.href = '/onboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 pt-safe-top pb-safe-bottom bg-[#000000]">
      <div className="w-full max-w-sm">
        <SignupHeader />
        <AuthModeToggle mode={mode} onModeChange={handleModeChange} />

        {mode === 'email' ? (
          <EmailSignupForm
            name={name} email={email} password={password}
            error={error} loading={loading}
            onNameChange={setName} onEmailChange={setEmail} onPasswordChange={setPassword}
            onSubmit={handleEmailSignup}
          />
        ) : phoneStep === 'number' ? (
          <PhoneOtpForm
            name={name} displayDigits={displayDigits} e164Phone={e164Phone}
            error={error} loading={loading}
            onNameChange={setName}
            onPhoneChange={(e164, raw) => { setE164Phone(e164); setDisplayDigits(raw); }}
            onSubmit={handleSendOtp}
          />
        ) : (
          <OtpVerificationForm
            e164Phone={e164Phone} otp={otp}
            error={error} loading={loading}
            onOtpChange={setOtp}
            onChangeNumber={() => { setPhoneStep('number'); setOtp(''); setError(''); }}
            onSubmit={handleVerifyOtp}
            onResendOtp={handleSendOtp}
          />
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-ink/40 text-xs uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>
        <div className="space-y-3">
          <GoogleButton onClick={handleGoogleSignup} loading={googleLoading} />
          <AppleButton onClick={handleAppleSignup} loading={appleLoading} />
        </div>

        <SignupFooter />
      </div>
      <TermsGateModal
        open={pendingAction !== null}
        onAccept={handleAcceptTerms}
        onClose={() => setPendingAction(null)}
      />
    </div>
  )
}
