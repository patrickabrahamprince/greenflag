export interface CoinPack {
  id: string;
  coins: number;
  priceINR: number;
  label: string;
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack_10', coins: 10, priceINR: 99, label: '10 Coins' },
  { id: 'pack_40', coins: 40, priceINR: 299, label: '40 Coins (Popular)' },
  { id: 'pack_150', coins: 150, priceINR: 799, label: '150 Coins (Best Value)' },
];

export const checkHasEnoughCoins = (currentBalance: number, cost: number): boolean => {
  return currentBalance >= cost;
};

export const getCoinCostLabel = (cost: number): string => {
  return `${cost} coins`;
};
