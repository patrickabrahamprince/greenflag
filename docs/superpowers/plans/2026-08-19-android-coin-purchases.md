# Android Coin Purchases (Razorpay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Android users buy coins through a Razorpay-powered checkout, mirroring the existing iOS StoreKit purchase flow's shape (create → pay → verify → credit) while reusing this app's already-existing Razorpay backend plumbing.

**Architecture:** A Next.js API route creates a Razorpay Order (server-validated price, notes carry the coin amount), the client opens Razorpay's Checkout.js directly inside the WebView (no native Android SDK needed for the payment UI itself), a second API route verifies the returned signature and credits coins via the database's existing idempotent RPC, and a webhook route acts as a reliability backstop for the case where the client never gets to call verify.

**Tech Stack:** Next.js API routes, Razorpay REST API (via `fetch`, no new npm dependency), Razorpay Checkout.js (loaded client-side via script tag), existing Supabase `credit_coins_idempotent` RPC, Vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-08-19-android-coin-purchases-design.md`

## Global Constraints

- Coin packages and pricing must exactly match the existing `PACKAGES` array in `app/(guest)/coins/page.tsx` (500/1000/1500/2000/5000 coins) -- do not introduce a second pricing source.
- Price/coin amount for a purchase must always be resolved server-side from the package identifier, never trusted from client input, at both order-creation and verify time.
- Coin crediting must be idempotent, keyed on `razorpay_payment_id`, using the existing `credit_coins_idempotent` RPC (`supabase/migrations/20270107000000_backlog_audit_fixes.sql`) -- do not create a new RPC or a new database migration.
- Razorpay credentials already exist in Vercel production: `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY`, `RAZORPAY_WEBHOOK_SECRET`. Do not generate or request new ones.
- This purchase path is Android-only for now. Gate all new UI/hook logic on `Capacitor.getPlatform() === 'android'`, matching the platform-specific-gate pattern already fixed multiple times this session (`Capacitor.isNativePlatform()` is `true` on both iOS and Android and must not be used for iOS-only or Android-only logic).
- The native Google Play Alternative/User Choice Billing reporting requirement is explicitly **out of scope for this plan** -- see "Deferred work" at the end. Google Play Console enrollment for that program has not been completed yet, and which API variant applies can't be determined until it is.

---

### Task 1: Razorpay server helpers (signature verification + order helpers)

**Files:**
- Create: `lib/payments/razorpay.ts`
- Test: `lib/payments/razorpay.test.ts`

**Interfaces:**
- Produces:
  - `verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean`
  - `verifyWebhookSignature(rawBody: string, signature: string): boolean`
  - `createRazorpayOrder(amountPaise: number, notes: Record<string, string>): Promise<{ id: string; amount: number; currency: string }>`
  - `fetchRazorpayOrder(orderId: string): Promise<{ id: string; amount: number; notes: Record<string, string> }>`

- [ ] **Step 1: Write the failing tests for signature verification**

```typescript
// lib/payments/razorpay.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/payments/razorpay.test.ts`
Expected: FAIL with "Cannot find module './razorpay'" (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```typescript
// lib/payments/razorpay.ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/payments/razorpay.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/payments/razorpay.ts lib/payments/razorpay.test.ts
git commit -m "feat(payments): add Razorpay signature verification and order helpers"
```

---

### Task 2: Create-order API route

**Files:**
- Create: `app/api/payments/razorpay/create-order/route.ts`
- Modify: `lib/iap-products.ts` (add a shared coin-package table both this route and the coins page can import, replacing the page-local `PACKAGES` array's role as the sole source of truth for price/coins pairs)

**Interfaces:**
- Consumes: `createRazorpayOrder` from Task 1 (`lib/payments/razorpay.ts`)
- Produces: `POST /api/payments/razorpay/create-order` accepting `{ coins: number }`, returning `{ orderId: string; amountPaise: number; keyId: string }` on success or `{ error: string }` with a 4xx/5xx status on failure.

- [ ] **Step 1: Add the shared coin-package table**

`app/(guest)/coins/page.tsx` currently hardcodes `PACKAGES` locally (coins/price/appleProductId). Extract just the coins->price mapping into `lib/iap-products.ts` so the server route can validate against the same numbers without importing a client component:

```typescript
// lib/iap-products.ts -- add below the existing APPLE_COIN_PRODUCTS export
// Single source of truth for coins -> INR price, shared between the coins
// page (app/(guest)/coins/page.tsx) and the Razorpay create-order route.
// Must stay in sync with the PACKAGES array in that page -- a mismatch
// here means Razorpay charges one amount while the page displays another.
export const COIN_PACKAGE_PRICES: Record<number, number> = {
  500: 49,
  1000: 89,
  1500: 129,
  2000: 169,
  5000: 399,
};
```

- [ ] **Step 2: Write the failing test for price validation**

```typescript
// app/api/payments/razorpay/create-order/route.test.ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run app/api/payments/razorpay/create-order/route.test.ts`
Expected: FAIL with "Cannot find module './route'" (file doesn't exist yet)

- [ ] **Step 4: Write the implementation**

```typescript
// app/api/payments/razorpay/create-order/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { COIN_PACKAGE_PRICES } from '@/lib/iap-products';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coins } = await req.json();
    const priceInr = COIN_PACKAGE_PRICES[coins];
    if (!priceInr) {
      return NextResponse.json({ error: `Unknown coin package: ${coins}` }, { status: 400 });
    }

    const order = await createRazorpayOrder(priceInr * 100, {
      user_id: user.id,
      coins: String(coins),
    });

    return NextResponse.json({
      orderId: order.id,
      amountPaise: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay create-order error:', error);
    return NextResponse.json({ error: 'Could not start purchase' }, { status: 500 });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run app/api/payments/razorpay/create-order/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/iap-products.ts app/api/payments/razorpay/create-order/
git commit -m "feat(payments): add Razorpay order-creation route with server-side price validation"
```

---

### Task 3: Verify API route (credits coins)

**Files:**
- Create: `app/api/payments/razorpay/verify/route.ts`

**Interfaces:**
- Consumes: `verifyPaymentSignature`, `fetchRazorpayOrder` from Task 1
- Produces: `POST /api/payments/razorpay/verify` accepting `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`, returning `{ success: true, new_balance: number }` on success or `{ error: string }` on failure. This is what `useRazorpayIAP` (Task 6) calls after Checkout.js resolves.

- [ ] **Step 1: Write the failing tests**

```typescript
// app/api/payments/razorpay/verify/route.test.ts
import { describe, it, expect, vi } from 'vitest';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/api/payments/razorpay/verify/route.test.ts`
Expected: FAIL with "Cannot find module './route'" (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```typescript
// app/api/payments/razorpay/verify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyPaymentSignature, fetchRazorpayOrder } from '@/lib/payments/razorpay';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const order = await fetchRazorpayOrder(razorpay_order_id);
    if (order.notes.user_id !== user.id) {
      return NextResponse.json({ error: 'Order does not belong to this user' }, { status: 403 });
    }

    const coins = Number(order.notes.coins);
    if (!coins || !Number.isFinite(coins)) {
      return NextResponse.json({ error: 'Malformed order' }, { status: 400 });
    }

    const admin = getAdmin();
    const { data: result, error: creditErr } = await admin.rpc('credit_coins_idempotent', {
      p_user_id: user.id,
      p_amount: coins,
      p_description: `Purchased ${coins} coins (Razorpay)`,
      p_razorpay_payment_id: razorpay_payment_id,
    });

    if (creditErr || !result || (result as { success: boolean }).success === false) {
      if (process.env.NODE_ENV === 'development') console.error('credit_coins_idempotent RPC error:', creditErr, result);
      return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      new_balance: (result as { new_balance: number }).new_balance,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/api/payments/razorpay/verify/route.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/api/payments/razorpay/verify/
git commit -m "feat(payments): add Razorpay verify route, crediting via existing idempotent RPC"
```

---

### Task 4: Webhook route (reliability backstop)

**Files:**
- Create: `app/api/payments/razorpay/webhook/route.ts`

**Interfaces:**
- Consumes: `verifyWebhookSignature` from Task 1, the same `credit_coins_idempotent` RPC as Task 3
- Produces: `POST /api/payments/razorpay/webhook`, called by Razorpay's servers (not the app) on a `payment.captured` event. Registered separately in the Razorpay dashboard against this URL -- not part of this plan's code changes, noted in "Manual steps" below.

- [ ] **Step 1: Write the failing tests**

```typescript
// app/api/payments/razorpay/webhook/route.test.ts
import { describe, it, expect, vi } from 'vitest';
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/api/payments/razorpay/webhook/route.test.ts`
Expected: FAIL with "Cannot find module './route'" (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```typescript
// app/api/payments/razorpay/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Backstop for the case where the client's own call to /verify never
// happens (app killed, network dropped, right after Checkout.js
// resolves) -- Razorpay calls this server-to-server independent of the
// client, so a purchase that already reached "captured" on Razorpay's
// side still gets credited even if the device never checks back in.
// credit_coins_idempotent's own unique index on razorpay_payment_id
// means this can safely double-fire against /verify for the same
// payment without double-crediting.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, skipped: payload.event });
  }

  const payment = payload.payload?.payment?.entity;
  const coins = Number(payment?.notes?.coins);
  const userId = payment?.notes?.user_id;
  const paymentId = payment?.id;

  if (!coins || !userId || !paymentId) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay webhook: malformed payment.captured payload', payload);
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const admin = getAdmin();
  const { error: creditErr } = await admin.rpc('credit_coins_idempotent', {
    p_user_id: userId,
    p_amount: coins,
    p_description: `Purchased ${coins} coins (Razorpay)`,
    p_razorpay_payment_id: paymentId,
  });

  if (creditErr) {
    if (process.env.NODE_ENV === 'development') console.error('Razorpay webhook credit error:', creditErr);
    return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/api/payments/razorpay/webhook/route.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/api/payments/razorpay/webhook/
git commit -m "feat(payments): add Razorpay webhook route as a verify-call reliability backstop"
```

---

### Task 5: Client-side Checkout.js wrapper

**Files:**
- Create: `lib/native/razorpayCheckout.ts`

**Interfaces:**
- Produces:
  - `export interface RazorpayCheckoutResult { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }`
  - `openRazorpayCheckout(options: { keyId: string; orderId: string; amountPaise: number; prefillEmail?: string }): Promise<RazorpayCheckoutResult | null>` -- resolves `null` if the user dismisses the checkout without paying.

- [ ] **Step 1: Write the implementation**

No native plugin bridge here -- Checkout.js is a script that runs directly in the WebView like any other web page, loaded on demand rather than bundled, since it's only ever needed on the one screen that sells coins.

```typescript
// lib/native/razorpayCheckout.ts

// Loaded from Razorpay's CDN, not npm -- Checkout.js is designed to run
// as a plain script tag in a web page (this WebView included), the same
// way it would in a browser. No native Android SDK/plugin is needed for
// the payment UI itself, unlike Apple's IAP which Apple's own review
// guidelines require going through StoreKit for.
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export interface RazorpayCheckoutResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

let scriptLoadPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null; // allow a retry on the next purchase attempt
      reject(new Error('Failed to load Razorpay checkout'));
    };
    document.body.appendChild(script);
  });
  return scriptLoadPromise;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amountPaise: number;
  prefillEmail?: string;
}): Promise<RazorpayCheckoutResult | null> {
  await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: options.keyId,
      order_id: options.orderId,
      amount: options.amountPaise,
      currency: 'INR',
      name: 'GreenFlag',
      prefill: options.prefillEmail ? { email: options.prefillEmail } : undefined,
      handler: (response: RazorpayCheckoutResult) => resolve(response),
      modal: {
        // User closed the checkout without completing payment -- not an
        // error, just "they cancelled," matching how a dismissed Apple
        // IAP sheet resolves to undefined rather than throwing.
        ondismiss: () => resolve(null),
      },
    });
    try {
      razorpay.open();
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Failed to open Razorpay checkout'));
    }
  });
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `lib/native/razorpayCheckout.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/native/razorpayCheckout.ts
git commit -m "feat(payments): add Razorpay Checkout.js wrapper for the WebView"
```

---

### Task 6: `useRazorpayIAP` purchase hook

**Files:**
- Create: `lib/hooks/useRazorpayIAP.ts`

**Interfaces:**
- Consumes: `openRazorpayCheckout` from Task 5; `POST /api/payments/razorpay/create-order` and `POST /api/payments/razorpay/verify` from Tasks 2/3
- Produces: `useRazorpayIAP(): { isAndroid: boolean; purchase: (coins: number) => Promise<number | undefined>; purchasingCoins: number | null }` -- `purchase` returns the new balance on success, `undefined` on cancellation or failure (mirrors `useAppleIAP`'s existing return contract so `app/(guest)/coins/page.tsx` can treat both the same way in Task 7).

- [ ] **Step 1: Write the implementation**

```typescript
// lib/hooks/useRazorpayIAP.ts
'use client';

import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { openRazorpayCheckout } from '@/lib/native/razorpayCheckout';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

// Android-only Razorpay purchase flow -- iOS keeps using useAppleIAP
// (StoreKit). No web/desktop browser path exists yet either; Razorpay's
// checkout works there too in principle, but that's a separate decision
// with its own product/pricing-display questions, not bundled in here.
//
// Email for Checkout.js's prefill comes from Supabase auth directly
// (supabase.auth.getUser()), not the app's own useUserStore -- that
// store holds the `profiles` table row (Profile type), which has no
// email column; email lives on the Supabase auth user, not profiles.
export function useRazorpayIAP() {
  const [purchasingCoins, setPurchasingCoins] = useState<number | null>(null);
  const isAndroid = Capacitor.getPlatform() === 'android';

  const purchase = useCallback(async (coins: number): Promise<number | undefined> => {
    setPurchasingCoins(coins);
    try {
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Could not start purchase');

      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const result = await openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amountPaise: order.amountPaise,
        prefillEmail: authUser?.email,
      });
      if (!result) return undefined; // user dismissed the checkout

      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Could not verify payment');

      useCoinStore.getState().setBalance(verifyData.new_balance);
      return verifyData.new_balance;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Razorpay purchase failed:', err);
      return undefined;
    } finally {
      setPurchasingCoins(null);
    }
  }, []);

  return { isAndroid, purchase, purchasingCoins };
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `lib/hooks/useRazorpayIAP.ts` (check `useCoinStore`/`useUserStore`'s actual exported shape in `lib/store` first if this errors -- match whatever `useAppleIAP.ts` and `app/(guest)/coins/page.tsx` already import from there)

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/useRazorpayIAP.ts
git commit -m "feat(payments): add useRazorpayIAP purchase flow hook"
```

---

### Task 7: Wire Android into the coins page

**Files:**
- Modify: `app/(guest)/coins/page.tsx`

**Interfaces:**
- Consumes: `useRazorpayIAP` from Task 6

- [ ] **Step 1: Replace the Android messaging and wire the purchase flow**

Current code (`app/(guest)/coins/page.tsx:43,124-128`) gets `isNative` from `useAppleIAP()` (which uses `Capacitor.isNativePlatform()`, true on Android too) and shows "Coins can only be purchased in the GreenFlag iOS app" only when `!isNative` -- meaning that message never shows on Android, and the Apple-only buy buttons render as if they'll work. Replace with explicit per-platform handling:

```typescript
// Add to the imports in app/(guest)/coins/page.tsx
import { useRazorpayIAP } from '@/lib/hooks/useRazorpayIAP'
```

```typescript
// Replace this line:
const { isNative, purchase: handleApplePurchase, purchasingProductId } = useAppleIAP();

// With:
const { isNative, purchase: handleApplePurchase, purchasingProductId } = useAppleIAP();
const { isAndroid, purchase: handleRazorpayPurchase, purchasingCoins } = useRazorpayIAP();
```

```typescript
// Replace this block:
{!isNative && (
  <p className="mb-3 text-xs text-muted text-center">
    Coins can only be purchased in the GreenFlag iOS app.
  </p>
)}

// With:
{!isNative && !isAndroid && (
  <p className="mb-3 text-xs text-muted text-center">
    Coins can only be purchased in the GreenFlag app.
  </p>
)}
```

```typescript
// Replace the PACKAGES.map block's onBuy handler to branch by platform:
{PACKAGES.map((pkg) => (
  <PackageCard
    key={pkg.appleProductId}
    pkg={pkg}
    displayPrice={appleProducts[pkg.appleProductId]?.displayPrice}
    purchasing={isAndroid ? purchasingCoins !== null : (!isNative || purchasingProductId !== null)}
    isPurchasingThis={isAndroid ? purchasingCoins === pkg.coins : purchasingProductId === pkg.appleProductId}
    onBuy={async () => {
      const newBalance = isAndroid
        ? await handleRazorpayPurchase(pkg.coins)
        : await handleApplePurchase(pkg.appleProductId);
      if (newBalance !== undefined) {
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.3 }, colors: ['#D2042D', '#45050C', '#fff'] });
      }
    }}
  />
))}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `app/(guest)/coins/page.tsx`

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`
Expected: build completes without errors

- [ ] **Step 4: Commit**

```bash
git add "app/(guest)/coins/page.tsx"
git commit -m "feat(payments): wire Razorpay purchase flow into the coins page for Android"
```

---

### Task 8: Deploy and verify on device

**Files:** none (deployment + manual verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the new ones from Tasks 1, 3, and 4

- [ ] **Step 2: Push to `main` and deploy**

```bash
git push origin main
```

Wait for the Vercel production deployment to reach `Ready` (`vercel ls` shows Production status) before testing on device -- this app loads its JS live from the deployed URL, not from local code.

- [ ] **Step 3: Set Razorpay's webhook URL (manual, one-time, in the Razorpay dashboard)**

In the Razorpay dashboard (Settings -> Webhooks), point a webhook at `https://greenflag-dusky.vercel.app/api/payments/razorpay/webhook`, subscribed to the `payment.captured` event, using the same secret already stored in `RAZORPAY_WEBHOOK_SECRET`. This is a dashboard action, not a code change -- do it once, not per deploy.

- [ ] **Step 4: Test with Razorpay test-mode keys first**

Temporarily set `NEXT_PUBLIC_RAZORPAY_KEY` / `RAZORPAY_KEY_SECRET` in Vercel to Razorpay's test-mode values (from the Razorpay dashboard, Test Mode toggle), redeploy, and run through a full purchase on the Android device using Razorpay's test UPI VPA `success@razorpay`. Confirm: order creation succeeds, checkout opens, payment completes, coin balance updates, and a row appears in `coin_transactions` with the `razorpay_payment_id` set.

- [ ] **Step 5: Switch back to live keys**

Once test mode is confirmed working end-to-end, set `NEXT_PUBLIC_RAZORPAY_KEY` / `RAZORPAY_KEY_SECRET` back to the live values and redeploy.

---

## Deferred work (explicitly out of scope for this plan)

**Google Play Alternative/User Choice Billing native reporting.** Per the spec, Google's Play Billing Library requires a native call to obtain an external transaction token and a server-side call to Google's Play Developer API within 24 hours to report the transaction, so Google can collect its reduced service fee. This can't be implemented correctly yet because:

- Google Play Console enrollment for this program has not been completed (confirmed earlier this session).
- Which of the two API variants applies ("with user choice" vs "without user choice") depends on what the enrollment actually grants, and guessing wrong means writing native code against the wrong API.

Once enrollment completes, this becomes its own follow-up plan: a small native Kotlin addition (Capacitor plugin) to obtain the token, plus a server-side reporting call (needs a Google Play Developer API service account, not yet created either). The Razorpay checkout flow this plan builds works correctly without it -- Android users can already buy coins -- but until the reporting piece exists, GreenFlag isn't yet fully compliant with Google's Alternative Billing program terms. Do not treat this plan's completion as "Android payments are fully done."

## Self-review notes

- **Spec coverage:** create-order route (Task 2), verify route (Task 3), webhook backstop (Task 4), client Checkout.js (Task 5), purchase hook (Task 6), coins page wiring (Task 7) all map directly to the spec's "Architecture" and "Data flow" sections. The spec's "Native token flow" section is deliberately deferred (see above) rather than guessed at.
- **Reused vs. new:** confirmed during planning that `credit_coins_idempotent` (idempotent on `razorpay_payment_id`, already has a real unique index) and all three Razorpay env vars already exist in production from a previous (removed) integration -- this plan reuses them rather than creating new ones, which is a deliberate deviation from the spec's original assumption of building everything from scratch. No new database migration is part of this plan.
- **Type consistency:** `useRazorpayIAP.purchase()` returns `Promise<number | undefined>`, matching `useAppleIAP`'s existing `purchase` contract exactly, so Task 7's coins-page wiring can treat both branches identically (`newBalance !== undefined` triggers confetti either way). Caught and fixed one real mismatch during review: `Profile` (the type behind `useUserStore`) has no `email` field -- email lives on the Supabase auth user, not the `profiles` table row -- so Task 6 fetches it via `supabase.auth.getUser()` instead.
