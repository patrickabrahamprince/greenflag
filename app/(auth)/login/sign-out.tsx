'use client'
import { createClient } from '@/lib/supabase/client'

export function SignOutStrip() {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-gray-500 hover:text-red-400 underline underline-offset-2 mt-4"
    >
      Sign out of existing session
    </button>
  )
}
