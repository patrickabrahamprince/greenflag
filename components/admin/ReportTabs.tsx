import type { Tab } from './types';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'actioned', label: 'Actioned' },
  { key: 'dismissed', label: 'Dismissed' },
];

export interface ReportTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function ReportTabs({ activeTab, onTabChange }: ReportTabsProps) {
  return (
    <div className="flex gap-1 bg-[#0A0A0A] rounded-xl p-1 border border-white/10 mb-6 overflow-x-auto">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 text-sm font-medium rounded-lg px-3 py-2 transition-all whitespace-nowrap ${
            activeTab === t.key
              ? 'bg-[#C9A961] text-black'
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
