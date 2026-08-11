import { ScrollText } from 'lucide-react';
import type { AuditLogEntry } from './types';

export interface ActivityFeedProps {
  entries: AuditLogEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <ScrollText className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recent Activity</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-900">
                  <span className="font-semibold">{entry.admin_email || 'System'}</span>{' '}
                  <span className="text-gray-500">{entry.action.replace(/_/g, ' ')}</span>{' '}
                  {entry.target && <span className="text-gray-600 font-mono text-[11px]">{entry.target.slice(0, 8)}...</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
