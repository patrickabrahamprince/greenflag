'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.08), transparent), #000000' }}>
      <div className="text-center max-w-md">
        <img src="/logo.png" alt="GreenFlag" className="w-28 h-28 mx-auto mb-10" />
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary">Sign In</Link>
          <Link href="/signup" className="btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
