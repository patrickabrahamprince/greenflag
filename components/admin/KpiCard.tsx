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
    <div data-testid={dataTestId || 'stats-card'} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={`w-4 h-4 ${accent || 'text-gray-400'}`} />}
        <p className="text-gray-500 text-xs tracking-wide uppercase font-medium">{label}</p>
      </div>
      <p className="text-4xl font-semibold text-gray-900 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
