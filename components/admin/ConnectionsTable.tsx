import type { ConnectionRow } from './types';

export interface ConnectionsTableProps {
  connections: ConnectionRow[];
  onForceEnd: (id: string) => void;
}

export function ConnectionsTable({ connections, onForceEnd }: ConnectionsTableProps) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'chat_unlocked': return 'text-[#D4AF37] bg-[#D4AF37]/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      case 'ended': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-[#8E8E93] bg-white/5';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#8E8E93] text-xs uppercase border-b border-white/10">
            <th className="text-left py-3 px-2">Guest</th>
            <th className="text-left py-3 px-2">Host</th>
            <th className="text-left py-3 px-2">Day</th>
            <th className="text-left py-3 px-2">Tasks</th>
            <th className="text-left py-3 px-2 hidden md:table-cell">Started</th>
            <th className="text-left py-3 px-2">Expires</th>
            <th className="text-left py-3 px-2">Status</th>
            <th className="text-right py-3 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn) => (
            <tr key={conn.id} className="border-b border-white/5">
              <td className="py-3 px-2 text-[#EDEADE] font-medium text-xs">{conn.guest}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs">{conn.host}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs">{conn.currentDay}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs">{conn.tasks}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs hidden md:table-cell">{conn.startedAt}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs">{conn.expires}</td>
              <td className="py-3 px-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(conn.status)}`}>
                  {conn.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-1 justify-end">
                  {conn.status === 'active' && (
                    <button onClick={() => onForceEnd(conn.id)} className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1">
                      Force End
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
