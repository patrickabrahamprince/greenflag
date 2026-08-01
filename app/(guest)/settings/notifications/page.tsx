'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="pr-4">
        <p className="text-sm text-ink font-medium">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full shrink-0 transition-colors ${value ? 'bg-gold' : 'bg-surface-light'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// Settings -> Notifications, split into its own page instead of a flat
// 3-toggle list embedded in main Settings -- matches the grouped
// "New Activity / Daily recap / Other" sectioning from the reference set.
export default function NotificationSettingsPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(true);
  const [matches, setMatches] = useState(true);
  const [nudges, setNudges] = useState(true);
  const [dailyRecap, setDailyRecap] = useState(true);
  const [other, setOther] = useState(true);

  return (
    <div className="page-container animate-fade-in pb-32">
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl text-ink flex-1">Notifications</h1>
      </div>

      <div className="px-4 space-y-6">
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-widest mb-2 px-1">New Activity</p>
          <div className="card divide-y divide-[#2A2A2A]">
            <ToggleRow label="Messages" value={messages} onChange={setMessages} />
            <ToggleRow label="Matches" value={matches} onChange={setMatches} />
            <ToggleRow label="Nudges" value={nudges} onChange={setNudges} />
          </div>
        </div>

        <div>
          <div className="card">
            <ToggleRow
              label="Daily recap"
              description="A daily summary of your activity"
              value={dailyRecap}
              onChange={setDailyRecap}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <ToggleRow
              label="Other notifications"
              description="Product updates and occasional tips"
              value={other}
              onChange={setOther}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
