import { test, expect } from '@playwright/test'
import { deleteMockData } from '../helpers/cleanup'
import { adminClient, countAuthUsers, countProfiles, getUserByEmail } from '../helpers/db'

test.describe('Database Cleanup', () => {
  test.beforeAll(async () => {
    await deleteMockData()
  })

  test.describe('given mock users were previously deleted', () => {
    test('only 4 real users exist after cleanup', async () => {
      const count = await countAuthUsers()
      expect(count).toBe(4)
    })

    test('profile count does not exceed auth user count', async () => {
      const [authCount, profileCount] = await Promise.all([
        countAuthUsers(),
        countProfiles(),
      ])
      expect(profileCount).toBeLessThanOrEqual(authCount)
      expect(profileCount).toBeGreaterThan(0)
    })

    test('the 4 remaining users are the expected real accounts', async () => {
      const man = await getUserByEmail('test.man@greenflag.test')
      const woman = await getUserByEmail('test.woman@greenflag.test')
      const admin = await getUserByEmail('test.admin@greenflag.test')
      const patrick = await getUserByEmail('patrickabraham.abraham@gmail.com')

      expect(man).not.toBeNull()
      expect(woman).not.toBeNull()
      expect(admin).not.toBeNull()
      expect(patrick).not.toBeNull()
    })

    test('no @test.com or @example.com emails remain', async () => {
      const { data } = await adminClient.auth.admin.listUsers()
      for (const u of data.users) {
        if (u.email) {
          expect(u.email).not.toMatch(/@test\.com$/)
          expect(u.email).not.toMatch(/@example\.com$/)
        }
      }
    })
  })

  test.describe('FK integrity after cleanup', () => {
    test('daily_discover_views has no orphan references', async () => {
      const { data: views } = await adminClient
        .from('daily_discover_views')
        .select('man_id, woman_id')

      const referencedIds = new Set<string>()
      for (const v of views ?? []) {
        if (v.man_id) referencedIds.add(v.man_id)
        if (v.woman_id) referencedIds.add(v.woman_id)
      }

      if (referencedIds.size > 0) {
        const { data: existing } = await adminClient
          .from('profiles')
          .select('id')
          .in('id', [...referencedIds])
        const existingIds = new Set(existing?.map(p => p.id) ?? [])
        for (const id of referencedIds) {
          expect(existingIds.has(id)).toBe(true)
        }
      }
    })

    test('reports have no orphan references', async () => {
      const { data: reports } = await adminClient
        .from('reports')
        .select('reporter_id, reported_id')

      const referencedIds = new Set<string>()
      for (const r of reports ?? []) {
        if (r.reporter_id) referencedIds.add(r.reporter_id)
        if (r.reported_id) referencedIds.add(r.reported_id)
      }

      if (referencedIds.size > 0) {
        const { data: existing } = await adminClient
          .from('profiles')
          .select('id')
          .in('id', [...referencedIds])
        const existingIds = new Set(existing?.map(p => p.id) ?? [])
        for (const id of referencedIds) {
          expect(existingIds.has(id)).toBe(true)
        }
      }
    })

    test('no messages reference deleted senders', async () => {
      const { data: allMessages } = await adminClient
        .from('messages')
        .select('sender_id')

      const senderIds = [...new Set((allMessages ?? []).map(m => m.sender_id))]
      if (senderIds.length === 0) return

      const { data: existing } = await adminClient
        .from('profiles')
        .select('id')
        .in('id', senderIds)
      const existingIds = new Set(existing?.map(p => p.id) ?? [])
      for (const id of senderIds) {
        expect(existingIds.has(id)).toBe(true)
      }
    })
  })
})
