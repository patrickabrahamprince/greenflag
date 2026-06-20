'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Coins, Zap, Crown, ShoppingCart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

const PACKAGES = [
  { coins: 10, price: 99, popular: true },
  { coins: 40, price: 299, best: true },
  { coins: 150, price: 799 },
];

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

export default function CoinsPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        setBalance((wallet as { balance: number }).balance);
      }

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions((txData as Transaction[]) || []);
      setLoading(false);
    };

    load();
  }, [supabase, router, setBalance]);

  const handleBuy = async (pkg: typeof PACKAGES[0]) => {
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

          // Optimistically add coins
          useCoinStore.getState().add(pkg.coins);

          // Refresh wallet balance from DB
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: wallet } = await supabase
              .from('wallets')
              .select('balance')
              .eq('user_id', user.id)
              .single();
            if (wallet) {
              setBalance((wallet as { balance: number }).balance);
            }

            // Refresh transactions
            const { data: txData } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(20);
            setTransactions((txData as Transaction[]) || []);
          }
        },
        prefill: {
          name: data.user_name || '',
          email: data.user_email || '',
        },
        theme: {
          color: '#D4AF37',
        },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display flex-1">Coins</h1>
      </div>

      <div className="flex flex-col items-center py-8">
        <Coins className="w-10 h-10 text-gold mb-3" />
        <p className="text-5xl font-display text-gold">{balance}</p>
        <p className="text-muted text-sm mt-1">coins</p>
      </div>

      <div className="px-4 space-y-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.coins}
            className="card relative overflow-hidden"
          >
            {pkg.popular && (
              <span className="absolute top-2 right-2 text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            {pkg.best && (
              <span className="absolute top-2 right-2 text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                Best Value
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {pkg.coins >= 150 ? (
                  <Crown className="w-6 h-6 text-gold" />
                ) : (
                  <Zap className="w-6 h-6 text-gold" />
                )}
                <div>
                  <p className="text-white font-medium">{pkg.coins} Coins</p>
                  <p className="text-xs text-muted">₹{pkg.price}</p>
                </div>
              </div>
              <button
                onClick={() => handleBuy(pkg)}
                disabled={purchasing !== null}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                {purchasing === pkg.price ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )}
                {purchasing === pkg.price ? 'Processing...' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-8">
        <h2 className="text-lg font-display text-white mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'purchase' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {tx.type === 'purchase' ? (
                      <Coins className="w-4 h-4 text-green-500" />
                    ) : (
                      <Zap className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-muted">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  tx.type === 'purchase' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {tx.type === 'purchase' ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
