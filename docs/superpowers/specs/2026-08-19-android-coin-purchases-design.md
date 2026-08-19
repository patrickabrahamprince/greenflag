# Android coin purchases (Razorpay + Google Alternative Billing)

## Context

GreenFlag sells coins as a consumable in-app currency. On iOS, purchases go
through Apple StoreKit via a custom native plugin
(`ios/App/App/InAppPurchasePlugin.swift`, bridged by
`lib/native/inAppPurchase.ts`), verified server-side in
`app/api/payments/apple/verify/route.ts` and credited idempotently.

Android currently has **no purchase path at all**. `useAppleIAP.ts` and the
`/coins` page gate on `Capacitor.isNativePlatform()`, which is `true` on
Android too, so an Android user hitting "buy coins" today would hit the same
class of bug already fixed twice this session for other native features
(screenshot detection, Google sign-in scopes): a plugin call with no Android
implementation behind it.

This spec covers building a real Android purchase path, modeled directly on
what FRND (a comparable India-focused app) does in production: a
Razorpay-powered custom checkout screen, shown through Google Play's
sanctioned **Alternative / User Choice Billing** program rather than Google
Play Billing's own purchase UI.

## Why this route, not Google Play Billing

Researched during this session (see chat history for full sourcing):

- The majority of dating apps live today (Tinder, Bumble) use standard
  Google Play Billing with no alternative -- it's the safe, well-trodden
  default.
- Several India-focused apps in this same space (Shaadi.com, Jeevansathi,
  Matrimony.com, TrulyMadly, QuackQuack, Woo) were actually **delisted from
  the Play Store in March 2024** for not complying with Google's billing
  requirements, and only returned after a negotiated settlement or by
  properly complying.
- FRND's UI (confirmed from a live screenshot: custom "Add coins to wallet"
  screen, PhonePe/UPI picker, "Pay On App" button -- Razorpay Checkout's own
  standard label) is consistent with the **sanctioned** Alternative/User
  Choice Billing path, not an attempt to dodge Google entirely.

Conclusion: routing around Play Billing is only safe through Google's actual
enrollment program, never by omission. This spec assumes that enrollment
happens before any of this ships.

## Prerequisites (external, user-owned, not part of this build)

1. **Razorpay account** -- already exists, KYC-approved, live keys
   available. Test-mode keys should be used for initial development
   (`success@razorpay` as a test UPI VPA).
2. **Google Play Console: Alternative/User Choice Billing enrollment** --
   not yet done. Must be completed (and approved) before shipping this to
   production. The exact program variant GreenFlag is accepted into
   determines the precise native API surface used in "Native token flow"
   below -- see the open question there.
3. **Google Play Developer API service account** -- needed for the
   server-side transaction reporting call (parallel to how Apple's server
   library needs the root CA certs already committed under
   `certs/apple-root-ca/`). Not yet created.

## Architecture

No native "products" need pre-registering the way Apple/Google Play Billing
require product IDs -- Razorpay creates orders dynamically from a
server-supplied amount. The existing `PACKAGES` array in
`app/(guest)/coins/page.tsx` (500/1000/1500/2000/5000 coins, matching iOS
pricing exactly) stays the single source of truth; no separate
`razorpay-products.ts` table is needed.

Three new pieces:

1. **`app/api/payments/razorpay/create-order/route.ts`** -- authenticated
   endpoint. Takes a package identifier (coin amount), looks up the price
   from `PACKAGES` server-side (never trusts a client-supplied amount),
   creates a Razorpay Order via their Orders API, returns `order_id` to the
   client.
2. **Client checkout** -- Razorpay's **Checkout.js**, loaded via script tag
   directly in the WebView (no native Android SDK/plugin needed for the
   payment UI itself -- this is a Capacitor app, the WebView already runs
   standard web content). Opens with the `order_id` from step 1, prefilled
   with the user's email/phone from their Supabase profile. On success,
   returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
   to the page's JS.
