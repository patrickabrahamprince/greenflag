import { Crown, Zap, ShoppingCart, Loader2 } from 'lucide-react';

interface Package {
  coins: number;
  price: number;
  popular?: boolean;
  best?: boolean;
}

interface PackageCardProps {
  pkg: Package;
  purchasing: number | null;
  onBuy: (pkg: Package) => void;
}

export function PackageCard({ pkg, purchasing, onBuy }: PackageCardProps) {
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
          onClick={() => onBuy(pkg)}
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
  );
}
