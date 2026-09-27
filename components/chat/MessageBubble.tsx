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
          'max-w-[78%] rounded-2xl px-4.5 py-3 shadow-md animate-fade-in transition-all',
          isOwn
            ? 'bg-gradient-to-br from-emerald to-emerald-600 text-white ml-auto rounded-br-sm shadow-glow-emerald border border-emerald-400/30'
            : 'bg-white/[0.07] border border-white/10 text-white rounded-bl-sm backdrop-blur-xl'
        )}
      >
        <p className="text-[14px] leading-relaxed break-words">{message.content}</p>
        <p className={cn('text-[10px] mt-1.5 text-right font-medium', isOwn ? 'text-white/70' : 'text-white/40')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

