import type { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const PROJECT_REF = extractProjectRef(SUPABASE_URL)

function extractProjectRef(url: string): string {
  const match = url.match(/https:\/\/([^.]+)/)
  if (!match) throw new Error(`Cannot extract project ref from URL: ${url}`)
  return match[1]
}

const AUTH_COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`

/**
 * Log in via the browser UI (email/password form) and persist the resulting
 * auth cookies to a storage state file.
 *
 * Usage:
 *   const storageState = await loginAndGetStorageState(page, email, password)
 *   test.use({ storageState })
 */
export async function loginAndGetStorageState(
  page: Page,
  email: string,
  password: string,
  options?: { expectedUrl?: RegExp }
): Promise<string> {
  const statePath = `.auth/${email.replace(/[^a-z0-9]/gi, '_')}.json`

  await page.goto('/login')
  await page.waitForSelector('[data-testid="email"]', { timeout: 10000 })
  await page.fill('[data-testid="email"]', email)
  await page.fill('[data-testid="password"]', password)
  await page.click('[data-testid="login-btn"]')

  const expected = options?.expectedUrl ?? /\/discover|\/admin/
  await page.waitForURL(expected, { timeout: 15000 })

  await page.context().storageState({ path: statePath })
  return statePath
}

/**
 * Set Supabase auth cookies in the browser context after a server-side login.
 * This allows tests to be authenticated without visiting the login page.
 *
 * Usage:
 *   await loginWithCookies(page, email, password)
 *   await page.goto('/discover') // already authenticated
 */
export async function loginWithCookies(page: Page, email: string, password: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    throw new Error(`loginWithCookies failed for ${email}: ${error?.message}`)
  }

  const session = data.session
  const cookieValue = encodeURIComponent(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    token_type: session.token_type ?? 'bearer',
    user: session.user,
  }))

  await page.context().addCookies([
    {
      name: AUTH_COOKIE_NAME,
      value: cookieValue,
      domain: new URL(SUPABASE_URL).hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
  ])

  // Supabase SSR also expects the cookie set on the app domain (localhost:3000)
  await page.context().addCookies([
    {
      name: AUTH_COOKIE_NAME,
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
  ])
}

/**
 * Pre-generated storage states for the 4 known test accounts.
 * These are created by loginAndGetStorageState and cached.
 * The first call generates them; subsequent calls reuse the cached file.
 */
export const TEST_ACCOUNTS = {
  man: { email: 'test.man@greenflag.test', password: 'Test1234!' },
  woman: { email: 'test.woman@greenflag.test', password: 'Test1234!' },
  admin: { email: 'test.admin@greenflag.test', password: 'Test1234!' },
  patrick: { email: 'patrickabraham.abraham@gmail.com', password: '' },
} as const
