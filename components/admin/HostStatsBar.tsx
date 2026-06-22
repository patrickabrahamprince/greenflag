export interface HostStatsBarProps {
  applicants: number;
  inProgress: number;
  completed: number;
}

export function HostStatsBar({ applicants, inProgress, completed }: HostStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="card text-center">
        <p className="text-2xl font-bold text-gold">{applicants}</p>
        <p className="text-xs text-muted mt-1">Applicants</p>
      </div>
      <div className="card text-center">
        <p className="text-2xl font-bold text-white">{inProgress}</p>
        <p className="text-xs text-muted mt-1">In Progress</p>
      </div>
      <div className="card text-center">
        <p className="text-2xl font-bold text-white">{completed}</p>
        <p className="text-xs text-muted mt-1">Connected</p>
      </div>
    </div>
  );
}
