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
          'max-w-[80%] rounded-none px-5 py-3 animate-fade-in',
          isOwn ? 'bg-[#1A1A1A] text-white ml-auto' : 'bg-[#F0EDE9] text-ink'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn('text-[10px] mt-1 text-right', isOwn ? 'text-white/50' : 'text-ink/40')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
