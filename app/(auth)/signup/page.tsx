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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">GreenFlag</h1>
          <p className="text-gray-400 text-sm">Set your standards. Meet your match.</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Create account</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#2A2A2A] focus:border-[#D4AF37] focus:outline-none transition" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#2A2A2A] focus:border-[#D4AF37] focus:outline-none transition" />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#2A2A2A] focus:border-[#D4AF37] focus:outline-none transition" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#C4A027] disabled:opacity-50 transition">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-gray-500 text-sm mt-6 text-center">
            Already have an account? <Link href="/login" className="text-[#D4AF37] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
