import { useRouter } from 'next/navigation';
import { Flag, CheckCircle, Ban, Eye, Loader2 } from 'lucide-react';
import type { Report } from './types';

export interface ReportCardProps {
  report: Report;
  showActions: boolean;
  onStatusChange: (id: number, status: string) => void;
  onBanUser: (userId: string) => void;
  acting: boolean;
}

export function ReportCard({ report: r, showActions, onStatusChange, onBanUser, acting }: ReportCardProps) {
  const router = useRouter();

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-900">Report #{r.id}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 capitalize">
              {r.reason}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            <button onClick={() => router.push(`/profile/${r.reporter_id}`)} className="hover:text-gray-900">
              {r.reporter.name || r.reporter.email}
            </button>
            {' reported '}
            <button onClick={() => router.push(`/profile/${r.reported_id}`)} className="hover:text-gray-900">
              {r.reported.name || r.reported.email}
            </button>
          </p>
          {r.details && <p className="text-xs text-gray-500 mt-1">{r.details}</p>}
          <p className="text-[10px] text-gray-500 mt-1">
            {new Date(r.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/profile/${r.reported_id}`)}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> View Profile
          </button>
          <button
            onClick={() => onStatusChange(r.id, 'dismissed')}
            disabled={acting}
            className="btn-ghost text-xs flex items-center gap-1 text-green-400 disabled:opacity-40"
          >
            {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Dismiss
          </button>
          <button
            onClick={() => onBanUser(r.reported_id)}
            disabled={acting}
            className="btn-ghost text-xs flex items-center gap-1 text-red-400 disabled:opacity-40"
          >
            {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} Ban User
          </button>
          <button
            onClick={() => onStatusChange(r.id, 'actioned')}
            disabled={acting}
            className="btn-ghost text-xs flex items-center gap-1 text-blue-600 disabled:opacity-40"
          >
            {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />} Mark Actioned
          </button>
        </div>
      )}
    </div>
  );
}
