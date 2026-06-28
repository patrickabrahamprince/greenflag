'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useCoinPurchase } from '@/lib/useCoinPurchase';
import { CoinBalance } from '@/components/guest/CoinBalance';
import { PackageCard } from '@/components/guest/PackageCard';
import { TransactionHistory } from '@/components/guest/TransactionHistory';

const PACKAGES = [
  { coins: 500, price: 399, popular: true },
  { coins: 1200, price: 799, best: true },
  { coins: 2500, price: 1499 },
];

interface Transaction {
  id: string;
  type: string;
  amount_inr: number | null;
  coins: number;
  created_at: string | null;
}

export default function CoinsPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const supabase = createClient();

  const { purchasing, handleBuy } = useCoinPurchase({
    onBalanceUpdate: setBalance,
    onTransactionsUpdate: setTransactions,
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
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

      <CoinBalance balance={balance} />

      <div className="px-4 space-y-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.coins}
            pkg={pkg}
            purchasing={purchasing}
            onBuy={handleBuy}
          />
        ))}
      </div>

      <TransactionHistory transactions={transactions} />
    </div>
  );
}
