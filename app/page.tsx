'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const profile = data as any
        if (profile?.is_admin) {
          router.replace('/admin')
        } else {
          router.replace('/discover')
        }
      }
    })
  }, [router, supabase])
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#D4AF37] mb-4">GreenFlag</h1>
        <p className="text-gray-400 mb-8 text-lg">Set your standards. Meet your match.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-8 py-3 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#C4A027] transition">Sign In</Link>
          <Link href="/signup" className="px-8 py-3 bg-[#1A1A1A] text-white rounded-lg font-semibold border border-[#2A2A2A] hover:border-[#D4AF37] transition">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
