import type { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  accent?: string;
  subtitle?: string;
  dataTestId?: string;
}

export function KpiCard({ label, value, icon: Icon, accent, subtitle, dataTestId }: KpiCardProps) {
  return (
    <div data-testid={dataTestId || 'stats-card'} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
      {accent && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: accent }} />
      )}
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={`w-4 h-4 ${accent || 'text-[#8E8E93]'}`} />}
        <p className="text-[#8E8E93] text-xs tracking-wide uppercase">{label}</p>
      </div>
      <p className="text-3xl font-display text-[#EDEADE] tracking-tight">{value}</p>
      {subtitle && <p className="text-[10px] text-[#5A5A5D] mt-1">{subtitle}</p>}
    </div>
  );
}
