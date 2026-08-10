'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PushPermission } from '@/components/shared/PushPermission';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';

interface Prefs {
  messages: boolean;
  matches: boolean;
  nudges: boolean;
  dailyRecap: boolean;
  other: boolean;
}

type PrefKey = keyof Prefs;

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, value, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="pr-4">
        <p className="text-sm text-ink font-medium">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full shrink-0 transition-colors disabled:opacity-50 ${value ? 'bg-gold' : 'bg-surface-light'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// Settings -> Notifications, split into its own page instead of a flat
// 3-toggle list embedded in main Settings -- matches the grouped
// "New Activity / Daily recap / Other" sectioning from the reference set.
//
// These toggles used to be pure local useState with no backend at all --
// flipping one did nothing and reset on reload. They now read/write
// profiles.push_prefs via /api/notifications/prefs, and lib/notifications.ts
// checks the same prefs before sending a push (the in-app notification row
// itself always still gets created either way).
export default function NotificationSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState<PrefKey | null>(null);

  const loadPrefs = () => {
    return fetch('/api/notifications/prefs')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setPrefs(data.prefs))
      .catch(() => { toast.error('Failed to load notification settings'); });
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(loadPrefs);

  const handleToggle = async (key: PrefKey, value: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, [key]: value });
    setSaving(key);
    try {
      const res = await fetch('/api/notifications/prefs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPrefs(prev);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="h-[calc(100dvh-5rem)] screen-gradient flex flex-col">
      <div className="max-w-app mx-auto w-full px-8 pt-safe-top">
        <div className="page-header">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl text-ink flex-1">Notifications</h1>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto overscroll-none max-w-app mx-auto w-full px-8 pb-32 animate-fade-in"
      >
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <Loader2 className={`w-5 h-5 text-gold ${refreshing || pullDistance > 60 ? 'animate-spin' : ''}`} />
        </div>

      <div className="px-4 space-y-6">
        <div className="card flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink font-medium">Push notifications</p>
            <p className="text-xs text-muted mt-0.5">Get alerted even when the app is closed</p>
          </div>
          <PushPermission />
        </div>

        {!prefs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-ink/40 uppercase tracking-widest mb-2 px-1">New Activity</p>
              <div className="card divide-y divide-raised">
                <ToggleRow
                  label="Messages"
                  value={prefs.messages}
                  onChange={(v) => handleToggle('messages', v)}
                  disabled={saving === 'messages'}
                />
                <ToggleRow
                  label="Matches"
                  value={prefs.matches}
                  onChange={(v) => handleToggle('matches', v)}
                  disabled={saving === 'matches'}
                />
                <ToggleRow
                  label="Nudges"
                  value={prefs.nudges}
                  onChange={(v) => handleToggle('nudges', v)}
                  disabled={saving === 'nudges'}
                />
              </div>
            </div>

            <div>
              <div className="card">
                <ToggleRow
                  label="Daily recap"
                  description="A daily summary of your activity"
                  value={prefs.dailyRecap}
                  onChange={(v) => handleToggle('dailyRecap', v)}
                  disabled={saving === 'dailyRecap'}
                />
              </div>
            </div>

            <div>
              <div className="card">
                <ToggleRow
                  label="Other notifications"
                  description="Product updates and occasional tips"
                  value={prefs.other}
                  onChange={(v) => handleToggle('other', v)}
                  disabled={saving === 'other'}
                />
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
