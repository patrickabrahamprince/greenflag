import { Users } from 'lucide-react';

export function EmptyConnectionsState() {
  return (
    <div className="empty-state py-16">
      <div className="empty-state-icon">
        <Users className="w-8 h-8" />
      </div>
      <p className="text-muted text-sm">No connections yet</p>
    </div>
  );
}
