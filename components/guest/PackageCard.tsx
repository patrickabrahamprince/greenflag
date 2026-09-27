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
      className={`card relative overflow-hidden transition-all duration-300 ${
        pkg.popular
          ? 'border-emerald/40 bg-gradient-to-br from-emerald/10 via-card/90 to-card/90 shadow-glow-emerald'
          : pkg.best
          ? 'border-gold/40 bg-gradient-to-br from-gold/10 via-card/90 to-card/90 shadow-glow-gold'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Badges */}
      {pkg.popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-emerald bg-emerald/15 border border-emerald/30 px-2.5 py-0.5 rounded-full backdrop-blur-md animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span>Most Popular</span>
        </div>
      )}
      {pkg.best && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-gold bg-gold/15 border border-gold/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <Crown className="w-3 h-3" />
          <span>Best Value</span>
        </div>
      )}

      {/* Main Info */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3.5 text-left hover:opacity-90 transition-opacity flex-1"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              pkg.popular
                ? 'bg-emerald/15 border-emerald/30 text-emerald shadow-glow-emerald'
                : pkg.best
                ? 'bg-gold/15 border-gold/30 text-gold shadow-glow-gold'
                : 'bg-white/5 border-white/10 text-gold'
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
            <p className="text-xs font-semibold text-emerald mt-0.5">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </button>

        <LoadingButton
          loading={isPurchasingThis}
          loadingLabel="Buying"
          onClick={onBuy}
          disabled={purchasing}
          className="!min-h-[40px] text-xs px-6 font-bold shrink-0 shadow-glow-emerald"
        >
          Buy Now
        </LoadingButton>
      </div>

      {/* Accordion Trigger for Unlocks */}
      {pkg.unlocks && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs text-ink/60 hover:text-ink transition-colors"
        >
          <span>See what&apos;s unlocked</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180 text-emerald' : ''}`} />
        </button>
      )}

      {/* Expanded Perks */}
      {expanded && pkg.unlocks && (
        <div className="pt-2.5 space-y-2 text-xs text-ink/80 animate-slide-down">
          {pkg.unlocks.women && (
            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
              <span className="flex items-center gap-2 text-ink/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                Unlock Women Profiles
              </span>
              <span className="text-white font-bold font-mono">{pkg.unlocks.women}</span>
            </div>
          )}
          {pkg.unlocks.pictures && (
            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
              <span className="flex items-center gap-2 text-ink/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                Photo Unlocks
              </span>
              <span className="text-white font-bold font-mono">{pkg.unlocks.pictures}</span>
            </div>
          )}
          {pkg.unlocks.reveals && (
            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.03]">
              <span className="flex items-center gap-2 text-ink/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                Profile Reveals
              </span>
              <span className="text-white font-bold font-mono">{pkg.unlocks.reveals}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

