'use client';

import { Bell, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEnableNotifications } from '@/lib/hooks/useEnableNotifications';

export function PushPermission() {
  const { enabled, checked, loading, enable } = useEnableNotifications();

  const handleEnable = async () => {
    try {
      const granted = await enable();
      toast[granted ? 'success' : 'error'](granted ? 'Push notifications enabled' : 'Notification permission denied');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong enabling notifications');
    }
  };

  if (!checked) return null;

  return (
    <button
      onClick={handleEnable}
      disabled={loading || enabled}
      className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Check className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {enabled ? 'Notifications enabled' : 'Enable notifications'}
    </button>
  );
}
