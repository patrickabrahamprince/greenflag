'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SignOutStrip() {
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex items-center justify-center gap-1.5 mx-auto text-xs text-gray-500 hover:text-red-400 underline underline-offset-2 mt-4 disabled:opacity-50"
    >
      {signingOut && <Loader2 className="w-3 h-3 animate-spin" />}
      Sign Out
    </button>
  )
}
