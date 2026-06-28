// 1. Run: npx tsx scripts/seed-test-users.ts
// 2. Login at /login with test-man@local.dev / testpass123
// 3. Visit /test-feed — should only see Test Woman
// 4. Logout, login with test-woman@local.dev / testpass123
// 5. Visit /test-feed — should only see Test Man

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOppositeGenderProfiles } from '@/lib/profiles'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

export default async function TestFeedPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: current } = await supabase
    .from('profiles')
    .select('name, persona')
    .eq('id', user.id)
    .single()

  const { profiles, error } = await getOppositeGenderProfiles()

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Opposite-Gender Feed Test</h1>

      <div className="text-sm text-gray-400 space-y-1">
        <p><strong>Logged in as:</strong> {user.email}</p>
        <p><strong>Your persona:</strong> {current?.persona ?? '(not set)'}</p>
      </div>

      <hr className="border-white/10" />

      {error && <p className="text-red-400">Error: {error}</p>}

      {!error && profiles.length === 0 && (
        <p className="text-gray-500">No opposite-gender profiles found.</p>
      )}

      {profiles.length > 0 && (
        <>
          <p className="text-sm text-gray-400">Total found: {profiles.length}</p>
          <ul className="space-y-2">
            {profiles.map((p) => (
              <li key={p.id} className="border border-white/10 rounded-lg p-3">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-400">Persona: {p.persona}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <SignOutButton />
    </div>
  )
}
