import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

interface Package {
  coins: number;
  price: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseCoinPurchaseArgs {
  onBalanceUpdate: (balance: number) => void;
  onTransactionsUpdate: (transactions: Transaction[]) => void;
}

export function useCoinPurchase({ onBalanceUpdate, onTransactionsUpdate }: UseCoinPurchaseArgs) {
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const supabase = createClient();

  const refreshWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    if (wallet) {
      onBalanceUpdate((wallet as { balance: number }).balance);
    }

    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    onTransactionsUpdate((txData as Transaction[]) || []);
  };

  const handleBuy = async (pkg: Package) => {
    setPurchasing(pkg.price);

    try {
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
        handler: async function (response: any) {
          toast.success('Payment successful! Coins will be credited shortly.');
          setPurchasing(null);
          useCoinStore.getState().add(pkg.coins);
          await refreshWallet();
        },
        prefill: {
          name: data.user_name || '',
          email: data.user_email || '',
        },
        theme: { color: '#D4AF37' },
        modal: {
          ondismiss: function () {
            setPurchasing(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
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
