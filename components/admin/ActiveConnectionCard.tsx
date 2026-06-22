import type { MappedConnection } from './types';

export interface ActiveConnectionCardProps {
  connection: MappedConnection;
}

export function ActiveConnectionCard({ connection }: ActiveConnectionCardProps) {
  const total = 8;
  const progress = connection.tasks_completed;
  const pct = Math.round((progress / total) * 100);

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-surface-light flex items-center justify-center text-muted shrink-0">
          <span className="text-sm font-medium text-white">{connection.guest_name?.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white">{connection.guest_name}, {connection.guest_age}</p>
          <p className="text-sm text-muted">{connection.guest_city} &middot; Day {Math.min(progress + 1, 8)} of 8</p>
        </div>
        <span className="text-xs font-medium text-gold">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
