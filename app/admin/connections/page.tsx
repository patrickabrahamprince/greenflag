'use client';

import { Eye } from 'lucide-react';

const MOCK_CONNECTIONS = [
  { id: '1', guest: 'Rahul S.', host: 'Ananya G.', day: 3, tasks: '3/8', expires: '2d 4h', status: 'active' },
  { id: '2', guest: 'Priya M.', host: 'Ishita V.', day: 5, tasks: '5/8', expires: '1d 2h', status: 'active' },
  { id: '3', guest: 'Amit K.', host: 'Arjun N.', day: 7, tasks: '7/8', expires: '6h', status: 'chat_unlocked' },
  { id: '4', guest: 'Neha J.', host: 'Vivaan K.', day: 2, tasks: '2/8', expires: '4d 8h', status: 'active' },
  { id: '5', guest: 'Vikram P.', host: 'Ananya G.', day: 1, tasks: '1/8', expires: '5d 12h', status: 'active' },
  { id: '6', guest: 'Sara K.', host: 'Arjun N.', day: 8, tasks: '8/8', expires: 'Completed', status: 'completed' },
  { id: '7', guest: 'Karan S.', host: 'Ishita V.', day: 4, tasks: '2/8', expires: '3d', status: 'active' },
  { id: '8', guest: 'Diya M.', host: 'Vivaan K.', day: 6, tasks: '4/8', expires: 'Expired', status: 'expired' },
];

export default function AdminConnections() {
  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'chat_unlocked': return 'text-gold bg-gold/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted bg-surface-light';
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display text-white mb-6">Connections</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase border-b border-border">
              <th className="text-left py-3 px-2">Guest</th>
              <th className="text-left py-3 px-2">Host</th>
              <th className="text-left py-3 px-2">Day</th>
              <th className="text-left py-3 px-2">Tasks</th>
              <th className="text-left py-3 px-2">Expires</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONNECTIONS.map((conn) => (
              <tr key={conn.id} className="border-b border-border/50">
                <td className="py-3 px-2 text-white font-medium">{conn.guest}</td>
                <td className="py-3 px-2 text-muted">{conn.host}</td>
                <td className="py-3 px-2 text-muted">{conn.day}</td>
                <td className="py-3 px-2 text-muted">{conn.tasks}</td>
                <td className="py-3 px-2 text-muted">{conn.expires}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(conn.status)}`}>
                    {conn.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1 justify-end">
                    <button className="btn-ghost text-xs p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost text-[10px] text-green-500">Complete</button>
                    <button className="btn-ghost text-[10px] text-red-500">Fail</button>
                    <button className="btn-ghost text-[10px] text-gold">Extend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
