
import { test, expect } from '@playwright/test';

const isE2ETest = process.env.NEXT_PUBLIC_E2E_TESTING === 'true';

test.describe('Man Day 2 unlock flow', () => {
  test('man spends coin and unlocks day 2 profile via realtime', async ({ page }) => {
    // 1. Login as man@test.com using email/password when in E2E mode
    await page.goto('/login');
    if (isE2ETest) {
      await page.fill('input[type="email"]', 'man@test.com');
      await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!');
      await page.click('button:has-text("Log in")');
    } else {
      // Fallback OTP flow (not expected in this test)
      await page.fill('input[type="tel"]', '+919876500001');
      await page.click('button:has-text("Send OTP")');
      await page.fill('input[maxlength="6"]', '123456');
      await page.click('button:has-text("Verify")');
    }

    // Ensure we are on the discover page after login
    await page.waitForURL('**/discover', { timeout: 15000 });
    await expect(page).toHaveURL('/discover');

    // 2. Verify CoinBadge visible on discover page
    const coinBadge = page.locator('button:has(.text-gold)').first();
    await expect(coinBadge).toBeVisible({ timeout: 10000 });

    // 3. Click 'Meet Her Standard' on the first profile card (spends 100 coins server-side)
    const meetButton = page.locator('button:has-text("Meet Her Standard")').first();
    await expect(meetButton).toBeVisible({ timeout: 10000 });
    await meetButton.click();

    // 4. Expect redirect to intentions page (Day 1 of connection)
    await page.waitForURL(/\/intentions\/.*\/1$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/intentions\/.*\/1$/);
  });
});
