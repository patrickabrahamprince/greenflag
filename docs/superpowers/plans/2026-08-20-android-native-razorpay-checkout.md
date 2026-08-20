# Android Native Razorpay Checkout (UPI Intent) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the web-based Razorpay Checkout.js flow with Razorpay's native Android SDK, so Android coin purchases render as a compact bottom-sheet with installed-UPI-app detection (PhonePe, Google Pay, etc.) instead of a full-screen WebView page.

**Architecture:** A new local Capacitor plugin (`RazorpayCheckoutPlugin.java`, not published to npm) wraps Razorpay's native Android SDK's `Checkout.open(activity, options)` call. `MainActivity.java` implements Razorpay's `PaymentResultWithDataListener` directly (Razorpay's own documented pattern) and forwards results to the plugin, which resolves/rejects the pending JS call. Order creation and signature verification stay on the existing server routes, unchanged — only the payment-collection UI changes.

**Tech Stack:** Capacitor local Android plugin (Java — this project has no Kotlin infrastructure), Razorpay Android SDK (`com.razorpay:checkout:1.6.41`), existing Next.js API routes.

**Spec:** `docs/superpowers/specs/2026-08-20-android-native-razorpay-checkout-design.md`

## Global Constraints

- This is Android-only. iOS keeps using `useAppleIAP`/StoreKit, unaffected by this plan.
- Order creation (`/api/payments/razorpay/create-order`) and verification (`/api/payments/razorpay/verify`) do not change — do not modify those routes.
- The Razorpay Android SDK's own AAR manifests already declare `INTERNET`, the UPI `<queries>` block (Android 11+ package visibility for UPI app detection), `CheckoutActivity`, and `DeeplinkActivity` — verified by extracting `com.razorpay:checkout:1.6.40` and its transitive `standard-core`/`core` AARs from Maven Central and reading their `AndroidManifest.xml` directly. Do not add a manual `<queries>` block to `android/app/src/main/AndroidManifest.xml` — it would be redundant.
- `android/app/build.gradle` currently has `minifyEnabled false` for release builds — do not add ProGuard rules for Razorpay; they'd be inert and are unnecessary scope.
- Real UPI-intent bottom-sheet behavior (showing installed apps) only renders in Razorpay **Live Mode**; Test Mode shows a generic mock UPI flow. This is expected, not a bug, when verifying on-device in Task 7.
- Every native code change in this plan requires `npx cap sync android` + a Gradle build + reinstalling on the physical device to test — there is no instant redeploy loop like the web flow had.

---

### Task 1: Add Razorpay Android SDK Gradle dependency

**Files:**
- Modify: `android/variables.gradle`
- Modify: `android/app/build.gradle`

**Interfaces:**
- Produces: the `com.razorpay:checkout` SDK available to app code, providing `com.razorpay.Checkout`, `com.razorpay.PaymentData`, `com.razorpay.PaymentResultWithDataListener` (verified present in this exact dependency chain by extracting the AARs from Maven Central).

- [ ] **Step 1: Add the version variable**

In `android/variables.gradle`, add `razorpayCheckoutVersion` alongside the other centralized version variables:

```gradle
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    androidxActivityVersion = '1.11.0'
    androidxAppCompatVersion = '1.7.1'
    androidxCoordinatorLayoutVersion = '1.3.0'
    androidxCoreVersion = '1.17.0'
    androidxFragmentVersion = '1.8.9'
    coreSplashScreenVersion = '1.2.0'
    androidxWebkitVersion = '1.14.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.3.0'
    androidxEspressoCoreVersion = '3.7.0'
    cordovaAndroidVersion = '14.0.1'
    razorpayCheckoutVersion = '1.6.41'
}
```

- [ ] **Step 2: Add the dependency**

In `android/app/build.gradle`, add the dependency to the existing `dependencies` block:

```gradle
dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    implementation "com.razorpay:checkout:$razorpayCheckoutVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}
```

- [ ] **Step 3: Sync and verify the dependency resolves**

Run: `cd android && ./gradlew :app:dependencies --configuration debugRuntimeClasspath | grep razorpay`
Expected: output includes `com.razorpay:checkout:1.6.41` and its transitive `com.razorpay:standard-core` and `com.razorpay:core` dependencies, with no resolution errors.

- [ ] **Step 4: Commit**

```bash
git add android/variables.gradle android/app/build.gradle
git commit -m "build(android): add Razorpay Android SDK dependency"
```

---

### Task 2: Native Capacitor plugin wrapping Razorpay's Checkout SDK

**Files:**
- Create: `android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.java`

