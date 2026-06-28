// /components/notifications/NotificationList.tsx

'use client';

import { BellRing, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationList() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full flex flex-col min-h-screen bg-[#FAF9F7]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E6E1] bg-white sticky top-0 z-30">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl italic font-bold text-[#1A1A1A]">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-[10px] text-red-500 font-mono mt-0.5">
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E6E1] text-[10px] uppercase font-bold text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F0EDE9] transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#F0EDE9] text-[#1A1A1A]/20 mb-4">
              <BellRing className="w-8 h-8" />
            </div>
            <h3 className="font-['Playfair_Display'] text-lg italic text-[#1A1A1A] mb-1">
              All Quiet Here
            </h3>
            <p className="text-xs text-[#1A1A1A]/40 max-w-xs leading-relaxed font-thin">
              You don&apos;t have any notifications at the moment. We&apos;ll alert you here when new events happen.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
