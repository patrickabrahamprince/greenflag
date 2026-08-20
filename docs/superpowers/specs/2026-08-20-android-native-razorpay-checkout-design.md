# Android Native Razorpay Checkout (UPI Intent) — Design

**Status:** Approved for planning.

**Goal:** Replace the web-based Razorpay Checkout.js flow (built in `2026-08-19-android-coin-purchases`) with Razorpay's native Android Standard Checkout SDK, so Android coin purchases render as a compact bottom-sheet with installed-UPI-app detection (PhonePe, Google Pay, etc.) instead of a full-screen WebView page — matching the reference UX shown in a competitor app ("frnd").

**Context:** The web flow (Checkout.js loaded via `<script>` tag inside the Capacitor WebView) is live and functionally working end-to-end as of this spec — order creation, signature verification, and coin crediting are all confirmed working in production. The only problem is presentation: Checkout.js renders as a full-screen page inside the WebView by default, with no UPI-app detection, because it's a plain web integration rather than a native one. Razorpay's native Android SDK renders that bottom-sheet UI itself; a Capacitor bridge is needed to call into it from the app's React code.

A pre-built option (`razorpay/razorpay-capacitor`, Razorpay's own community Capacitor wrapper) was evaluated and rejected: it's only confirmed compatible up to Capacitor 4.0 (this app is on Capacitor 8.5), has an open GitHub issue about breaking on Capacitor 4 itself, installs from a git commit hash rather than a published npm version, and has very low adoption (~64 weekly downloads). For a real-money payment flow, that risk isn't worth the savings over writing a small, purpose-built plugin directly against Razorpay's native SDK.

**Important testing constraint (confirmed via Razorpay's docs):** the real UPI-intent bottom sheet with installed-app detection only renders in **Live Mode**. Test Mode shows a generic mock UPI success/failure flow instead. Verifying the actual target UX requires a small real live-mode payment, not just the test key used for earlier verification.

---

## Architecture

Order creation and payment verification are UI-agnostic and unchanged — they stay exactly as built in the prior plan:
- `POST /api/payments/razorpay/create-order` (server-validated price, creates a Razorpay Order)
- `POST /api/payments/razorpay/verify` (signature check + `credit_coins_idempotent`)
- `POST /api/payments/razorpay/webhook` (reliability backstop)

Only the payment-collection UI changes. Today, the client loads `checkout.razorpay.com/v1/checkout.js` and calls `new Razorpay(options).open()` inside the WebView. Going forward, the client instead calls a native Capacitor plugin method, which invokes Razorpay's native Android SDK's `Checkout.open(activity, options)` directly — a real native Activity, not a WebView page — and Razorpay's SDK itself renders the bottom sheet, detects installed UPI apps, and returns a payment result via callback.

## Components

**New:**
- `android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.kt` — a `@CapacitorPlugin`-annotated class exposing one `@PluginMethod`, `open(options)`. Internally builds Razorpay's `Checkout` options object from the JS-supplied `{ keyId, orderId, amountPaise, prefillEmail }`, calls `checkout.open(activity, options)`, and implements `PaymentResultWithDataListener` to capture `onPaymentSuccess(razorpayPaymentId, paymentData)` / `onPaymentError(code, description, paymentData)`. Resolves/rejects the Capacitor call accordingly.
- Gradle dependency: `implementation 'com.razorpay:checkout:1.6.+'` added to `android/app/build.gradle`, plus any manifest/proguard entries Razorpay's SDK requires (documented in their Android Standard SDK integration guide).
- Plugin registered in `MainActivity.java`'s plugin list (the one existing native-integration touchpoint this app already has for e.g. push notifications).
- `lib/native/razorpayNativeCheckout.ts` — JS wrapper matching the exact interface of the current `lib/native/razorpayCheckout.ts`: `openRazorpayCheckout(options): Promise<RazorpayCheckoutResult | null>`, returning the same `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` shape (or `null` on user cancellation) so it's a drop-in swap for the existing web wrapper.

**Modified:**
- `lib/hooks/useRazorpayIAP.ts` — swaps its import from the web wrapper to the native wrapper. No other logic changes; `create-order`/`verify` calls, `purchasingCoins` state, and the return contract are all unchanged.
- `useRazorpayIAP`'s catch block — currently swallows purchase failures silently (this is what turned an actual credential bug into a long, hard-to-diagnose dead end during the web flow's rollout). Add a visible error toast/message on purchase failure so a future failure is diagnosable from the UI, not just server-side logs.

**Removed (once native flow is verified working on-device):**
- `lib/native/razorpayCheckout.ts` (the Checkout.js script-tag loader) and the `script-src`/`connect-src`/`frame-src` CSP allowances for Razorpay domains added to `next.config.js` for the web flow, since nothing will load that script anymore. One checkout path going forward, not two maintained indefinitely.

## Data Flow

1. User taps "Buy" on a coin package.
2. `useRazorpayIAP.purchase(coins)` calls `POST /api/payments/razorpay/create-order` (unchanged) → gets `{ orderId, amountPaise, keyId }`.
3. Instead of `openRazorpayCheckout` (web), calls the new native wrapper, which calls the `RazorpayCheckoutPlugin.open()` Capacitor plugin method.
4. Native Kotlin code launches Razorpay's native Checkout activity with that order ID. Razorpay's SDK renders its own bottom-sheet UI, detects installed UPI apps, and handles the payment.
5. On success, the native SDK calls back `onPaymentSuccess` with `razorpay_payment_id` and signature data; the plugin resolves the JS promise with the same shape the web flow used to produce.
6. `useRazorpayIAP` calls `POST /api/payments/razorpay/verify` exactly as before → coins credited, balance updated.
7. On failure/cancellation, the plugin rejects/resolves `null`; the hook shows a visible error toast (new) instead of silently resetting.

## Testing Plan

Unlike the web flow (instant Vercel redeploy), every change here requires:
1. `npx cap sync android` to pull in the new native code/dependency.
2. A Gradle build (`android/gradlew assembleDebug` or via Android Studio).
3. Installing the built APK on the physical Android device.

Verification steps:
1. Build and install the debug APK with the new plugin.
2. Attempt a purchase in **Test Mode** first — confirms the plugin wiring, order creation, and verify flow all work end-to-end (expect the generic mock UPI flow, not the real bottom sheet with installed apps).
3. Switch to **Live Mode** keys and attempt one small real purchase to confirm the actual target UX (bottom sheet, installed UPI app detection) renders as expected — this is the only way to see the real experience, per Razorpay's own Test/Live Mode split for UPI Intent.
4. Confirm a `coin_transactions` row appears with the correct `razorpay_payment_id`, and the balance updates in the UI.
5. Confirm a deliberately cancelled/failed payment shows the new visible error toast rather than a silent spinner reset.
6. Once confirmed, remove the web Checkout.js path and its CSP allowances, redeploy, and do one more end-to-end pass to confirm nothing regressed.

## Out of Scope

- iOS is unaffected — this is Android-only, consistent with the existing `Capacitor.getPlatform() === 'android'` gating from the prior plan.
- Google Play Alternative/User Choice Billing native reporting remains deferred (per the prior plan's "Deferred work" section) — unrelated to this checkout-UI change and still blocked on Play Console enrollment.
