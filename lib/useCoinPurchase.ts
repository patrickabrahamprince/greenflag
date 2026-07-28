import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

interface Package {
  coins: number;
  price: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string | null;
  user_id: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// The checkout.js <Script> tag in app/layout.tsx loads with
// afterInteractive, which is fast but not instant -- someone tapping Buy
// within the first moment on the Coins page could still beat it. Poll
// briefly instead of assuming it's already there.
function waitForRazorpay(timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 150);
  });
}

interface UseCoinPurchaseArgs {
  onBalanceUpdate: (balance: number) => void;
  onTransactionsUpdate: (transactions: Transaction[]) => void;
}

export function useCoinPurchase({ onBalanceUpdate, onTransactionsUpdate }: UseCoinPurchaseArgs) {
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const supabase = createClient();

  // The actual credit happens server-side via the Razorpay webhook, which
  // can land a second or two after Razorpay's client-side success handler
  // fires. A single immediate refetch here would very likely read the
  // wallet before the webhook has processed and silently overwrite the
  // optimistic balance bump with the old, lower number -- looking like
  // the payment didn't count even though it's about to. Poll until the
  // real balance catches up (or give up after ~9s and leave the
  // optimistic value in place).
  const pollWalletUntilCredited = async (expectedMinBalance: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (let attempt = 0; attempt < 6; attempt++) {
      await new Promise((r) => setTimeout(r, 1500));
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (wallet && (wallet as { balance: number }).balance >= expectedMinBalance) {
        onBalanceUpdate((wallet as { balance: number }).balance);
        break;
      }
    }

    // coin_transactions (not transactions -- confirmed empty on production)
    // is what add_coins/deduct_coins actually write to.
    const { data: txData } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    onTransactionsUpdate((txData as Transaction[]) || []);
  };

  const handleBuy = async (pkg: Package) => {
    setPurchasing(pkg.price);

    try {
      const razorpayReady = await waitForRazorpay();
      if (!razorpayReady) {
        toast.error('Payment system is still loading — please try again in a moment.');
        setPurchasing(null);
        return;
      }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_price: pkg.price }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create order');
        setPurchasing(null);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'GreenFlag',
        description: `${pkg.coins} Coins`,
        order_id: data.order_id,
        handler: async function () {
          toast.success('Payment successful! Coins will be credited shortly.');
          setPurchasing(null);
          const expectedMinBalance = useCoinStore.getState().balance + pkg.coins;
          useCoinStore.getState().add(pkg.coins);
          await pollWalletUntilCredited(expectedMinBalance);
        },
        prefill: {
          name: data.user_name || '',
          email: data.user_email || '',
        },
        theme: { color: '#C9A961' },
        modal: {
          ondismiss: function () {
            setPurchasing(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
        setPurchasing(null);
      });
      rzp.open();
    } catch (error) {
      toast.error('Something went wrong');
      setPurchasing(null);
    }
  };

  return { purchasing, handleBuy };
}
