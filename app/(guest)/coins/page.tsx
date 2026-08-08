'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useAppleIAP } from '@/lib/hooks/useAppleIAP';
import { InAppPurchase, type IAPProduct } from '@/lib/native/inAppPurchase';
import { APPLE_COIN_PRODUCT_IDS } from '@/lib/iap-products';
import { CoinBalance } from '@/components/guest/CoinBalance';
import { PackageCard } from '@/components/guest/PackageCard';
import { TransactionHistory } from '@/components/guest/TransactionHistory';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

const PACKAGES = [
  { coins: 500, price: 399, appleProductId: 'com.greenflagapp.app.coins500', popular: true },
  { coins: 1200, price: 799, appleProductId: 'com.greenflagapp.app.coins1200', best: true },
  { coins: 2500, price: 1499, appleProductId: 'com.greenflagapp.app.coins2500' },
];

// Real-money round-trip check at the smallest possible spend -- confirms
// the whole pipeline (StoreKit purchase -> /api/payments/apple/verify ->
// credit_coins_idempotent_apple) with an actual charge, not a sandbox
// simulation. Visible to every account for now (was admin-only) --
// remove or re-gate this before App Review / public launch, since a
// real customer or reviewer will otherwise see it too.
const TEST_PACKAGE = { coins: 5, price: 9, appleProductId: 'com.greenflagapp.app.coinstest', test: true };

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

  const { isNative, purchase: handleApplePurchase, purchasingProductId } = useAppleIAP();

  // Real StoreKit pricing -- fetched once so the card shows what Apple
  // will actually charge instead of the guessed INR figure in PACKAGES.
  useEffect(() => {
    if (!isNative) return;
    InAppPurchase.getProducts({ productIds: APPLE_COIN_PRODUCT_IDS })
      .then(({ products }) => {
        setAppleProducts(Object.fromEntries(products.map((p) => [p.productId, p])));
      })
      .catch((err) => console.error('Failed to load Apple products:', err));
  }, [isNative]);

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

    // coin_transactions (not transactions -- confirmed empty on
    // production) is what add_coins/deduct_coins actually write to.
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
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-8 pt-safe-top pb-24 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        <CoinBalance balance={balance} />

        {!isNative && (
          <p className="px-4 mb-3 text-xs text-muted text-center">
            Coins can only be purchased in the GreenFlag iOS app.
          </p>
        )}

        <div className="px-4 space-y-3">
          {[...PACKAGES, TEST_PACKAGE].map((pkg) => (
            <PackageCard
              key={pkg.appleProductId}
              pkg={pkg}
              displayPrice={appleProducts[pkg.appleProductId]?.displayPrice}
              purchasing={!isNative || purchasingProductId !== null}
              isPurchasingThis={purchasingProductId === pkg.appleProductId}
              onBuy={() => handleApplePurchase(pkg.appleProductId)}
            />
          ))}
        </div>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
