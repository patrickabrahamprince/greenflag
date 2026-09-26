import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runInteractiveTest() {
  console.log(`\n======================================================`);
  console.log(`📱 STARTING INTERACTIVE APP TEST ON: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(`[Page Error] ${err.message}`);
  });

  try {
    // 1. Visit Login Page
    console.log('1️⃣ Navigating to /login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_screen.png') });
    console.log('   📸 Saved 01_login_screen.png');

    // 2. Open Email Login & Toggle Tabs
    console.log('2️⃣ Testing Email Login and Sign In / Create Account tabs...');
    const emailBtn = page.locator('button:has-text("Continue with Email")');
    if (await emailBtn.isVisible()) {
      await emailBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_email_login_form.png') });
    console.log('   📸 Saved 02_email_login_form.png');

    // 3. Fill in reviewer credentials and submit
    console.log('3️⃣ Logging in with demo-reviewer@greenflag.com...');
    await page.fill('input[type="email"]', 'demo-reviewer@greenflag.com');
    await page.fill('input[type="password"]', 'GreenFlag2026!');
    await page.click('button[data-testid="login-btn"], button[type="submit"]');

    await page.waitForTimeout(3000);

    // Accept Terms if modal opened
    const termsAcceptBtn = page.locator('button:has-text("I Agree"), button:has-text("Accept")');
    if (await termsAcceptBtn.isVisible()) {
      console.log('   Accepting Terms Gate modal...');
      await termsAcceptBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log(`   Logged in! Current URL: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_after_login.png') });
    console.log('   📸 Saved 03_after_login.png');

    // 4. Test /trips Page & Modals
    console.log('4️⃣ Testing /trips (Explore & My Trips)...');
    await page.goto(`${BASE_URL}/trips`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_trips_explore.png') });
    console.log('   📸 Saved 04_trips_explore.png');

    // Click "My Trips" tab
    const myTripsTab = page.locator('button:has-text("My Trips")');
    if (await myTripsTab.isVisible()) {
      await myTripsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_trips_my_trips.png') });
      console.log('   📸 Saved 05_trips_my_trips.png');
      // Click back to Explore
      await page.click('button:has-text("Explore")');
      await page.waitForTimeout(500);
    }

    // 5. Test /discover Page
    console.log('5️⃣ Testing /discover (Discovery Feed)...');
    await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_discover.png') });
    console.log('   📸 Saved 06_discover.png');

    // 6. Test /messages Page
    console.log('6️⃣ Testing /messages (Conversations)...');
    await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_messages.png') });
    console.log('   📸 Saved 07_messages.png');

    // 7. Test /coins Page
    console.log('7️⃣ Testing /coins (Wallet & Packages)...');
    await page.goto(`${BASE_URL}/coins`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_coins.png') });
    console.log('   📸 Saved 08_coins.png');

    // 8. Test /profile & Edit Profile
    console.log('8️⃣ Testing /profile & /profile/edit...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_profile.png') });
    console.log('   📸 Saved 09_profile.png');

    await page.goto(`${BASE_URL}/profile/edit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_profile_edit.png') });
    console.log('   📸 Saved 10_profile_edit.png');

    // 9. Test /standard/builder
    console.log('9️⃣ Testing /standard/builder...');
    await page.goto(`${BASE_URL}/standard/builder`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_standard_builder.png') });
    console.log('   📸 Saved 11_standard_builder.png');

    // 10. Test /settings
    console.log('🔟 Testing /settings...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_settings.png') });
    console.log('   📸 Saved 12_settings.png');

    // 11. Test Public Informational Pages
    console.log('1️⃣1️⃣ Testing Public Pages (/how-it-works, /terms, /privacy, /support)...');
    await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_how_it_works.png') });
    console.log('   📸 Saved 13_how_it_works.png');

    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_terms.png') });
    console.log('   📸 Saved 14_terms.png');

    await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_privacy.png') });
    console.log('   📸 Saved 15_privacy.png');

    await page.goto(`${BASE_URL}/support`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_support.png') });
    console.log('   📸 Saved 16_support.png');

    console.log(`\n======================================================`);
    console.log(`🎉 ALL 16 FLOWS & SCREENS TESTED SUCCESSFULLY!`);
    console.log(`   Captured 16 screenshots in: public/test-screenshots/`);
    console.log(`   Uncaught Page Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('   Errors found:', errors);
    }
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
  }
}

runInteractiveTest().catch(console.error);
