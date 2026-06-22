'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SignupHeader } from '@/components/discovery/SignupHeader'
import { AuthModeToggle } from '@/components/discovery/AuthModeToggle'
import { EmailSignupForm } from '@/components/discovery/EmailSignupForm'
import { PhoneOtpForm } from '@/components/discovery/PhoneOtpForm'
import { OtpVerificationForm } from '@/components/discovery/OtpVerificationForm'
import { SignupFooter } from '@/components/discovery/SignupFooter'

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
  const supabase = createClient()

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setPhoneStep('number')
    setOtp('')
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setError('Account created. Please login.')
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!e164Phone) {
        setError('Please enter a valid phone number')
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
        await supabase.from('profiles').upsert({ id: data.user.id, name })
      }
      window.location.href = '/onboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
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

        <SignupFooter />
      </div>
    </div>
  )
}
