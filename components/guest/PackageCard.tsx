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
      className={`card relative overflow-hidden transition-all duration-200 rounded-3xl p-5 ${
        pkg.popular
          ? 'border-stone-400 bg-white shadow-sm'
          : pkg.best
          ? 'border-stone-400 bg-white shadow-sm'
          : 'border-stone-200 bg-[#F9FAFB]'
      }`}
    >
      {/* Badges */}
      {pkg.popular && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-bold text-white bg-[#1C1C1E] px-2.5 py-0.5 rounded-full shadow-2xs">
          <Sparkles className="w-3 h-3 text-white" />
          <span>Most Popular</span>
        </div>
      )}
      {pkg.best && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-bold text-white bg-[#1C1C1E] px-2.5 py-0.5 rounded-full shadow-2xs">
          <Crown className="w-3 h-3 text-white" />
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
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-stone-200 bg-white text-[#1C1C1E] shadow-2xs">
            {pkg.coins >= 1500 ? (
              <Crown className="w-5 h-5" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[#1C1C1E] font-display font-extrabold text-lg tracking-tight">{pkg.coins.toLocaleString()} Coins</p>
            </div>
            <p className="text-xs font-bold text-stone-500 mt-0.5">{displayPrice || `₹${pkg.price}`}</p>
          </div>
        </button>

        <LoadingButton
          loading={isPurchasingThis}
          loadingLabel="Buying"
          onClick={onBuy}
          disabled={purchasing}
          className="!min-h-[40px] text-xs px-5 font-bold shrink-0 shadow-2xs active:scale-95 !bg-[#1C1C1E] !text-white rounded-full"
        >
          Buy Now
        </LoadingButton>
      </div>

      {/* Accordion Trigger for Unlocks */}
      {pkg.unlocks && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between pt-3 mt-3 border-t border-stone-200/80 text-xs text-stone-500 hover:text-[#1C1C1E] transition-colors"
        >
          <span className="font-semibold text-[11px]">See perks & unlocks</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180 text-[#1C1C1E]' : ''}`} />
        </button>
      )}

      {/* Expanded Perks */}
      {expanded && pkg.unlocks && (
        <div className="pt-2.5 space-y-1.5 text-xs text-[#1C1C1E] animate-slide-down">
          {pkg.unlocks.women && (
            <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white border border-stone-200">
              <span className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1C1C1E] shrink-0" />
                Unlock Women Profiles
              </span>
              <span className="text-[#1C1C1E] font-bold font-mono text-xs">+{pkg.unlocks.women}</span>
            </div>
          )}
          {pkg.unlocks.pictures && (
            <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white border border-stone-200">
              <span className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1C1C1E] shrink-0" />
                Photo Unlocks
              </span>
              <span className="text-[#1C1C1E] font-bold font-mono text-xs">+{pkg.unlocks.pictures}</span>
            </div>
          )}
          {pkg.unlocks.reveals && (
            <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white border border-stone-200">
              <span className="flex items-center gap-2 text-stone-600 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1C1C1E] shrink-0" />
                Profile Reveals
              </span>
              <span className="text-[#1C1C1E] font-bold font-mono text-xs">+{pkg.unlocks.reveals}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
