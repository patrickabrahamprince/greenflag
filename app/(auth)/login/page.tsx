'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Phone, ArrowLeft, Loader2 } from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'
import { GoogleButton } from '@/components/ui/GoogleButton'

type PhoneStep = 'number' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number')
  const [e164Phone, setE164Phone] = useState('')
  const [displayDigits, setDisplayDigits] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isE2ETest = (process.env.NEXT_PUBLIC_E2E_TESTING || '').trim() === 'true'


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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isE2ETest) {
        const e2ePhoneMap: Record<string, string> = {
          'man@test.com': '+919876500001',
          'woman@test.com': '+919876500002',
          'admin@test.com': '+919876500003',
          'test.man@greenflag.test': '+919876500001',
          'test.woman@greenflag.test': '+919876500002',
          'test.admin@greenflag.test': '+919876500003',
        }
        const phone = e2ePhoneMap[email]
        if (phone) {
          const { error } = await supabase.auth.signInWithPassword({ phone, password })
          if (error) throw error
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/'); return }
        const { data: profile } = await supabase.from('profiles').select('persona, is_admin').eq('id', user.id).single()
        if (profile?.is_admin) router.push('/admin')
        else router.push(profile?.persona === 'woman' ? '/connections' : '/discover')
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('persona, is_admin, onboarding_completed').eq('id', user.id).single()
      if (profile?.is_admin) router.push('/admin')
      else router.push(profile?.persona === 'woman' ? '/connections' : '/discover')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
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
      const { error } = await supabase.auth.verifyOtp({ phone: e164Phone, token: otp, type: 'sms' })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('persona, is_admin, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin) {
        window.location.href = '/admin'
      } else {
        window.location.href = profile?.persona === 'woman' ? '/connections' : '/discover'
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    } catch {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
            <h1 className="relative text-5xl font-display italic text-white mb-3" style={{ fontWeight: 500 }}>
              GreenFlag
            </h1>
          </div>
          <div className="hairline mx-auto mt-6 mb-2 w-16" />
          <p className="text-muted text-sm font-thin tracking-wide mt-4">Set your standards. Meet your match.</p>
        </div>
        <h2 className="text-white text-center text-2xl font-bold mb-4">Welcome to GreenFlag</h2>
        {isE2ETest ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log in'}
          </button>
        </form>
      ) : (
        phoneStep === 'number' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="tel"
              placeholder="Enter phone number"
              value={e164Phone}
              onChange={e => setE164Phone(e.target.value)}
              className="input w-full text-center"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading || !e164Phone} className="btn-primary w-full" onClick={() => setPhoneStep('otp')}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button type="button" onClick={() => { setPhoneStep('number'); setOtp(''); setError(''); }} className="flex items-center gap-1.5 text-muted text-sm hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Change number
            </button>
            <p className="text-sm text-muted font-thin">OTP sent to <span className="text-white">{e164Phone}</span></p>
            <input type="tel" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} className="input text-center text-lg tracking-[0.3em]" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={handleSendOtp} disabled={loading} className="text-xs text-muted hover:text-white transition-colors w-full text-center font-thin">Resend OTP</button>
          </form>
        )
      )}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-muted text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

        <p className="text-muted text-sm mt-8 text-center font-thin">
          New here? Your journey starts at{' '}
          <Link href="/onboard" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-colors">
            onboarding
          </Link>
        </p>
      </div>
    </div>
  )
}