**Interfaces:**
- Consumes: `com.razorpay.Checkout`, `com.razorpay.PaymentData` (from Task 1's dependency)
- Produces: a Capacitor plugin registered under the name `"RazorpayCheckout"`, exposing `open(options: { keyId, orderId, amountPaise, prefillEmail? })` to JS, resolving with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` on success, `{}` (empty object) if the user cancels, or rejecting on error. Also exposes `handlePaymentSuccess(String, PaymentData)` and `handlePaymentError(int, String)` as plain Java methods for `MainActivity` (Task 3) to call.

- [ ] **Step 1: Write the plugin**

```java
// android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.java
package com.greenflagapp.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;
import org.json.JSONException;
import org.json.JSONObject;

// Wraps Razorpay's native Android Checkout SDK so purchases render as its
// own bottom-sheet UI (with installed-UPI-app detection) instead of the
// full-screen web Checkout.js page the WebView-based flow used. Order
// creation/verification stay on the existing server routes -- this plugin
// only replaces the payment-collection UI step.
//
// The pending PluginCall is held as a plain instance field rather than via
// Capacitor's saveCall()/getSavedCall() bridge API -- this matches the
// pattern already used elsewhere in this app's dependencies for an
// equivalent "launch external activity, resolve on async result" flow
// (@capgo/capacitor-social-login's AppleProvider.java), and this plugin
// only ever has one purchase in flight at a time.
@CapacitorPlugin(name = "RazorpayCheckout")
public class RazorpayCheckoutPlugin extends Plugin {

    private PluginCall pendingCall;

    @PluginMethod
    public void open(PluginCall call) {
        String keyId = call.getString("keyId");
        String orderId = call.getString("orderId");
        Integer amountPaise = call.getInt("amountPaise");
        String prefillEmail = call.getString("prefillEmail");

        if (keyId == null || orderId == null || amountPaise == null) {
            call.reject("Missing required options: keyId, orderId, amountPaise");
            return;
        }

        pendingCall = call;
        call.setKeepAlive(true);

        Checkout checkout = new Checkout();
        checkout.setKeyID(keyId);

        try {
            JSONObject options = new JSONObject();
            options.put("key", keyId);
            options.put("order_id", orderId);
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("name", "GreenFlag");
            if (prefillEmail != null) {
                JSONObject prefill = new JSONObject();
                prefill.put("email", prefillEmail);
                options.put("prefill", prefill);
            }
            checkout.open(getActivity(), options);
        } catch (JSONException e) {
            pendingCall = null;
            call.reject("Failed to build Razorpay checkout options: " + e.getMessage());
        } catch (Exception e) {
            pendingCall = null;
            call.reject("Failed to open Razorpay checkout: " + e.getMessage());
        }
    }

    public void handlePaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        PluginCall call = pendingCall;
        if (call == null) return;
        pendingCall = null;

        JSObject result = new JSObject();
        result.put("razorpay_payment_id", razorpayPaymentId);
        result.put("razorpay_order_id", paymentData != null ? paymentData.getOrderId() : null);
        result.put("razorpay_signature", paymentData != null ? paymentData.getSignature() : null);
        call.resolve(result);
    }

    public void handlePaymentError(int code, String description) {
        PluginCall call = pendingCall;
        if (call == null) return;
        pendingCall = null;

        // Razorpay's SDK uses code 2 for user-cancelled -- resolve an empty
        // result for that (matching the web flow's ondismiss -> resolve(null)
        // behavior) rather than treating cancellation as an error.
        if (code == Checkout.PAYMENT_CANCELED) {
            call.resolve(new JSObject());
        } else {
            call.reject(description != null ? description : "Payment failed");
        }
    }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd android && ./gradlew :app:compileDebugJavaWithJavac`
Expected: BUILD SUCCESSFUL, no errors referencing `RazorpayCheckoutPlugin.java`

- [ ] **Step 3: Commit**

```bash
git add android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.java
git commit -m "feat(android): add native Razorpay Checkout Capacitor plugin"
```

---

### Task 3: Wire MainActivity to Razorpay's PaymentResultWithDataListener

**Files:**
- Modify: `android/app/src/main/java/com/greenflagapp/app/MainActivity.java`

**Interfaces:**
- Consumes: `RazorpayCheckoutPlugin` (Task 2) via `getBridge().getPlugin("RazorpayCheckout").getInstance()`
- Produces: `MainActivity` registers the plugin and implements Razorpay's `PaymentResultWithDataListener`, forwarding both callbacks to the plugin instance.

This is Razorpay's own documented integration pattern (confirmed against their official `razorpay-android-sample-app` repository): the *calling Activity* implements `PaymentResultWithDataListener` directly and is passed to `checkout.open(activity, options)` (done in Task 2). Razorpay's SDK delivers `onPaymentSuccess`/`onPaymentError` to that Activity without requiring an `onActivityResult` override -- the official sample app doesn't override it either.

`registerPlugin(...)` must be called *before* `super.onCreate(...)`, because `BridgeActivity.onCreate` is what actually builds the Capacitor bridge from the registered plugin list (confirmed by reading `BridgeActivity.java` in `node_modules/@capacitor/android`).

- [ ] **Step 1: Update MainActivity**

```java
// android/app/src/main/java/com/greenflagapp/app/MainActivity.java
package com.greenflagapp.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RazorpayCheckoutPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        RazorpayCheckoutPlugin plugin = getRazorpayCheckoutPlugin();
        if (plugin != null) plugin.handlePaymentSuccess(razorpayPaymentId, paymentData);
    }

    @Override
    public void onPaymentError(int code, String description, PaymentData paymentData) {
        RazorpayCheckoutPlugin plugin = getRazorpayCheckoutPlugin();
        if (plugin != null) plugin.handlePaymentError(code, description);
    }

    private RazorpayCheckoutPlugin getRazorpayCheckoutPlugin() {
        if (getBridge() == null || getBridge().getPlugin("RazorpayCheckout") == null) return null;
        return (RazorpayCheckoutPlugin) getBridge().getPlugin("RazorpayCheckout").getInstance();
    }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd android && ./gradlew :app:compileDebugJavaWithJavac`
Expected: BUILD SUCCESSFUL, no errors referencing `MainActivity.java`

- [ ] **Step 3: Commit**

```bash
git add android/app/src/main/java/com/greenflagapp/app/MainActivity.java
git commit -m "feat(android): wire MainActivity to Razorpay's PaymentResultWithDataListener"
```

---

### Task 4: JS wrapper for the native plugin

**Files:**
- Create: `lib/native/razorpayNativeCheckout.ts`

**Interfaces:**
- Produces: `openRazorpayNativeCheckout(options: { keyId, orderId, amountPaise, prefillEmail? }): Promise<RazorpayCheckoutResult | null>`, matching the exact same return shape as the existing web wrapper (`lib/native/razorpayCheckout.ts`) so Task 5 is a drop-in swap.

This follows the exact `registerPlugin<T>(...)` pattern already used elsewhere in this codebase for native bridges (`lib/native/inAppPurchase.ts`).

- [ ] **Step 1: Write the wrapper**

```typescript
// lib/native/razorpayNativeCheckout.ts
import { registerPlugin } from '@capacitor/core';

