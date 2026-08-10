import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT_DIR = '/tmp/dateasy-screenshots';
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto('http://localhost:3000/login');
await page.getByText('Having trouble?').click();
await page.waitForSelector('[data-testid="email"]', { timeout: 15000 });
await page.fill('[data-testid="email"]', 'test-man@local.dev');
await page.fill('[data-testid="password"]', 'testpass123');
await page.click('[data-testid="login-btn"]');
await page.getByText('Accept Terms').click({ timeout: 10000 });
await page.waitForURL(/\/discover|\/admin/, { timeout: 20000 });

const screens = [
  { path: '/discover', name: 'discover' },
  { path: '/messages', name: 'chat-list' },
  { path: '/profile', name: 'profile' },
  { path: '/onboard/interests', name: 'interests' },
];

for (const { path, name } of screens) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/${name}.png` });
  console.log(`Captured ${name}`);
}

await browser.close();
console.log('Done. Screenshots in ' + OUT_DIR);
