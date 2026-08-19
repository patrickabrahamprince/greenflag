import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

vi.stubEnv('RAZORPAY_KEY_SECRET', 'test_key_secret');
vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test_webhook_secret');

const { verifyPaymentSignature, verifyWebhookSignature } = await import('./razorpay');

describe('verifyPaymentSignature', () => {
  it('accepts a correctly signed order_id|payment_id pair', () => {
    const orderId = 'order_ABC123';
    const paymentId = 'pay_XYZ789';
    const signature = crypto
      .createHmac('sha256', 'test_key_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(verifyPaymentSignature(orderId, paymentId, signature)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    const orderId = 'order_ABC123';
    const paymentId = 'pay_XYZ789';
    const wrongSignature = crypto
      .createHmac('sha256', 'test_key_secret')
      .update(`${orderId}|different_payment_id`)
      .digest('hex');

    expect(verifyPaymentSignature(orderId, paymentId, wrongSignature)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifyPaymentSignature('order_ABC123', 'pay_XYZ789', '')).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  it('accepts a correctly signed raw body', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const signature = crypto
      .createHmac('sha256', 'test_webhook_secret')
      .update(rawBody)
      .digest('hex');

    expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it('rejects a body that does not match the signature', () => {
    const signature = crypto
      .createHmac('sha256', 'test_webhook_secret')
      .update(JSON.stringify({ event: 'payment.captured' }))
      .digest('hex');

    expect(verifyWebhookSignature(JSON.stringify({ event: 'tampered' }), signature)).toBe(false);
  });
});
