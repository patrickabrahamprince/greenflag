'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { SignOutStrip } from './sign-out'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('is_admin, onboarding_completed').eq('id', user.id).single()
      if (profile?.is_admin) window.location.href = '/admin'
      else if (!profile?.onboarding_completed) window.location.href = '/onboard'
      else window.location.href = '/discover'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse 140% 90% at 50% -25%, rgba(192, 38, 211, 0.45) 0%, rgba(124, 58, 237, 0.22) 35%, rgba(11, 6, 20, 0) 70%), radial-gradient(ellipse 100% 70% at 100% 100%, rgba(124, 58, 237, 0.18) 0%, transparent 60%), #0B0614' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="GreenFlag" className="w-36 h-36 mx-auto mb-6" />
          <p className="font-display text-gradient text-3xl leading-tight tracking-tight" style={{ fontWeight: 700 }}>
            Set your standards.
          </p>
          <p className="text-ink/40 text-xs uppercase tracking-widest-xl mt-3">Meet your match</p>
          <div className="hairline mx-auto mt-6 mb-2 w-16" />
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input data-testid="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
          <input data-testid="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button data-testid="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-ink/40 text-xs uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

        <p className="text-ink/50 text-sm mt-8 text-center">
          New here? Your journey starts at{' '}
          <Link href="/signup" className="text-[#C026D3] underline underline-offset-4 decoration-[#C026D3]/40 hover:decoration-[#C026D3] transition-colors">
            onboarding
          </Link>
        </p>
        <SignOutStrip />
      </div>
    </div>
  )
}
