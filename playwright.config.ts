import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load base .env first, then override with .env.test
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true });

// Ensure we have a dummy value for the webhook secret if it is empty to satisfy the environment validation
if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  process.env.RAZORPAY_WEBHOOK_SECRET = 'dummy_webhook_secret';
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iPhone Safari', use: { ...devices['iPhone 12'] } },
  ],
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  webServer: {
    command: 'NEXT_PUBLIC_E2E_TESTING=true PORT=3005 npm run dev',
    url: 'http://localhost:3005',
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      ...process.env,
    } as any,
  },
});
