'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 rounded-lg text-red-400 text-sm transition-colors"
    >
      Sign out
    </button>
  )
}
