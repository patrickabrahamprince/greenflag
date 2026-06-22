import { test, expect } from '@playwright/test';

test.describe('Guest flow', () => {
  test('should show landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=GreenFlag')).toBeVisible();
  });

  test('should navigate to signup', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Welcome to GreenFlag')).toBeVisible();
  });

  test('should show email and phone toggle on login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Phone')).toBeVisible();
  });

  test('should show email and phone toggle on signup', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Phone')).toBeVisible();
  });
});

test.describe('Onboarding', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/onboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});

test.describe('Admin', () => {
  test('should redirect non-admin away from admin page', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});
