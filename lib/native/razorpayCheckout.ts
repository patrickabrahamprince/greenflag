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
