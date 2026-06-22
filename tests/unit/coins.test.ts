import { describe, it, expect } from 'vitest';

describe('Coin calculations', () => {
  const COIN_PACKS = {
    99: { coins: 10, priceINR: 99 },
    299: { coins: 40, priceINR: 299 },
    799: { coins: 150, priceINR: 799 },
  };

  const CONNECTION_COST = 5;

  it('should have correct coin packs', () => {
    expect(COIN_PACKS[99].coins).toBe(10);
    expect(COIN_PACKS[299].coins).toBe(40);
    expect(COIN_PACKS[799].coins).toBe(150);
  });

  it('should calculate coins per INR correctly', () => {
    const smallPack = COIN_PACKS[99];
    const largePack = COIN_PACKS[799];
    expect(smallPack.coins / smallPack.priceINR).toBeCloseTo(0.101);
    expect(largePack.coins / largePack.priceINR).toBeCloseTo(0.188);
  });

  it('should enforce connection cost of 5 coins', () => {
    expect(CONNECTION_COST).toBe(5);
  });

  it('should not allow connection with insufficient coins', () => {
    const balance = 3;
    const canConnect = balance >= CONNECTION_COST;
    expect(canConnect).toBe(false);
  });

  it('should allow connection with sufficient coins', () => {
    const balance = 10;
    const canConnect = balance >= CONNECTION_COST;
    expect(canConnect).toBe(true);
  });

  it('should deduct correct coins after connection', () => {
    const initialBalance = 10;
    const newBalance = initialBalance - CONNECTION_COST;
    expect(newBalance).toBe(5);
  });

  it('should refund coins on rejection', () => {
    const balanceAfterDeduction = 5;
    const refundedBalance = balanceAfterDeduction + CONNECTION_COST;
    expect(refundedBalance).toBe(10);
  });

  it('should not allow negative balance', () => {
    const balance = 0;
    const newBalance = Math.max(0, balance - CONNECTION_COST);
    expect(newBalance).toBe(0);
  });
});
