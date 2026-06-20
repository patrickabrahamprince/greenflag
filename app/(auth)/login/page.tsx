'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
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
          <p className="text-muted text-sm font-thin tracking-wide mt-4">Welcome to GreenFlag</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted text-sm mt-8 text-center font-thin">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
