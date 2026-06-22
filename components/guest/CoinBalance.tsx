import { Coins } from 'lucide-react';

interface CoinBalanceProps {
  balance: number;
}

export function CoinBalance({ balance }: CoinBalanceProps) {
  return (
    <div data-testid="coin-balance" className="flex flex-col items-center py-8">
      <Coins className="w-10 h-10 text-gold mb-3" />
      <p className="text-5xl font-display text-gold">{balance}</p>
      <p className="text-muted text-sm mt-1">coins</p>
    </div>
  );
}
