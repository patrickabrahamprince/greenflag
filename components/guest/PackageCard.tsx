import { Crown, Zap, ShoppingCart } from 'lucide-react';
import { LoadingButton } from '@/components/shared/LoadingButton';

interface Package {
  coins: number;
  price: number;
  popular?: boolean;
  best?: boolean;
  test?: boolean;
  unlocks?: { women?: number; pictures?: number; reveals?: number };
}

interface PackageCardProps {
  pkg: Package;
  displayPrice?: string;
  purchasing: boolean;
  isPurchasingThis: boolean;
  onBuy: () => void;
}

export function PackageCard({ pkg, displayPrice, purchasing, isPurchasingThis, onBuy }: PackageCardProps) {
  return (
    <div className="card relative overflow-hidden">
      {pkg.popular && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
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
          Test
        </span>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {pkg.coins >= 150 ? (
            <Crown className="w-6 h-6 text-gold" />
          ) : (
            <Zap className="w-6 h-6 text-gold" />
          )}
          <div>
            <p className="text-ink font-display font-bold text-lg">{pkg.coins} Coins</p>
            <p className="text-xs text-muted">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </div>
        <LoadingButton
          loading={isPurchasingThis}
          loadingLabel="Processing"
          icon={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={onBuy}
          disabled={purchasing}
          className="!min-h-[38px] text-sm px-5"
        >
          Buy
        </LoadingButton>
      </div>

      {pkg.unlocks && (
        <div className="border-t border-raised pt-3 mt-3 space-y-1.5 text-xs text-ink/70">
          {pkg.unlocks.women && (
            <div className="flex justify-between">
              <span>Unlock Women Profiles:</span>
              <span className="text-gold font-semibold">{pkg.unlocks.women}</span>
            </div>
          )}
          {pkg.unlocks.pictures && (
            <div className="flex justify-between">
              <span>Photo Unlocks:</span>
              <span className="text-gold font-semibold">{pkg.unlocks.pictures}</span>
            </div>
          )}
          {pkg.unlocks.reveals && (
            <div className="flex justify-between">
              <span>Profile Reveals:</span>
              <span className="text-gold font-semibold">{pkg.unlocks.reveals}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
