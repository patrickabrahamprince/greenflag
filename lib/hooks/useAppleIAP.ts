'use client';

import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { InAppPurchase, type IAPTransaction } from '@/lib/native/inAppPurchase';
import { useCoinStore } from '@/lib/store';
import { APPLE_COIN_PRODUCT_IDS } from '@/lib/iap-products';

// This only ever runs inside the native iOS app -- Capacitor.isNativePlatform()
// is false on web, and there's no InAppPurchase plugin registered there
// anyway. Coins are iOS-app-only; there's no web purchase path.
export function useAppleIAP() {
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  // A transaction can succeed in StoreKit but never make it to our server
  // (app killed, lost network) before finishTransaction() is called. Those
  // stay in StoreKit's unfinished queue and get retried here so a paid
  // purchase can't get silently stuck.
  const verifyAndCredit = useCallback(async (transaction: IAPTransaction) => {
    const res = await fetch('/api/payments/apple/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jwsRepresentation: transaction.jwsRepresentation }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed');
    }
    useCoinStore.getState().setBalance(data.new_balance);
    try {
      await InAppPurchase.finishTransaction({ transactionId: transaction.transactionId });
    } catch (err) {
      // The purchase already succeeded and coins are already credited --
      // a bridge hiccup here shouldn't surface as "Purchase failed" to the
      // user (they were already charged and paid). Leaving it unfinished
      // is safe: it stays in StoreKit's queue and getUnfinishedTransactions()
      // picks it up again on next launch; the idempotent credit RPC means
      // that retry can't double-credit.
      console.error('finishTransaction failed after successful credit:', err);
    }
    return data.new_balance as number;
  }, []);

  useEffect(() => {
    if (!isNative) return;
    InAppPurchase.getUnfinishedTransactions()
      .then(({ transactions }) => {
        transactions.forEach((t) => {
          verifyAndCredit(t).catch((err) => console.error('Failed to recover unfinished IAP transaction:', err));
        });
      })
      .catch((err) => console.error('Failed to check unfinished IAP transactions:', err));
  }, [isNative, verifyAndCredit]);

  const purchase = useCallback(async (productId: string) => {
    if (!APPLE_COIN_PRODUCT_IDS.includes(productId)) {
      toast.error('Unknown coin package');
      return;
    }
    setPurchasingProductId(productId);
    try {
      const transaction = await InAppPurchase.purchase({ productId });
      const newBalance = await verifyAndCredit(transaction);
      toast.success('Coins added to your balance!');
      return newBalance;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('USER_CANCELLED')) {
        // Not an error -- they just closed the sheet.
      } else if (message.includes('PENDING')) {
        toast('Purchase is pending approval.', { icon: '⏳' });
      } else {
        toast.error('Purchase failed. Please try again.');
        console.error('IAP purchase error:', err);
      }
    } finally {
      setPurchasingProductId(null);
    }
  }, [verifyAndCredit]);

  return { isNative, purchase, purchasingProductId };
}
