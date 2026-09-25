'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-base relative overflow-hidden">
      <div className="text-center max-w-md relative z-10 animate-fade-in">
        <Image
          src="/logo.png"
          alt="GreenFlag"
          width={120}
          height={120}
          className="w-28 h-28 mx-auto mb-6"
          style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 30px rgba(16,185,129,0.25))' }}
        />

        <h1 className="font-display text-3xl text-ink font-bold mb-2">GreenFlag</h1>
        <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span>✈️</span> Meet New People for Trips
        </p>
        <p className="text-ink/80 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          The easiest way to meet new people for any trip. Road trips, weekend escapes, beach retreats, mountain treks, cafe crawls, or camping — connect with verified travelers and explore together.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Link href="/login" className="btn-primary w-full max-w-xs h-12 flex items-center justify-center font-bold">
            Get Started
          </Link>
          <Link href="/how-it-works" className="text-xs text-ink/50 hover:text-ink transition-colors py-1">
            How It Works
          </Link>
        </div>
      </div>
    </div>
  )
}
