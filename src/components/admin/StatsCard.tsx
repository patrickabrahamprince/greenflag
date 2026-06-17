export default function StatsCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
}) {
  return (
    <div className="rounded-[20px] bg-surface border-[0.5px] border-border p-5 space-y-3">
      <div className={`w-10 h-10 rounded-[12px] bg-${color}-500/10 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[28px] font-display font-bold tracking-[-0.02em]">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
        {sub && <p className="text-[10px] text-text-muted/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
