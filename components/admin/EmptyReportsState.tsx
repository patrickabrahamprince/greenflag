import { Flag } from 'lucide-react';
import type { Tab } from './types';

export interface EmptyReportsStateProps {
  tab: Tab;
}

export function EmptyReportsState({ tab }: EmptyReportsStateProps) {
  return (
    <div className="card py-16 text-center">
      <Flag className="w-8 h-8 text-[#8E8E93] mx-auto mb-3" />
      <p className="text-[#8E8E93] text-sm">No {tab} reports</p>
    </div>
  );
}
