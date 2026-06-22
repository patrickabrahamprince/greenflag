import { test, expect } from '@playwright/test';

test.describe('Connection flow (mocked)', () => {
  test('should show discover page requires auth', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should show connections page requires auth', async ({ page }) => {
    await page.goto('/connections');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should show notifications page requires auth', async ({ page }) => {
    await page.goto('/notifications');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});

test.describe('API rate limiting', () => {
  test('POST to submit-task without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/connections/test-id/submit-task', {
      data: { task_number: 1, text: 'test' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST to messages without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/messages', {
      data: { connection_id: 'test', content: 'hello' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST to create-order without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/payments/create-order', {
      data: { pack_price: 99 },
    });
    expect(response.status()).toBe(401);
  });
});
