'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Phone, Mail, ArrowLeft, Loader2 } from 'lucide-react'

type AuthMode = 'email' | 'phone'
type PhoneStep = 'number' | 'otp'

export default function SignupPage() {
  const [mode, setMode] = useState<AuthMode>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formatted = '+91' + phone
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setPhoneStep('otp')
      setLoading(false)
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formatted = '+91' + phone
      const { data, error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: 'sms' })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (name && data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, name, phone: formatted } as any)
      }
      window.location.href = '/onboard'
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />
            <h1 className="relative text-5xl font-display italic text-white mb-3" style={{ fontWeight: 500 }}>
              Set your standards.
            </h1>
          </div>
          <div className="hairline mx-auto mt-6 mb-2 w-16" />
          <p className="text-muted text-sm font-thin tracking-wide mt-4">Create your account</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-full p-1 mb-6" style={{ background: '#111111' }}>
          <button
            onClick={() => { setMode('email'); setError(''); setPhoneStep('number'); setOtp(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'email' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => { setMode('phone'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'phone' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {mode === 'email' ? (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className="input" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        ) : phoneStep === 'number' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="input" />
            <div>
              <label className="block text-xs text-muted font-thin mb-1.5 tracking-wide">Phone number</label>
              <div className="flex gap-2">
                <input type="text" value="+91" disabled className="input w-16 text-center opacity-60" />
                <input type="tel" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="input flex-1" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading || phone.length < 10} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button type="button" onClick={() => { setPhoneStep('number'); setOtp(''); setError(''); }} className="flex items-center gap-1.5 text-muted text-sm hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Change number
            </button>
            <p className="text-sm text-muted font-thin">OTP sent to <span className="text-white">+91 {phone}</span></p>
            <input type="tel" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6} className="input text-center text-lg tracking-[0.3em]" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & Create Account'}
            </button>
            <button type="button" onClick={handleSendOtp} disabled={loading} className="text-xs text-muted hover:text-white transition-colors w-full text-center font-thin">
              Resend OTP
            </button>
          </form>
        )}

        <p className="text-muted text-sm mt-8 text-center font-thin">
          Already have an account?{' '}
          <Link href="/login" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
