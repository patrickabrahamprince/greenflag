'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Camera } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-base">
      <div className="text-center max-w-md">
        <Image src="/logo.png" alt="GreenFlag" width={112} height={112} className="w-28 h-28 mx-auto mb-6 animate-fade-in" />

        {/* Animation showcase */}
        <div className="mb-12 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-ink/60 uppercase tracking-wide">Mobbin-Inspired Animations</p>

            {/* Icon Spin + Scale Pulse */}
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-icon-scale-pulse shadow-[0_0_30px_-8px_rgba(210,4,45,0.6)]">
              <Sparkles className="w-7 h-7 text-gold animate-icon-spin" />
            </div>

            {/* Icon Glow Pulse */}
            <div className="flex justify-center animate-float-up">
              <div className="w-12 h-12 rounded-2xl bg-crimson/20 flex items-center justify-center animate-icon-glow-pulse">
                <Camera size={28} className="text-crimson" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
