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
