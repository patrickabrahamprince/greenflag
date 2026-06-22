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
          'max-w-[80%] rounded-2xl px-4 py-2.5 animate-fade-in',
          isOwn ? 'rounded-br-md' : 'rounded-bl-md'
        )}
        style={{
          background: isOwn ? '#FFFFFF' : '#1C1C1E',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: isOwn ? '#0A0A0A' : '#EDEADE' }}>{message.content}</p>
        <p className="text-[10px] mt-1 text-right" style={{ color: isOwn ? '#8E8E93' : '#8E8E93' }}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
