import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.com' } }, error: null }) },
  }),
}));

vi.mock('@/lib/payments/razorpay', () => ({
  createRazorpayOrder: vi.fn().mockResolvedValue({ id: 'order_test123', amount: 4900, currency: 'INR' }),
}));

const { POST } = await import('./route');

describe('POST /api/payments/razorpay/create-order', () => {
  it('rejects an unknown coin amount instead of trusting client price', async () => {
    const req = new Request('http://localhost/api/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ coins: 999999 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown/i);
  });

  it('creates an order at the server-validated price for a known package', async () => {
    const req = new Request('http://localhost/api/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ coins: 500 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orderId).toBe('order_test123');
    expect(body.amountPaise).toBe(4900);
  });
});
