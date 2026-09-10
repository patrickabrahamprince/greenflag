'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-base">
      <div className="text-center max-w-md">
        <Image src="/logo.png" alt="GreenFlag" width={112} height={112} className="w-28 h-28 mx-auto mb-6 animate-fade-in" />

        <h1 className="font-display text-3xl text-ink font-semibold mb-2">GreenFlag</h1>
        <p className="text-gold text-sm font-medium tracking-wide uppercase mb-3">Intentional Standards & Values</p>
        <p className="text-ink/60 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
          Connect with people who meet your personal standards through our guided 3-day intention protocol.
        </p>

        <div className="flex justify-center">
          <Link href="/login" className="btn-primary w-full max-w-xs h-12 flex items-center justify-center">Get Started</Link>
        </div>
      </div>
    </div>
  )
}
