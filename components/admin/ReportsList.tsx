import type { AdminReport } from './types';

export interface ReportsListProps {
  reports: AdminReport[];
  onBanUser: (id: string, reason: string) => void;
  onDeleteReport: (id: string) => void;
}

export function ReportsList({ reports, onBanUser, onDeleteReport }: ReportsListProps) {
  if (reports.length === 0) {
    return <div className="text-gray-500 text-center py-8">No reports</div>;
  }

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-red-400 font-medium">{r.reporter?.name || 'Unknown'}</span>
              <span className="text-gray-500 mx-2">reported</span>
              <span className="text-gray-900 font-medium">{r.reported?.name || 'Unknown'}</span>
            </div>
            <span className="text-gray-500 text-xs">
              {new Date(r.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">{r.reason || 'No reason provided'}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onBanUser(r.reported_id!, `Report: ${r.reason}`)}
              className="px-3 py-1 bg-red-600 text-xs rounded hover:bg-red-700"
            >
              Ban User
            </button>
            <button
              onClick={() => onDeleteReport(r.id)}
              className="px-3 py-1 bg-gray-50 text-xs rounded hover:bg-gray-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
