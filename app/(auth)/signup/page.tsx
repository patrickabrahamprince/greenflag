'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
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
      router.push('/login')
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
          <p className="text-muted text-sm font-thin tracking-wide mt-4">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="input"
            />
          </div>
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
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="input"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

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
