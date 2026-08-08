// Static gift catalog -- same pattern as APPLE_COIN_PRODUCTS in
// iap-products.ts: a fixed, code-defined list rather than a DB table,
// since it changes by a deploy, not by an admin action.
export interface GiftType {
  id: string;
  label: string;
  cost: number;
  emoji: string;
}

export const GIFT_TYPES: GiftType[] = [
  { id: 'rose', label: 'Rose', cost: 20, emoji: '🌹' },
  { id: 'bouquet', label: 'Bouquet', cost: 75, emoji: '💐' },
  { id: 'diamond', label: 'Diamond', cost: 200, emoji: '💎' },
];

export function getGiftType(id: string): GiftType | undefined {
  return GIFT_TYPES.find((g) => g.id === id);
}
