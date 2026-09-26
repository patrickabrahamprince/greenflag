'use client';

import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { openRazorpayNativeCheckout, type RazorpayCheckoutResult } from '@/lib/native/razorpayNativeCheckout';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayIAP() {
  const [purchasingCoins, setPurchasingCoins] = useState<number | null>(null);
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isIosNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

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

      let result: RazorpayCheckoutResult | null = null;

      // 1. Try Native Android Checkout if running inside native Android container
      if (isAndroid && Capacitor.isNativePlatform()) {
        try {
          result = await openRazorpayNativeCheckout({
            keyId: order.keyId,
            orderId: order.orderId,
            amountPaise: order.amountPaise,
            prefillEmail: authUser?.email,
          });
        } catch (nativeErr) {
          console.warn('Native Razorpay unavailable, falling back to Web Checkout:', nativeErr);
          result = null;
        }
      }

      // 2. Fallback to Web Razorpay Modal (works on Web, Android WebView, Mobile Browsers)
      if (!result) {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Could not load payment checkout. Please check your internet connection.');

        type RazorpayInstance = {
          open: () => void;
        };
        type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

        result = await new Promise<RazorpayCheckoutResult | null>((resolve) => {
          const options = {
            key: order.keyId,
            amount: order.amountPaise,
            currency: 'INR',
            name: 'GreenFlag',
            description: `${coins} Coins Package`,
            order_id: order.orderId,
            prefill: {
              email: authUser?.email || '',
            },
            theme: {
              color: '#10b981',
            },
            modal: {
              ondismiss: () => resolve(null),
            },
            handler: (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              resolve({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
          };

          const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
          const rzp = new RazorpayClass(options);
          rzp.open();
        });
      }

      if (!result) return undefined; // User dismissed checkout

      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Could not verify payment');

      useCoinStore.getState().setBalance(verifyData.new_balance);
      toast.success(`Successfully added ${coins} coins!`);
      return verifyData.new_balance;
    } catch (err) {
      console.error('Razorpay purchase failed:', err);
      toast.error(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
      return undefined;
    } finally {
      setPurchasingCoins(null);
    }
  }, [isAndroid]);

  return { isAndroid, isIosNative, purchase, purchasingCoins };
}
