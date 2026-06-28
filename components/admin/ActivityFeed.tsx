import { ScrollText } from 'lucide-react';
import type { AuditLogEntry } from './types';

export interface ActivityFeedProps {
  entries: AuditLogEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-4 h-4 text-[#8E8E93]" />
        <h2 className="text-sm font-medium text-[#EDEADE] uppercase tracking-wide">Recent Activity</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-[#5A5A5D] text-xs text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A961] mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#EDEADE]">
                  <span className="font-medium">{entry.admin_email || 'System'}</span>{' '}
                  <span className="text-[#8E8E93]">{entry.action.replace(/_/g, ' ')}</span>{' '}
                  {entry.target && <span className="text-[#C9A961] font-mono text-[10px]">{entry.target.slice(0, 8)}...</span>}
                </p>
                <p className="text-[10px] text-[#5A5A5D] mt-0.5">
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
