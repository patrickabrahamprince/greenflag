import fs from 'fs'
import path from 'path'
import { type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEST_USERS_PATH = path.resolve(__dirname, '..', '.test-users.json')

type TestUsers = {
  TEST_MAN1_EMAIL: string
  TEST_MAN2_EMAIL: string
  TEST_WOMAN_EMAIL: string
}

export function loadTestUsers(): TestUsers {
  if (!fs.existsSync(TEST_USERS_PATH)) {
    throw new Error(
      '.test-users.json not found. Run global setup first or ensure tests are started via playwright.'
    )
  }
  return JSON.parse(fs.readFileSync(TEST_USERS_PATH, 'utf-8'))
}

export async function loginAsTestUser(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Login failed for ${email}: ${error.message}`)
  }

  return { session: data.session, user: data.user, supabase }
}

export const loginAsMan = () =>
  loginAsTestUser(loadTestUsers().TEST_MAN1_EMAIL, process.env.TEST_USER_PASSWORD!)

export const loginAsWoman = () =>
  loginAsTestUser(loadTestUsers().TEST_WOMAN_EMAIL, process.env.TEST_USER_PASSWORD!)

export async function loginAs(page: Page, userId: string) {
  const sb = createClient(supabaseUrl, supabaseServiceKey)
  const { data: user, error } = await sb.auth.admin.getUserById(userId)

  if (error || !user?.user?.email) throw new Error(`User ${userId} not found`)

  await page.goto('/login')
  await page.fill('input[type="email"]', user.user.email)
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!')
  await page.click('button:has-text("Log in")')
  await page.waitForURL(/\/discover|\/connections|\/admin/, { timeout: 10000 })
}
