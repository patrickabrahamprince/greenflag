import { Coins } from 'lucide-react';

interface CoinTx {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export interface UserCoinHistoryProps {
  transactions: CoinTx[];
  currentBalance: number;
}

export function UserCoinHistory({ transactions, currentBalance }: UserCoinHistoryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#C9A961]" />
          <h3 className="text-sm font-medium text-gray-900">Coin History</h3>
        </div>
        <span className="text-xs text-[#C9A961] font-medium">Balance: {currentBalance}</span>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-4">No transactions</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="text-xs text-gray-900 truncate">{tx.description || tx.type}</p>
                <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ml-2 ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
