'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

const MOCK_LOGS = [
  { id: '1', admin: 'admin@greenflag.app', action: 'approve_submission', target: 'Submission #123', time: '2024-12-15 14:32' },
  { id: '2', admin: 'mod@greenflag.app', action: 'reject_submission', target: 'Submission #124', time: '2024-12-15 13:15' },
  { id: '3', admin: 'admin@greenflag.app', action: 'ban_user', target: 'User #456', time: '2024-12-15 12:00' },
  { id: '4', admin: 'mod@greenflag.app', action: 'approve_submission', target: 'Submission #125', time: '2024-12-15 11:45' },
  { id: '5', admin: 'admin@greenflag.app', action: 'unban_user', target: 'User #789', time: '2024-12-14 18:30' },
  { id: '6', admin: 'super@greenflag.app', action: 'force_complete', target: 'Connection #321', time: '2024-12-14 16:20' },
  { id: '7', admin: 'admin@greenflag.app', action: 'extend_connection', target: 'Connection #654', time: '2024-12-14 15:10' },
  { id: '8', admin: 'mod@greenflag.app', action: 'reject_submission', target: 'Submission #126', time: '2024-12-14 14:00' },
  { id: '9', admin: 'mod@greenflag.app', action: 'approve_submission', target: 'Submission #127', time: '2024-12-14 12:30' },
  { id: '10', admin: 'admin@greenflag.app', action: 'delete_standard', target: 'Standard #555', time: '2024-12-14 11:00' },
  { id: '11', admin: 'super@greenflag.app', action: 'approve_submission', target: 'Submission #128', time: '2024-12-13 22:15' },
  { id: '12', admin: 'mod@greenflag.app', action: 'ban_user', target: 'User #101', time: '2024-12-13 20:45' },
  { id: '13', admin: 'admin@greenflag.app', action: 'force_fail', target: 'Connection #432', time: '2024-12-13 19:30' },
  { id: '14', admin: 'mod@greenflag.app', action: 'approve_submission', target: 'Submission #129', time: '2024-12-13 18:00' },
  { id: '15', admin: 'super@greenflag.app', action: 'reject_submission', target: 'Submission #130', time: '2024-12-13 16:45' },
];

const ACTIONS = ['all', 'approve_submission', 'reject_submission', 'ban_user', 'unban_user', 'force_complete', 'force_fail', 'extend_connection', 'delete_standard'];

export default function AdminLogs() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? MOCK_LOGS : MOCK_LOGS.filter((l) => l.action === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-white">Audit Trail</h1>
        <button className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="mb-4">
        <select
          className="input max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a === 'all' ? 'All Actions' : a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase border-b border-border">
              <th className="text-left py-3 px-2">Admin</th>
              <th className="text-left py-3 px-2">Action</th>
              <th className="text-left py-3 px-2">Target</th>
              <th className="text-right py-3 px-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border/50">
                <td className="py-3 px-2 text-white font-medium text-xs">{log.admin}</td>
                <td className="py-3 px-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-muted">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-2 text-muted text-xs">{log.target}</td>
                <td className="py-3 px-2 text-muted text-xs text-right">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
