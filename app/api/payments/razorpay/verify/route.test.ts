import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ rpc: mockRpc }),
}));

vi.mock('@/lib/payments/razorpay', () => ({
  verifyPaymentSignature: vi.fn((orderId: string) => orderId === 'order_valid'),
  fetchRazorpayOrder: vi.fn().mockResolvedValue({
    id: 'order_valid',
    amount: 4900,
    notes: { user_id: 'user-1', coins: '500' },
  }),
}));

const { POST } = await import('./route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/payments/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/payments/razorpay/verify', () => {
  // mockRpc is a module-level vi.fn() shared across all three tests in this
  // file; without clearing its call history here, the "credits coins" test's
  // recorded call bleeds into the later "rejects when order belongs to a
  // different user" test's `not.toHaveBeenCalled()` assertion, failing it
  // for a reason unrelated to the behavior under test.
  beforeEach(() => {
    mockRpc.mockClear();
  });

  it('rejects an invalid signature without crediting coins', async () => {
    const res = await POST(
      makeRequest({ razorpay_order_id: 'order_tampered', razorpay_payment_id: 'pay_1', razorpay_signature: 'bad' })
    );
    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('credits coins for a validly signed payment matching the authenticated user', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true, new_balance: 550 }, error: null });

    const res = await POST(
      makeRequest({ razorpay_order_id: 'order_valid', razorpay_payment_id: 'pay_1', razorpay_signature: 'good' })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.new_balance).toBe(550);
    expect(mockRpc).toHaveBeenCalledWith('credit_coins_idempotent', {
      p_user_id: 'user-1',
      p_amount: 500,
      p_description: 'Purchased 500 coins (Razorpay)',
      p_razorpay_payment_id: 'pay_1',
    });
  });

  it('rejects when the order belongs to a different user than the authenticated caller', async () => {
    const { fetchRazorpayOrder } = await import('@/lib/payments/razorpay');
    vi.mocked(fetchRazorpayOrder).mockResolvedValueOnce({
      id: 'order_valid',
      amount: 4900,
      notes: { user_id: 'someone-else', coins: '500' },
    });

    const res = await POST(
      makeRequest({ razorpay_order_id: 'order_valid', razorpay_payment_id: 'pay_1', razorpay_signature: 'good' })
    );
    expect(res.status).toBe(403);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
