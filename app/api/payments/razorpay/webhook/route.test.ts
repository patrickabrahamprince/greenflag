import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const mockRpc = vi.fn();

vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test_webhook_secret');

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ rpc: mockRpc }),
}));

const { POST } = await import('./route');

function signedRequest(payload: object) {
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', 'test_webhook_secret').update(rawBody).digest('hex');
  return new Request('http://localhost/api/payments/razorpay/webhook', {
    method: 'POST',
    headers: { 'x-razorpay-signature': signature },
    body: rawBody,
  });
}

describe('POST /api/payments/razorpay/webhook', () => {
  // mockRpc's call history is shared across every test in this file;
  // without clearing it here, the "credits coins" test's recorded call
  // bleeds into the later "ignores events other than payment.captured"
  // test's `not.toHaveBeenCalled()` assertion, failing it for a reason
  // unrelated to the behavior under test (same issue already fixed this
  // way in app/api/payments/razorpay/verify/route.test.ts).
  beforeEach(() => {
    mockRpc.mockClear();
  });

  it('rejects a request with an invalid signature', async () => {
    const req = new Request('http://localhost/api/payments/razorpay/webhook', {
      method: 'POST',
      headers: { 'x-razorpay-signature': 'not-real' },
      body: JSON.stringify({ event: 'payment.captured' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('credits coins for a validly signed payment.captured event', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true, new_balance: 1550 }, error: null });

    const res = await POST(
      signedRequest({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook1',
              order_id: 'order_1',
              notes: { user_id: 'user-1', coins: '1000' },
            },
          },
        },
      })
    );

    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('credit_coins_idempotent', {
      p_user_id: 'user-1',
      p_amount: 1000,
      p_description: 'Purchased 1000 coins (Razorpay)',
      p_razorpay_payment_id: 'pay_webhook1',
    });
  });

  it('ignores events other than payment.captured', async () => {
    const res = await POST(signedRequest({ event: 'payment.failed', payload: {} }));
    expect(res.status).toBe(200);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
