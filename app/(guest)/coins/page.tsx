'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useAppleIAP } from '@/lib/hooks/useAppleIAP';
import { useRazorpayIAP } from '@/lib/hooks/useRazorpayIAP';
import { InAppPurchase, type IAPProduct } from '@/lib/native/inAppPurchase';
import { APPLE_COIN_PRODUCT_IDS } from '@/lib/iap-products';
import { CoinBalance } from '@/components/guest/CoinBalance';
import { PackageCard } from '@/components/guest/PackageCard';
import { TransactionHistory } from '@/components/guest/TransactionHistory';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

const PACKAGES = [
  { coins: 500, price: 49, appleProductId: 'com.greenflagapp.app.coins500', popular: true, unlocks: { women: 1, pictures: 10, reveals: 5 } },
  { coins: 1000, price: 89, appleProductId: 'com.greenflagapp.app.coins1000', unlocks: { women: 2, pictures: 20, reveals: 10 } },
  { coins: 1500, price: 129, appleProductId: 'com.greenflagapp.app.coins1500', best: true, unlocks: { women: 3, pictures: 30, reveals: 15 } },
  { coins: 2000, price: 169, appleProductId: 'com.greenflagapp.app.coins2000', unlocks: { women: 4, pictures: 40, reveals: 20 } },
  { coins: 5000, price: 399, appleProductId: 'com.greenflagapp.app.coins5000', unlocks: { women: 10, pictures: 100, reveals: 50 } },
];

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string | null;
}

export default function CoinsPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const setBalance = useCoinStore((s) => s.setBalance);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appleProducts, setAppleProducts] = useState<Record<string, IAPProduct>>({});
  const supabase = createClient();

  const { isNative: isIosNative, purchase: handleApplePurchase, purchasingProductId } = useAppleIAP();
  const { purchase: handleRazorpayPurchase, purchasingCoins } = useRazorpayIAP();

  // Real StoreKit pricing on native iOS
  useEffect(() => {
    if (!isIosNative) return;
    InAppPurchase.getProducts({ productIds: APPLE_COIN_PRODUCT_IDS })
      .then(({ products }) => {
        setAppleProducts(Object.fromEntries(products.map((p) => [p.productId, p])));
      })
      .catch((err) => { if (process.env.NODE_ENV === 'development') console.error('Failed to load Apple products:', err); });
  }, [isIosNative]);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (wallet) {
      setBalance((wallet as { balance: number }).balance);
    } else if (walletError) {
      toast.error('Could not load your coin balance. Pull to refresh.');
    }

    const { data: txData } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setTransactions((txData as Transaction[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router, setBalance]);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(load);

  if (loading) {
    return (
      <div className="min-h-dvh screen-gradient flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-5rem)] screen-gradient flex flex-col">
      <div className="max-w-app mx-auto w-full px-8 pt-safe-top shrink-0">
        <div className="page-header">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-ink flex-1">Coins</h1>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-8 pb-24 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        <CoinBalance balance={balance} />

        <div className="space-y-3">
          {PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.appleProductId}
              pkg={pkg}
              displayPrice={appleProducts[pkg.appleProductId]?.displayPrice}
              purchasing={isIosNative ? purchasingProductId !== null : purchasingCoins !== null}
              isPurchasingThis={isIosNative ? purchasingProductId === pkg.appleProductId : purchasingCoins === pkg.coins}
              onBuy={async () => {
                const newBalance = isIosNative
                  ? await handleApplePurchase(pkg.appleProductId)
                  : await handleRazorpayPurchase(pkg.coins);
                if (newBalance !== undefined) {
                  confetti({ particleCount: 120, spread: 75, origin: { y: 0.3 }, colors: ['#10b981', '#34d399', '#fff'] });
                }
              }}
            />
          ))}
        </div>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
