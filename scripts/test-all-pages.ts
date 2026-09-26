import { chromium } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const PUBLIC_PAGES = [
  '/login',
  '/terms',
  '/privacy',
  '/support',
  '/how-it-works',
  '/delete-account',
  '/landing',
  '/admin/login',
];

const ONBOARD_PAGES = [
  '/onboard',
  '/onboard/how-it-works',
  '/onboard/name',
  '/onboard/phone',
  '/onboard/rules',
  '/onboard/quiz',
  '/onboard/interests',
  '/onboard/profile',
  '/onboard/profile/photos',
  '/onboard/profile/bio',
  '/onboard/profile/location',
  '/onboard/profile/instagram',
  '/onboard/profile/teasers',
  '/onboard/pending',
  '/onboard/rejected',
];

const APP_PAGES = [
  '/trips',
  '/discover',
  '/messages',
  '/my-connections',
  '/profile',
  '/profile/edit',
  '/profile/edit/details',
  '/coins',
  '/notifications',
  '/settings',
  '/settings/notifications',
  '/standard/builder',
];

async function main() {
  console.log(`🚀 Starting Page & Health Test against: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12/13/14 / Modern mobile viewport
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();

  const results: { path: string; status: number; errors: string[]; warnings: string[]; title: string }[] = [];

  const attachListeners = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });
    return { errors, warnings };
  };

  // 1. Test Public Pages
  console.log('\n--- Testing Public Pages ---');
  for (const path of PUBLIC_PAGES) {
    const { errors, warnings } = attachListeners();
    try {
      const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const title = await page.title();
      const status = response?.status() || 0;
      results.push({ path, status, errors: [...errors], warnings: [...warnings], title });
      console.log(`  [${status}] ${path} - Title: "${title}" - Errors: ${errors.length}`);
      if (errors.length > 0) {
        console.log(`     Errors:`, errors);
      }
    } catch (e: any) {
      console.log(`  [FAIL] ${path}: ${e.message}`);
      results.push({ path, status: 0, errors: [e.message], warnings: [], title: 'FAILED' });
    }
  }

  // 2. Perform Login with demo-reviewer
  console.log('\n--- Logging in with demo-reviewer@greenflag.com ---');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click "Continue with Email" or "Having trouble?"
    const emailBtn = page.locator('button:has-text("Continue with Email")');
    if (await emailBtn.isVisible()) {
      await emailBtn.click();
    } else {
      const troubleBtn = page.locator('button:has-text("Having trouble?")');
      if (await troubleBtn.isVisible()) await troubleBtn.click();
    }

    await page.fill('input[type="email"]', 'demo-reviewer@greenflag.com');
    await page.fill('input[type="password"]', 'GreenFlag2026!');
    await page.click('button[type="submit"]');

    // Wait for redirect to /trips or terms modal
    await page.waitForTimeout(3000);
    const acceptTermsBtn = page.locator('button:has-text("I Agree"), button:has-text("Accept")');
    if (await acceptTermsBtn.isVisible()) {
      await acceptTermsBtn.click();
      await page.waitForTimeout(2000);
    }
    console.log(`  Current URL after login: ${page.url()}`);
  } catch (e: any) {
    console.log(`  Login failed: ${e.message}`);
  }

  // 3. Test App Pages
  console.log('\n--- Testing Authenticated App Pages ---');
  for (const path of APP_PAGES) {
    const { errors, warnings } = attachListeners();
    try {
      const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      const title = await page.title();
      const status = response?.status() || 0;
      const currentUrl = page.url();
      results.push({ path, status, errors: [...errors], warnings: [...warnings], title: `${title} (${currentUrl})` });
      console.log(`  [${status}] ${path} -> ${currentUrl} - Errors: ${errors.length}`);
      if (errors.length > 0) {
        console.log(`     Errors:`, errors);
      }
    } catch (e: any) {
      console.log(`  [FAIL] ${path}: ${e.message}`);
      results.push({ path, status: 0, errors: [e.message], warnings: [], title: 'FAILED' });
    }
  }

  // 4. Test Onboarding Pages
  console.log('\n--- Testing Onboarding Pages ---');
  for (const path of ONBOARD_PAGES) {
    const { errors, warnings } = attachListeners();
    try {
      const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      const title = await page.title();
      const status = response?.status() || 0;
      const currentUrl = page.url();
      results.push({ path, status, errors: [...errors], warnings: [...warnings], title: `${title} (${currentUrl})` });
      console.log(`  [${status}] ${path} -> ${currentUrl} - Errors: ${errors.length}`);
      if (errors.length > 0) {
        console.log(`     Errors:`, errors);
      }
    } catch (e: any) {
      console.log(`  [FAIL] ${path}: ${e.message}`);
      results.push({ path, status: 0, errors: [e.message], warnings: [], title: 'FAILED' });
    }
  }

  await browser.close();
  console.log('\n✅ Page testing complete!');
}

main().catch(console.error);
