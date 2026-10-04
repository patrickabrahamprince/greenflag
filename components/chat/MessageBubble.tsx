import { cn } from '@/lib/utils';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5 shadow-2xs animate-fade-in transition-all',
          isOwn
            ? 'bg-[#1C1C1E] text-white ml-auto rounded-br-sm shadow-xs border border-stone-800'
            : 'bg-[#F4F4F5] border border-stone-200 text-[#1C1C1E] rounded-bl-sm'
        )}
      >
        <p className="text-[14px] leading-relaxed break-words font-medium">{message.content}</p>
        <p className={cn('text-[10px] mt-1 text-right font-medium', isOwn ? 'text-white/60' : 'text-stone-400')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