3. **`app/api/payments/razorpay/verify/route.ts`** -- mirrors
   `/api/payments/apple/verify`'s shape: verifies the HMAC-SHA256 signature
   (`order_id|payment_id` signed with the Razorpay key secret, compared to
   `razorpay_signature`), looks up the coin amount from the order **this
   server created** (not from the client), credits coins idempotently keyed
   by `razorpay_payment_id` (parallel to Apple's `transactionId`
   idempotency).

### Native token flow (Google reporting requirement)

Even though Razorpay collects the actual payment, Google's Play Billing
Library still requires reporting the transaction so Google can collect its
reduced (4-percentage-point-lower) service fee:

1. A thin native Kotlin addition (small Capacitor plugin, not a full
   StoreKit-style purchase plugin) calls Play Billing Library's
   alternative-billing API to obtain an **external transaction token**
   before/alongside launching Razorpay Checkout.
2. That token is sent to the server alongside the eventual
   `razorpay_payment_id`.
3. Once payment is verified, the server calls the **Google Play Developer
   API** within 24 hours, submitting the token and transaction details.

**Open question, to confirm at Play Console enrollment time, not guessed
here:** Google documents two variants -- "alternative billing **with** user
choice" (Google shows its own system picker dialog first; only if the user
picks "pay another way" does the app show Razorpay) and "alternative billing
**without** user choice" (fully replaces Play Billing, only available in
specific Google-designated regions). Which variant applies to GreenFlag
depends on what program India enrollment actually grants -- the exact native
call signature differs between the two. This must be verified against
current Play Console docs during implementation, not assumed from this spec.

## Data flow

```
Tap "Buy" on a package
  -> create-order (server validates price against PACKAGES)
  -> [native] get external transaction token from Play Billing Library
  -> Razorpay Checkout.js opens in WebView with order_id
  -> user pays via UPI (PhonePe/GPay/etc.) or card
  -> client receives payment_id + order_id + signature
  -> POST to /api/payments/razorpay/verify
       -> signature checked
       -> coins credited (idempotent on payment_id)
       -> Google Play Developer API reporting call (token + transaction)
  -> client shows success, confetti, updates balance
```

## Error handling

- **Cancelled/failed checkout**: no server call happens, no coins credited,
  toast shown -- same UX as the existing Apple cancelled-purchase path.
- **Client succeeds but the app dies before hitting `/verify`** (network
  drop, app killed): backstopped by a **Razorpay server-to-server webhook**
  (`payment.captured` event) hitting a new endpoint that runs the same
  verify-and-credit logic. This is more robust than iOS's current approach
  (re-checking StoreKit's unfinished-transactions queue on next launch),
  since it doesn't depend on the client ever coming back.
- **Signature mismatch**: reject and log, no credit -- this is the
  tamper-detection path.
- **Missed Google 24h reporting deadline**: the reporting call happens
  synchronously at verify-time as the primary path. Vercel's Hobby plan
  limits this project to one daily cron (already consolidated in
  `app/api/cron/daily/route.ts`), so that same daily job should also sweep
  for any transactions that failed to report and retry them, rather than
  adding a second cron.
- **Double-credit prevention**: idempotent crediting keyed by
  `razorpay_payment_id`, mirroring the existing `transactionId` idempotency
  used for Apple.

## Testing

- Razorpay test-mode keys + their test UPI VPA (`success@razorpay`) for the
  full flow without moving real money, before switching to live keys.
- Manual device testing: same loop used earlier this session for the
  sign-in fixes -- build, install via `adb`, walk the purchase flow on a
  physical device, watch `logcat`.
- No existing automated test coverage exists for the Apple IAP flow to
  mirror. This would be the first automated coverage for either purchase
  path -- at minimum, unit tests for signature verification and idempotent
  crediting logic in the verify route.

## Explicitly out of scope for this spec

- Building the Google Play Billing fallback path (plain Play Billing) --
  not needed since the decision is to go straight to the FRND-style route.
- Subscriptions or any recurring payment -- coins remain a one-off
  consumable purchase, same as iOS.
- Refunds/chargebacks handling beyond what's needed for correctness
  (idempotent crediting) -- a full refund flow is a separate concern.
