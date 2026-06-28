// /components/notifications/NotificationItem.tsx

import { useRouter } from 'next/navigation';
import { MessageCircle, Heart, Coins, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => Promise<void> | void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();

  const Icon = {
    message: MessageCircle,
    match: Heart,
    coin_purchase: Coins,
    system: Info,
  }[notification.type] || Info;

  const colorClass = {
    message: 'text-[#C9A961] bg-[#C9A961]/10',
    match: 'text-red-500 bg-red-50',
    coin_purchase: 'text-green-600 bg-green-50',
    system: 'text-blue-500 bg-blue-50',
  }[notification.type] || 'text-[#1A1A1A] bg-[#F0EDE9]';

  const handleClick = async () => {
    if (!notification.read_at) {
      await onRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const isUnread = !notification.read_at;

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-[#E8E6E1] transition-all cursor-pointer flex gap-3 items-start ${
        isUnread ? 'bg-[#F5F1E8]' : 'bg-[#FAF9F7] hover:bg-[#F0EDE9]'
      }`}
    >
      <div className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <h4 className={`text-xs ${isUnread ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#1A1A1A]/80'} truncate`}>
            {notification.title}
          </h4>
          <span className="text-[9px] text-[#1A1A1A]/40 whitespace-nowrap ml-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        {notification.body && (
          <p className={`text-[11px] leading-relaxed line-clamp-2 ${isUnread ? 'text-[#1A1A1A]/80 font-medium' : 'text-[#1A1A1A]/50 font-normal'}`}>
            {notification.body}
          </p>
        )}
      </div>
    </div>
  );
}
