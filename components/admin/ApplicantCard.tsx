import { ChevronRight } from 'lucide-react';
import type { MappedConnection } from './types';

export interface ApplicantCardProps {
  connection: MappedConnection;
}

export function ApplicantCard({ connection }: ApplicantCardProps) {
  return (
    <div className="card flex items-center gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0">
        <span className="text-sm font-medium text-white">{connection.guest_name?.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{connection.guest_name}</p>
        <p className="text-sm text-muted">{connection.guest_age} &middot; {connection.guest_city}</p>
      </div>
      <span className="text-xs text-gold">Pending</span>
      <ChevronRight className="w-5 h-5 text-muted" />
    </div>
  );
}
