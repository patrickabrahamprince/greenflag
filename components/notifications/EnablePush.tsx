// /components/notifications/EnablePush.tsx

'use client';

import { useState, useEffect } from 'react';
import { BellRing, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeUser } from '@/lib/webpush';

export function EnablePush() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications are not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const sub = await subscribeUser();
        if (sub) {
          toast.success('Push notifications enabled successfully!');
        } else {
          toast.error('Failed to configure push service registration.');
        }
      } else if (result === 'denied') {
        // Fail silently per constraint
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while enabling notifications');
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'granted') {
    return (
      <div className="p-4 border border-green-200 bg-green-50/50 flex items-center justify-between text-xs text-green-800">
        <span>✓ Push notifications are active.</span>
      </div>
    );
  }

  return (
    <div className="p-4 border border-[#E8E6E1] bg-white flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-[#C9A961]/10 text-[#C9A961] flex-shrink-0">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#1A1A1A]">Stay Updated</h4>
          <p className="text-[10px] text-[#1A1A1A]/50 leading-relaxed font-thin mt-0.5">
            Enable instant browser notifications to get alerted immediately when you receive new matches or chat messages.
          </p>
        </div>
      </div>

      <button
        onClick={handleEnablePush}
        disabled={loading}
        className="w-full py-2 bg-[#C9A961] text-white hover:bg-[#B89851] text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enabling...
          </>
        ) : (
          'Enable Push Notifications'
        )}
      </button>
    </div>
  );
}
