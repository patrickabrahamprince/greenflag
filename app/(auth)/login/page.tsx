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
      const { data: profile } = await supabase.from('profiles').select('persona, is_admin, onboarding_completed').eq('id', user.id).single()
      if (profile?.is_admin) window.location.href = '/admin'
      else if (profile?.persona === 'woman') window.location.href = '/connections'
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #C9A961 0%, transparent 70%)' }} />
            <h1 className="relative text-5xl font-display italic text-white mb-3" style={{ fontWeight: 500 }}>
              GreenFlag
            </h1>
          </div>
          <div className="hairline mx-auto mt-6 mb-2 w-16" />
          <p className="text-muted text-sm font-thin tracking-wide mt-4">Set your standards. Meet your match.</p>
        </div>
        <h2 className="text-white text-center text-2xl font-bold mb-4">Welcome to GreenFlag</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input data-testid="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
          <input data-testid="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button data-testid="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-muted text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

        <p className="text-muted text-sm mt-8 text-center font-thin">
          New here? Your journey starts at{' '}
          <Link href="/signup" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-colors">
            onboarding
          </Link>
        </p>
        <SignOutStrip />
      </div>
    </div>
  )
}
