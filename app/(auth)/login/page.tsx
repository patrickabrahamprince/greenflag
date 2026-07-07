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
      // /connections never existed as a real route -- /my-connections is the
      // real matches-list page, works for both personas already (see
      // app/my-connections/page.tsx, app/api/matches GET). Mirroring the
      // man's flat, unconditional redirect rather than adding new
      // "has she set up a Standard yet" branching -- that would need
      // /standard/builder to exist first, which it doesn't (no page.tsx;
      // the API route that returns a redirect for it is currently orphaned,
      // unreferenced by any client -- separate, larger task, not this one).
      else if (profile?.persona === 'woman') window.location.href = '/my-connections'
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F7]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="font-['Playfair_Display'] text-5xl text-ink mb-3" style={{ fontWeight: 600 }}>
            GreenFlag
          </h1>
          <div className="hairline mx-auto mt-6 mb-2 w-16" />
          <p className="text-ink/50 text-sm tracking-wide mt-4">Set your standards. Meet your match.</p>
        </div>
        <h2 className="font-['Playfair_Display'] text-ink text-center text-2xl mb-4">Welcome to GreenFlag</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input data-testid="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input w-full" />
          <input data-testid="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input w-full" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button data-testid="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log in'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E8E6E1]" />
          <span className="text-ink/40 text-xs uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-[#E8E6E1]" />
        </div>
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

        <p className="text-ink/50 text-sm mt-8 text-center">
          New here? Your journey starts at{' '}
          <Link href="/signup" className="text-[#C9A961] underline underline-offset-4 decoration-[#C9A961]/40 hover:decoration-[#C9A961] transition-colors">
            onboarding
          </Link>
        </p>
        <SignOutStrip />
      </div>
    </div>
  )
}
