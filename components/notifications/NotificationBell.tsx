// /components/notifications/NotificationBell.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors rounded-full hover:bg-[#F0EDE9]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[80vh] overflow-y-auto bg-[#FAF9F7] border border-[#E8E6E1] shadow-xl z-50 flex flex-col animate-scale-in fixed md:absolute top-16 right-4 left-4 md:left-auto md:top-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E6E1]">
            <h3 className="font-['Playfair_Display'] text-sm italic font-bold text-[#1A1A1A]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] uppercase font-bold text-[#C9A961] hover:text-[#B89851] flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[320px]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-xs text-[#1A1A1A]/40 font-mono">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-white border-t border-[#E8E6E1] text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] uppercase font-bold text-[#1A1A1A]/60 hover:text-[#1A1A1A] tracking-wider transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
