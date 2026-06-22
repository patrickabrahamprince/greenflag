import { test, expect, devices } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { loadTestUsers } from '../helpers/auth';

const isE2ETest = process.env.NEXT_PUBLIC_E2E_TESTING === 'true';
const password = process.env.TEST_USER_PASSWORD || 'Test1234!';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

let connectionId = '';

test.use({ ...devices['iPhone 13'] });

test.describe('iOS Chat', () => {
  test.beforeEach(async () => {
    const users = loadTestUsers();
    const admin = getAdmin();

    const { data: man } = await admin.auth.admin.listUsers();
    const manUser = man.users.find((u) => u.email === users.TEST_MAN2_EMAIL);
    const womanUser = man.users.find((u) => u.email === users.TEST_WOMAN_EMAIL);
    if (!manUser || !womanUser) throw new Error('Test users not found by email');

    const { data: standard } = await admin
      .from('standards')
      .select('id')
      .eq('user_id', womanUser.id)
      .limit(1)
      .maybeSingle();

    const { data: conn, error: connErr } = await admin
      .from('connections')
      .insert({
        guest_id: manUser.id,
        host_id: womanUser.id,
        standard_id: standard?.id ?? null,
        current_day: 5,
        chat_unlocked: true,
        connected: false,
        status: 'chat_unlocked',
        expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
      })
      .select('id')
      .single();

    if (connErr || !conn) throw new Error(connErr?.message ?? 'Failed to create connection');
    connectionId = conn.id;
  });

  test.afterEach(async () => {
    if (connectionId) {
      const admin = getAdmin();
      await admin.from('connections').delete().eq('id', connectionId);
    }
  });

  test('man can open chat, input stays on-screen, and send a message', async ({
    page,
  }) => {
    const users = loadTestUsers();

    await page.goto('/login');
    if (isE2ETest) {
      await page.fill('input[type="email"]', users.TEST_MAN2_EMAIL);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("Log in")');
    } else {
      await page.fill('input[type="tel"]', '+919876500001');
      await page.click('button:has-text("Send OTP")');
      await page.fill('input[maxlength="6"]', '123456');
      await page.click('button:has-text("Verify")');
    }

    await page.waitForURL('**/discover', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.goto(`/messages/${connectionId}`);
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[placeholder="Type a message..."]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.focus();

    const box = await input.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(780);

    await input.fill('test');
    await input.press('Enter');

    await expect(page.getByText('test').last()).toBeVisible({ timeout: 10000 });
  });
});
