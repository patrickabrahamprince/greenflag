'use client';

import { useState } from 'react';
import { Crown, Sparkles, Zap, Shield, Eye, Check, X, ArrowRight, Heart } from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface ProSubscriptionModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  defaultPlan?: 'monthly' | 'weekly' | 'yearly';
}

const PRO_TIERS = [
  { id: 'weekly', name: 'Weekly', price: '₹99', period: '/week', badge: 'Try It Out' },
  { id: 'monthly', name: 'Monthly PRO', price: '₹249', period: '/month', badge: 'Most Popular', highlight: true },
  { id: 'yearly', name: 'Annual Pass', price: '₹1,499', period: '/year', badge: 'Save 50%' },
];

const PRO_FEATURES = [
  { icon: '🚀', title: 'Unlimited Flag Creation', desc: 'Host unlimited Micro Dates, Day Drives & Getaways' },
  { icon: '💖', title: 'See Who Sparked You', desc: 'Instantly view all mutual & incoming secret sparks' },
  { icon: '⚡', title: '2 Free Trip Boosts / mo', desc: 'Pin your trips to the top of the Apple Map' },
  { icon: '🛡️', title: 'Host Women-Only Circles', desc: 'Create private verified female-only travel groups' },
  { icon: '⭐', title: 'Priority Super Requests', desc: 'Your join notes appear first for top-rated hosts' },
  { icon: '🔍', title: 'Advanced Filters', desc: 'Filter by 4.8★+ Green Scores & verified Govt IDs' },
];

const STANDALONE_BOOSTS = [
  { id: 'boost_trip', icon: '⚡', name: '6h Map Boost', price: '₹49', desc: 'Pin trip to top of local map' },
  { id: 'super_request', icon: '⭐', name: 'Super Request', price: '₹19', desc: 'Instant priority note to host' },
  { id: 'rewind', icon: '⏪', name: 'Trip Rewind', price: '₹19', desc: 'Re-request expired plan' },
];

export function ProSubscriptionModal({ open, isOpen, onClose, defaultPlan = 'monthly' }: ProSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>(defaultPlan);
  const [purchasing, setPurchasing] = useState(false);

  const isVisible = open ?? isOpen ?? false;
  if (!isVisible) return null;

  const handleSubscribe = async () => {
    hapticSuccess();
    setPurchasing(true);
    // Simulates native Apple StoreKit IAP verification
    setTimeout(() => {
      setPurchasing(false);
      toast.success(`GreenFlag PRO activated (${selectedPlan})!`);
      onClose();
    }, 1200);
  };

  const handleBuyBoost = (boostName: string, price: string) => {
    hapticTap();
    toast.success(`${boostName} purchased (${price})!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-stone-200 rounded-[36px] p-6 shadow-2xl no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 flex items-center justify-center active:scale-90 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Hero Header */}
        <div className="text-center mb-6 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-stone-900">GreenFlag PRO</h2>
          <p className="text-xs font-semibold text-stone-500 mt-1 max-w-[280px] mx-auto">
            Unlimited travel dates, see who sparked you, and map-top priority.
          </p>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {PRO_TIERS.map((tier) => {
            const isSelected = selectedPlan === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  hapticTap();
                  setSelectedPlan(tier.id as any);
                }}
                className={`relative rounded-2xl p-3 text-center border-2 transition-all active:scale-95 flex flex-col justify-between min-h-[110px] cursor-pointer ${
                  isSelected
                    ? 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-md'
                    : 'bg-stone-50 text-stone-900 border-stone-200 hover:border-stone-400'
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'bg-stone-200 text-stone-700 border border-stone-300'
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}
                <span className="text-[11px] font-bold opacity-80 mt-1">{tier.name}</span>
                <div className="my-1">
                  <span className="text-lg font-extrabold block leading-none">{tier.price}</span>
                  <span className="text-[10px] opacity-70">{tier.period}</span>
                </div>
                <div className={`w-4 h-4 rounded-full mx-auto flex items-center justify-center ${isSelected ? 'bg-white text-[#1C1C1E]' : 'border border-stone-300'}`}>
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pro Features List */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-5 space-y-3 shadow-xs">
          {PRO_FEATURES.map((feat) => (
            <div key={feat.title} className="flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">{feat.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-stone-900">{feat.title}</h4>
                <p className="text-[11px] font-medium text-stone-500 leading-tight">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubscribe}
          disabled={purchasing}
          className="w-full py-4 bg-[#1C1C1E] hover:bg-black text-white rounded-full text-sm font-bold active:scale-95 shadow-lg flex items-center justify-center gap-2 mb-4 cursor-pointer"
        >
          {purchasing ? 'Activating via Apple IAP...' : `Get PRO (${selectedPlan === 'monthly' ? '₹249/mo' : selectedPlan === 'weekly' ? '₹99/wk' : '₹1,499/yr'})`}
          <ArrowRight size={16} />
        </button>

        {/* Standalone Boosts Section */}
        <div className="border-t border-stone-200 pt-4">
          <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
            Or Buy Individual Boosts
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {STANDALONE_BOOSTS.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBuyBoost(b.name, b.price)}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-center active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-lg block mb-0.5">{b.icon}</span>
                <span className="text-[11px] font-bold text-stone-900 block leading-tight truncate">{b.name}</span>
                <span className="text-xs font-extrabold text-stone-900">{b.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Apple 4.3 IAP Compliance Notice */}
        <p className="text-[10px] text-stone-400 text-center mt-4 leading-tight font-medium">
          Subscription automatically renews unless cancelled at least 24h before end of period via Apple ID Settings. Real-world cost sharing on trips is paid directly between users via UPI.
        </p>
      </div>
    </div>
  );
}
