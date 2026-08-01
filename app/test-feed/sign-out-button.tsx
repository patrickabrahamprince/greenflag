'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 rounded-lg text-red-400 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {signingOut && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      Sign out
    </button>
  )
}
