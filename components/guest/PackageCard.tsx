import { Crown, Zap, ShoppingCart, Loader2 } from 'lucide-react';

interface Package {
  coins: number;
  price: number;
  popular?: boolean;
  best?: boolean;
  test?: boolean;
}

interface PackageCardProps {
  pkg: Package;
  // Real StoreKit price string (e.g. "₹399.00") once App Store Connect
  // pricing has loaded -- falls back to the guessed INR figure in
  // PACKAGES while that's still in flight.
  displayPrice?: string;
  purchasing: boolean;
  isPurchasingThis: boolean;
  onBuy: () => void;
}

export function PackageCard({ pkg, displayPrice, purchasing, isPurchasingThis, onBuy }: PackageCardProps) {
  return (
    <div className="card relative overflow-hidden">
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
      {pkg.test && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
          Admin Test
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
            <p className="text-ink font-medium">{pkg.coins} Coins</p>
            <p className="text-xs text-muted">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </div>
        <button
          onClick={onBuy}
          disabled={purchasing}
          className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
        >
          {isPurchasingThis ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          {isPurchasingThis ? 'Processing...' : 'Buy'}
        </button>
      </div>
    </div>
  );
}
