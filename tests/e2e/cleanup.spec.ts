import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { adminClient, createTestUserViaAdmin } from '../helpers/db'

test.beforeEach(async () => {
  await deleteMockData()

  // Always clean orphan profiles (profiles without auth users)
  // even when no mock users were found (deleteMockData skips orphans in that case)
  const { data: allProfiles } = await adminClient.from('profiles').select('id')
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const authIds = new Set(users.map(u => u.id))
  const orphanIds = (allProfiles ?? []).filter(p => !authIds.has(p.id)).map(p => p.id)
  if (orphanIds.length > 0) {
    await adminClient.from('profiles').delete().in('id', orphanIds)
  }
})

test('profile count does not exceed auth user count', async () => {
  await createTestUserViaAdmin(`test-${Date.now()}@test.com`, { persona: 'man' })

  const { data: profiles } = await adminClient.from('profiles').select('id')
  const { data: { users } } = await adminClient.auth.admin.listUsers()

  expect(profiles?.length).toBeLessThanOrEqual(users.length)
  expect(profiles?.length).toBeGreaterThan(0)
})