// Bridges android/app/src/main/java/com/greenflagapp/app/RazorpayCheckoutPlugin.java.
// Android-only -- no iOS/web implementation is registered, since iOS keeps
// using useAppleIAP/StoreKit and no browser purchase path exists.
export interface RazorpayCheckoutResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutPlugin {
  open(options: {
    keyId: string;
    orderId: string;
    amountPaise: number;
    prefillEmail?: string;
  }): Promise<Partial<RazorpayCheckoutResult>>;
}

const RazorpayCheckout = registerPlugin<RazorpayCheckoutPlugin>('RazorpayCheckout');

export async function openRazorpayNativeCheckout(options: {
  keyId: string;
  orderId: string;
  amountPaise: number;
  prefillEmail?: string;
}): Promise<RazorpayCheckoutResult | null> {
  const result = await RazorpayCheckout.open(options);
  // The native plugin resolves an empty object on user cancellation
  // (Checkout.PAYMENT_CANCELED), matching the web flow's ondismiss ->
  // resolve(null) behavior.
  if (!result.razorpay_payment_id) return null;
  return result as RazorpayCheckoutResult;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `lib/native/razorpayNativeCheckout.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/native/razorpayNativeCheckout.ts
git commit -m "feat(payments): add JS wrapper for the native Razorpay checkout plugin"
```

---

### Task 5: Swap `useRazorpayIAP` to the native flow and add a visible failure toast

**Files:**
- Modify: `lib/hooks/useRazorpayIAP.ts`

**Interfaces:**
- Consumes: `openRazorpayNativeCheckout` from Task 4
- Produces: same public contract as before -- `useRazorpayIAP(): { isAndroid: boolean; purchase: (coins: number) => Promise<number | undefined>; purchasingCoins: number | null }`

Also fixes a real gap found during the web flow's rollout: purchase failures were silently swallowed (no visible error), which is what turned an actual bad-credential bug into a long, hard-to-diagnose dead end. This adds a visible `react-hot-toast` error (already used elsewhere in this app, e.g. `app/(guest)/coins/page.tsx:77`) on failure.

- [ ] **Step 1: Update the hook**

```typescript
// lib/hooks/useRazorpayIAP.ts
'use client';

import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { openRazorpayNativeCheckout } from '@/lib/native/razorpayNativeCheckout';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

// Android-only Razorpay purchase flow -- iOS keeps using useAppleIAP
// (StoreKit). No web/desktop browser path exists yet either; Razorpay's
// checkout works there too in principle, but that's a separate decision
// with its own product/pricing-display questions, not bundled in here.
//
// Email for the native checkout's prefill comes from Supabase auth
// directly (supabase.auth.getUser()), not the app's own useUserStore --
// that store holds the `profiles` table row (Profile type), which has no
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

      const result = await openRazorpayNativeCheckout({
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
      toast.error(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
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
Expected: no errors referencing `lib/hooks/useRazorpayIAP.ts`

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`
Expected: build completes without errors (Supabase env vars must be present in the shell for this to fully succeed, matching how the rest of this repo's build verification already works)

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/useRazorpayIAP.ts
git commit -m "feat(payments): swap useRazorpayIAP to the native checkout, add failure toast"
```

---

### Task 6: Sync, build, and install on device

**Files:** none (build + deploy only)

- [ ] **Step 1: Sync Capacitor**

Run: `npx cap sync android`
Expected: completes without errors, confirms `RazorpayCheckout` plugin is detected (look for it in the sync output's plugin list)

- [ ] **Step 2: Build the debug APK**

Run: `cd android && ./gradlew assembleDebug`
Expected: `BUILD SUCCESSFUL`, produces `android/app/build/outputs/apk/debug/app-debug.apk`

- [ ] **Step 3: Install on the connected device**

Run: `cd android && ./gradlew installDebug`
Expected: `BUILD SUCCESSFUL`, installs onto the connected physical Android device (device must be connected via USB with debugging enabled, or `adb devices` must list it)

- [ ] **Step 4: Commit**

No files change in this task -- nothing to commit. Proceed to Task 7 for on-device verification.

---

### Task 7: On-device verification and cutover

**Files:**
- Modify: `next.config.js` (remove Razorpay CSP allowances, once verified)
- Modify: `lib/hooks/useRazorpayIAP.ts` (already points at the native flow from Task 5 -- no further change)
- Delete: `lib/native/razorpayCheckout.ts` (the web Checkout.js path)

This task is the actual correctness gate for this plan -- native Android code can't be unit tested the way the server routes and JS wrapper were.

- [ ] **Step 1: Test Mode purchase**

With the app installed from Task 6, attempt a coin purchase using the current Test Mode keys already in Vercel. Confirm:
- The native bottom sheet opens (not a full-screen WebView page)
- A generic mock UPI flow appears (this is expected in Test Mode -- installed-app detection only shows in Live Mode, per the spec)
- Completing the mock payment credits coins and updates the balance in the UI
- A row appears in `coin_transactions` with the correct `razorpay_payment_id`

- [ ] **Step 2: Deliberately fail a purchase**

Cancel a purchase partway through. Confirm the new visible error/cancellation handling from Task 5 behaves correctly -- no silent hang, spinner clears.

- [ ] **Step 3: Live Mode purchase**

Switch `NEXT_PUBLIC_RAZORPAY_KEY`/`RAZORPAY_KEY_SECRET` in Vercel to live values (coordinate timing with whoever controls those credentials), redeploy, and attempt one small real purchase. Confirm the actual target UX renders: compact bottom sheet with installed UPI apps (PhonePe/Google Pay) detected and selectable.

- [ ] **Step 4: Remove the web Checkout.js path**

Once Steps 1-3 are all confirmed working, remove the now-unused web flow:

```bash
git rm lib/native/razorpayCheckout.ts
```

In `next.config.js`, remove the Razorpay-specific CSP allowances added for the web flow (revert to the pre-Razorpay CSP, since nothing loads `checkout.razorpay.com` as a script anymore):

```javascript
// Change this:
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
// ...
"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
"frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",

// Back to:
"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
// ...
"connect-src 'self' https://*.supabase.co wss://*.supabase.co",
"frame-src 'self'",
```

- [ ] **Step 5: Run the full test suite and verify the build**

Run: `npm run test && npx tsc --noEmit -p tsconfig.json`
Expected: all tests pass, no type errors (removing `razorpayCheckout.ts` must not break any remaining import)

- [ ] **Step 6: Commit and deploy**

```bash
git add next.config.js
git commit -m "refactor(payments): remove web Razorpay checkout path, native flow is the only path now"
git push origin main
```

Wait for the Vercel production deployment to reach `Ready` before considering this plan complete -- the server-side CSP change affects the live app immediately.
