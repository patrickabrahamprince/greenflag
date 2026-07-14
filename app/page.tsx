'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <img src="/logo.png" alt="GreenFlag" className="w-20 h-20 mx-auto mb-4 rounded-2xl" />
        <h1 className="font-['Playfair_Display'] text-6xl text-ink mb-4">GreenFlag</h1>
        <p className="text-ink/50 mb-8 text-lg">Set your standards. Meet your match.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary">Sign In</Link>
          <Link href="/signup" className="btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
