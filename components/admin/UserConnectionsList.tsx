import { Link2 } from 'lucide-react';

interface UserConnection {
  id: string;
  status: string;
  current_day: number;
  tasks_completed: number;
  started_at: string;
  expires_at: string | null;
  guest_name?: string;
  host_name?: string;
}

export interface UserConnectionsListProps {
  connections: UserConnection[];
  userId: string;
}

export function UserConnectionsList({ connections, userId }: UserConnectionsListProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'completed': return 'text-blue-400 bg-blue-500/10';
      case 'expired': return 'text-red-400 bg-red-500/10';
      default: return 'text-[#8E8E93] bg-white/5';
    }
  };

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-4 h-4 text-[#8E8E93]" />
        <h3 className="text-sm font-medium text-[#EDEADE]">Connections</h3>
        <span className="text-[10px] text-[#5A5A5D] ml-auto">{connections.length} total</span>
      </div>

      {connections.length === 0 ? (
        <p className="text-[#5A5A5D] text-xs text-center py-4">No connections</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {connections.map((c) => {
            const otherName = c.guest_name || c.host_name || 'Unknown';
            return (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="min-w-0">
                  <p className="text-xs text-[#EDEADE] truncate">{otherName}</p>
                  <p className="text-[10px] text-[#5A5A5D]">Day {c.current_day || c.tasks_completed + 1} · Started {new Date(c.started_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
