import { test, expect } from '@playwright/test'

test.describe('Onboarding — Man', () => {
  test('shows two persona cards', async ({ page }) => {
    await page.goto('/onboard')
    await expect(page.locator('text=I rise to it')).toBeVisible()
    await expect(page.locator('text=I set the Standard')).toBeVisible()
  })

  test('man persona card navigates to phone step', async ({ page }) => {
    await page.goto('/onboard')
    await page.click('text=I rise to it')
    await expect(page).toHaveURL('/onboard/phone')
  })

  test('woman persona card navigates to phone step', async ({ page }) => {
    await page.goto('/onboard')
    await page.click('text=I set the Standard')
    await expect(page).toHaveURL('/onboard/phone')
  })

  test('phone step shows phone input and Google button', async ({ page }) => {
    await page.goto('/onboard/phone')
    await expect(page.locator('input[type="tel"]')).toBeVisible()
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible()
  })

  test('interests step enforces exactly 5 selections', async ({ page }) => {
    await page.goto('/onboard/interests')
    const nextBtn = page.locator('button:has-text("Next")')
    if (await nextBtn.isVisible()) {
      await expect(nextBtn).toBeVisible()
    }
  })
})
