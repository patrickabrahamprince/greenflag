import crypto from 'crypto';

// Razorpay's own timing-safe recommendation: recompute the HMAC and
// compare with crypto.timingSafeEqual rather than ===, so a signature
// check can't leak timing information about how many leading bytes
// matched.
function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

// Verifies the razorpay_signature Checkout.js hands back to the client
// on a successful payment: HMAC-SHA256 of "order_id|payment_id" signed
// with the account's key secret.
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET is not set');
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  try {
    return timingSafeHexEqual(expected, signature);
  } catch {
    // timingSafeEqual throws if lengths differ after hex decode (e.g. a
    // malformed signature) -- that's just "not valid", not a crash.
    return false;
  }
}

// Verifies a Razorpay webhook's X-Razorpay-Signature header: HMAC-SHA256
// of the *raw* request body (must be the exact bytes Razorpay sent,
// before any JSON.parse) signed with the webhook secret configured in
// the Razorpay dashboard.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not set');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeHexEqual(expected, signature);
  } catch {
    return false;
  }
}

function getAuthHeader(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay credentials are not set');
  console.error('Razorpay credential shape check:', {
    keyId,
    keyIdTrimmedMatches: keyId === keyId.trim(),
    keySecretLength: keySecret.length,
    keySecretTrimmedLength: keySecret.trim().length,
    keySecretHasWhitespace: keySecret !== keySecret.trim(),
  });
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
}

// amountPaise: Razorpay's Orders API takes the amount in the smallest
// currency unit (paise for INR, i.e. price in rupees * 100).
export async function createRazorpayOrder(
  amountPaise: number,
  notes: Record<string, string>
): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', notes }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${body}`);
  }
  return res.json();
}

// Fetches an order back from Razorpay so its `notes` (set at creation
// time, in createRazorpayOrder above) can be read server-side as the
// authoritative source of "how many coins does this order correspond
// to" -- never trust a coin amount the client sends back at verify time.
export async function fetchRazorpayOrder(
  orderId: string
): Promise<{ id: string; amount: number; notes: Record<string, string> }> {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order fetch failed (${res.status}): ${body}`);
  }
  return res.json();
}
