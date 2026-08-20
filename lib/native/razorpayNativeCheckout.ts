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
  // Defense-in-depth: the native plugin already rejects on incomplete
  // paymentData, but validate at this boundary too before casting to the
  // full result type and sending it to /api/payments/razorpay/verify.
  if (!result.razorpay_order_id || !result.razorpay_signature) {
    throw new Error('Payment returned incomplete data');
  }
  return result as RazorpayCheckoutResult;
}
