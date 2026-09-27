'use client';

import { useState } from 'react';
import { Crown, Zap, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card relative overflow-hidden transition-all duration-200 transform-gpu ${
        pkg.popular
          ? 'border-emerald/50 bg-gradient-to-br from-emerald/15 via-card/95 to-card/90 shadow-glow-emerald'
          : pkg.best
          ? 'border-gold/50 bg-gradient-to-br from-gold/15 via-card/95 to-card/90 shadow-glow-gold'
          : 'border-white/10 bg-card/80 hover:border-white/20'
      }`}
    >
      {/* Badges */}
      {pkg.popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-emerald bg-emerald/20 border border-emerald/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-emerald animate-pulse" />
          <span>Most Popular</span>
        </div>
      )}
      {pkg.best && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-gold bg-gold/20 border border-gold/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <Crown className="w-3 h-3 text-gold" />
          <span>Best Value</span>
        </div>
      )}

      {/* Main Info */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3.5 text-left hover:opacity-90 transition-opacity flex-1 active:scale-[0.98]"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              pkg.popular
                ? 'bg-emerald/20 border-emerald/40 text-emerald shadow-glow-emerald'
                : pkg.best
                ? 'bg-gold/20 border-gold/40 text-gold shadow-glow-gold'
                : 'bg-white/5 border-white/10 text-emerald'
            }`}
          >
            {pkg.coins >= 1500 ? (
              <Crown className="w-6 h-6" />
            ) : (
              <Zap className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-ink font-display font-bold text-xl tracking-tight">{pkg.coins.toLocaleString()} Coins</p>
            </div>
            <p className="text-xs font-semibold text-emerald-glow mt-0.5">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </button>

        <LoadingButton
          loading={isPurchasingThis}
          loadingLabel="Buying"
          onClick={onBuy}
          disabled={purchasing}
          className="!min-h-[42px] text-xs px-6 font-bold shrink-0 shadow-glow-emerald active:scale-95"
        >
          Buy Now
        </LoadingButton>
      </div>

      {/* Accordion Trigger for Unlocks */}
      {pkg.unlocks && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs text-ink/70 hover:text-ink transition-colors"
        >
          <span className="font-medium">See unlocked perks</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180 text-emerald' : ''}`} />
        </button>
      )}

      {/* Expanded Perks */}
      {expanded && pkg.unlocks && (
        <div className="pt-2.5 space-y-1.5 text-xs text-ink/90 animate-slide-down">
          {pkg.unlocks.women && (
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="flex items-center gap-2 text-ink/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                Unlock Women Profiles
              </span>
              <span className="text-emerald font-bold font-mono">+{pkg.unlocks.women}</span>
            </div>
          )}
          {pkg.unlocks.pictures && (
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="flex items-center gap-2 text-ink/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                Photo Unlocks
              </span>
              <span className="text-emerald font-bold font-mono">+{pkg.unlocks.pictures}</span>
            </div>
          )}
          {pkg.unlocks.reveals && (
            <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="flex items-center gap-2 text-ink/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                Profile Reveals
              </span>
              <span className="text-emerald font-bold font-mono">+{pkg.unlocks.reveals}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

