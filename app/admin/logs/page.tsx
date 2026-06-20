'use client';

import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LogEntry {
  id: string;
  admin: string;
  action: string;
  target: string;
  time: string;
}

const ACTIONS = ['all', 'approve_submission', 'reject_submission', 'ban_user', 'unban_user', 'force_complete', 'force_fail', 'extend_connection', 'delete_standard'];

export default function AdminLogs() {
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data.map((log: any) => ({
          id: log.id,
          admin: log.admin_email || 'system',
          action: log.action,
          target: log.target || '',
          time: new Date(log.created_at).toLocaleString(),
        })));
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.action === filter);

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

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state py-16">
          <div className="empty-state-icon">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No logs available</h3>
          <p className="text-muted text-sm">Audit logs will appear here once admin actions are recorded.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
