import { Coins, Zap } from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  created_at: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="mt-8">
      <h2 className="font-display text-lg text-ink mb-3">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div data-testid="transaction-row" key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === 'purchase' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.type === 'purchase' ? (
                    <Coins className="w-4 h-4 text-green-500" />
                  ) : (
                    <Zap className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-ink">{tx.type}</p>
                  <p className="text-xs text-muted">
                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : ''}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                tx.type === 'purchase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {tx.type === 'purchase' ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
