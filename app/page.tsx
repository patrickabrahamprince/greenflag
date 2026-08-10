'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-base">
      <div className="text-center max-w-md">
        <img src="/logo.png" alt="GreenFlag" className="w-28 h-28 mx-auto mb-10" />
        <div className="flex justify-center">
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
