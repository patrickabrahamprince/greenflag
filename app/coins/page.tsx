'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Coins, Zap, Crown, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';

const PACKAGES = [
  { coins: 10, price: 29, popular: true },
  { coins: 40, price: 99, best: true },
  { coins: 150, price: 299 },
];

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'credit', amount: 40, description: 'Purchased 40 Coins', date: '2024-12-15' },
  { id: '2', type: 'debit', amount: 10, description: 'Started connection: Morning Routine', date: '2024-12-14' },
  { id: '3', type: 'credit', amount: 150, description: 'Purchased 150 Coins', date: '2024-12-10' },
  { id: '4', type: 'debit', amount: 10, description: 'Started connection: Fitness Challenge', date: '2024-12-08' },
  { id: '5', type: 'credit', amount: 10, description: 'Purchased 10 Coins', date: '2024-12-01' },
];

export default function CoinsPage() {
  const router = useRouter();
  const balance = useCoinStore((s) => s.balance);
  const add = useCoinStore((s) => s.add);

  const handleBuy = (pkg: typeof PACKAGES[0]) => {
    toast.success(`Order created for ${pkg.coins} coins`);
    add(pkg.coins);
    router.push('/profile');
  };

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
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-8">
        <h2 className="text-lg font-display text-white mb-3">Transaction History</h2>
        <div className="space-y-1">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'credit' ? (
                    <Coins className="w-4 h-4 text-green-500" />
                  ) : (
                    <Zap className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="text-xs text-muted">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
