import { Coins, Zap, ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
      <h2 className="font-display font-bold text-lg text-ink mb-3">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="card text-center py-8 border-black/[0.06]">
          <p className="text-ink/40 text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="card space-y-1 p-3 border-black/[0.08]">
          {transactions.map((tx) => {
            const isCredit = tx.type === 'purchase' || tx.amount > 0;
            return (
              <div
                data-testid="transaction-row"
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isCredit
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-600'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownRight className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-[11px] text-ink/50">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold font-mono ${
                    isCredit ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isCredit ? '+' : ''}{tx.amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

