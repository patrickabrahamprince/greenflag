'use client';

import { useState } from 'react';
import { IndianRupee, Fuel, Bed, Utensils, Users, Share2, Check, ArrowRight } from 'lucide-react';
import { hapticTap, hapticSuccess } from '@/lib/haptics';
import toast from 'react-hot-toast';

interface CostSplitCalculatorProps {
  initialFuel?: number;
  initialStay?: number;
  initialFood?: number;
  initialGroupSize?: number;
  tripTitle?: string;
  onValuesChange?: (breakdown: { fuel: number; stay: number; food: number; perPerson: number; total: number }) => void;
  isInteractive?: boolean;
}

export function CostSplitCalculator({
  initialFuel = 1600,
  initialStay = 3200,
  initialFood = 1200,
  initialGroupSize = 4,
  tripTitle = 'Weekend Trip',
  onValuesChange,
  isInteractive = true,
}: CostSplitCalculatorProps) {
  const [fuel, setFuel] = useState(initialFuel);
  const [stay, setStay] = useState(initialStay);
  const [food, setFood] = useState(initialFood);
  const [groupSize, setGroupSize] = useState(initialGroupSize);
  const [copiedUPI, setCopiedUPI] = useState(false);

  const totalCost = fuel + stay + food;
  const perPerson = groupSize > 0 ? Math.round(totalCost / groupSize) : 0;

  const handleUpdate = (newFuel: number, newStay: number, newFood: number, newSize: number) => {
    setFuel(newFuel);
    setStay(newStay);
    setFood(newFood);
    setGroupSize(newSize);
    const tot = newFuel + newStay + newFood;
    const per = newSize > 0 ? Math.round(tot / newSize) : 0;
    onValuesChange?.({ fuel: newFuel, stay: newStay, food: newFood, perPerson: per, total: tot });
  };

  const handleCopyUPILink = () => {
    hapticSuccess();
    const upiLink = `upi://pay?pa=greenflag.split@icici&pn=GreenFlag%20Trip%20Split&am=${perPerson}&cu=INR&tn=${encodeURIComponent(tripTitle)}`;
    navigator.clipboard?.writeText(upiLink);
    setCopiedUPI(true);
    toast.success(`UPI Split Link copied (₹${perPerson}/person)`);
    setTimeout(() => setCopiedUPI(false), 2500);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-[28px] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            ₹
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-[#382A21]">Cost Split Calculator</h3>
            <p className="text-[11px] font-medium text-stone-500">Transparent real-world cost sharing</p>
          </div>
        </div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
          Zero Commission
        </span>
      </div>

      {/* Cost Sliders / Inputs */}
      <div className="space-y-4 mb-5">
        {/* Fuel & Transport */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#382A21] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-orange-600" /> Fuel / Fastag / Cabs
            </span>
            <span className="font-mono text-stone-800">₹{fuel.toLocaleString('en-IN')}</span>
          </div>
          {isInteractive && (
            <input
              type="range"
              min="0"
              max="8000"
              step="100"
              value={fuel}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleUpdate(val, stay, food, groupSize);
              }}
              className="w-full accent-orange-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          )}
        </div>

        {/* Stay / Homestay */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#382A21] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-emerald-700" /> Stay / Homestay / Camp
            </span>
            <span className="font-mono text-stone-800">₹{stay.toLocaleString('en-IN')}</span>
          </div>
          {isInteractive && (
            <input
              type="range"
              min="0"
              max="15000"
              step="200"
              value={stay}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleUpdate(fuel, val, food, groupSize);
              }}
              className="w-full accent-emerald-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          )}
        </div>

        {/* Food & Chai */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#382A21] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-purple-700" /> Meals & Snacks
            </span>
            <span className="font-mono text-stone-800">₹{food.toLocaleString('en-IN')}</span>
          </div>
          {isInteractive && (
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={food}
              onChange={(e) => {
                const val = Number(e.target.value);
                handleUpdate(fuel, stay, val, groupSize);
              }}
              className="w-full accent-purple-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          )}
        </div>

        {/* Group Size Stepper */}
        {isInteractive && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-[#382A21] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-500" /> Split Across
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 6].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    hapticTap();
                    handleUpdate(fuel, stay, food, size);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-90 ${
                    groupSize === size
                      ? 'bg-[#1D3B2A] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {size} {size === 1 ? 'solo' : 'pax'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Display Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-white border-2 border-emerald-300/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
            Each Person Pays
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-[#1D3B2A]">
              ₹{perPerson.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-semibold">
              (Total: ₹{totalCost.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyUPILink}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1D3B2A] text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-xs"
        >
          {copiedUPI ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> UPI Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
