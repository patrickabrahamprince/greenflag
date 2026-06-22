import { test, expect } from '@playwright/test';
import { loadTestUsers } from '../helpers/auth';

const isE2ETest = process.env.NEXT_PUBLIC_E2E_TESTING === 'true';

test.describe('Man Day 2 unlock flow', () => {
  test('man spends coin and unlocks day 2 profile via realtime', async ({ page }) => {
    const users = loadTestUsers();
    const isMobile = test.info().project.name === 'iPhone Safari';
    const testEmail = isMobile ? users.TEST_MAN2_EMAIL : users.TEST_MAN1_EMAIL;

    await page.goto('/login');
    if (isE2ETest) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'Test1234!');
      await page.click('button:has-text("Log in")');
    } else {
      await page.fill('input[type="tel"]', '+919876500001');
      await page.click('button:has-text("Send OTP")');
      await page.fill('input[maxlength="6"]', '123456');
      await page.click('button:has-text("Verify")');
    }

    await page.waitForURL('**/discover', { timeout: 15000 });
    await expect(page).toHaveURL('/discover');

    const coinBadge = page.locator('button:has(.text-gold)').first();
    await expect(coinBadge).toBeVisible({ timeout: 10000 });

    const meetButton = page.locator('button:has-text("Meet Her Standard")').first();
    await expect(meetButton).toBeVisible({ timeout: 10000 });
    await meetButton.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const meetBtn = buttons.find(b => b.textContent?.includes('Meet Her Standard'));
      if (meetBtn) meetBtn.click();
    });

    await page.waitForURL(/\/intentions\/.*\/1$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/intentions\/.*\/1$/);
  });
});
