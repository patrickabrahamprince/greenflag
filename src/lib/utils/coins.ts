// @ts-nocheck
export interface CoinPack {
  id: string;
  coins: number;
  priceINR: number;
  label: string;
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack_120', coins: 120, priceINR: 99, label: '120 Coins (Best Value)' },
  { id: 'pack_500', coins: 500, priceINR: 399, label: '500 Coins (Popular)' },
  { id: 'pack_1500', coins: 1500, priceINR: 999, label: '1500 Coins (Super Value)' },
];

export const checkHasEnoughCoins = (currentBalance: number, cost: number): boolean => {
  return currentBalance >= cost;
};

export const getCoinCostLabel = (cost: number): string => {
  return `${cost} coins`;
};
