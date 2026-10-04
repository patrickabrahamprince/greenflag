'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { LoadingLogo } from '@/components/shared/LoadingLogo';
import { useCoinStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Capacitor } from '@capacitor/core';
import { useAppleIAP } from '@/lib/hooks/useAppleIAP';
import { useRazorpayIAP } from '@/lib/hooks/useRazorpayIAP';
import { InAppPurchase, type IAPProduct } from '@/lib/native/inAppPurchase';
import { APPLE_COIN_PRODUCT_IDS } from '@/lib/iap-products';
import { CoinBalance } from '@/components/guest/CoinBalance';
import { PackageCard } from '@/components/guest/PackageCard';
import { TransactionHistory } from '@/components/guest/TransactionHistory';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import { hapticTap } from '@/lib/haptics';

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

  const isIosNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  const { purchase: handleApplePurchase, purchasingProductId, restorePurchases } = useAppleIAP();
  const { purchase: handleRazorpayPurchase, purchasingCoins } = useRazorpayIAP();

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
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1C1C1E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1C1C1E] flex flex-col max-w-md mx-auto">
      <div className="w-full px-6 pt-[max(16px,env(safe-area-inset-top,16px))] pb-2 shrink-0 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              hapticTap();
              router.back();
            }}
            className="w-10 h-10 rounded-full bg-[#F4F4F5] hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-[#1C1C1E] transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-extrabold text-lg text-[#1C1C1E]">Coins & Store</h1>
          {isIosNative ? (
            <button
              onClick={() => {
                hapticTap();
                restorePurchases();
              }}
              className="text-xs text-[#1C1C1E] font-bold hover:underline active:opacity-75"
            >
              Restore
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none w-full px-6 pt-4 pb-28 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-[#1C1C1E] ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

        <CoinBalance balance={balance} />

        <div className="space-y-3 pt-4">
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
                  confetti({ particleCount: 120, spread: 75, origin: { y: 0.3 }, colors: ['#1C1C1E', '#71717A', '#FFFFFF'] });
                }
              }}
            />
          ))}
        </div>

        {/* Security & Guarantees */}
        <div className="mt-6 py-3.5 px-4 rounded-2xl bg-[#F9FAFB] border border-stone-200 flex items-center justify-center gap-3 text-[11px] text-stone-500 text-center font-medium">
          <span className="flex items-center gap-1">🔒 256-Bit SSL Encrypted</span>
          <span>•</span>
          <span className="flex items-center gap-1">⚡ Instant Delivery</span>
        </div>

        {/* Legal & Restore Footer */}
        <div className="mt-4 pb-4 flex flex-col items-center justify-center gap-2 text-[11px] text-stone-400">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/terms')}
              className="hover:text-stone-700 transition-colors underline underline-offset-2"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => router.push('/privacy')}
              className="hover:text-stone-700 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </button>
            {isIosNative && (
              <>
                <span>•</span>
                <button
                  onClick={() => {
                    hapticTap();
                    restorePurchases();
                  }}
                  className="hover:text-stone-700 transition-colors underline underline-offset-2"
                >
                  Restore Purchases
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-1">
            Coins are non-refundable consumable credits used for in-app features and unlocks.
          </p>
        </div>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
