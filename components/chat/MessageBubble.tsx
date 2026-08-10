import { cn } from '@/lib/utils';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Outgoing = Crimson + white text, incoming = card + white text --
          Crimson is dark/saturated, unlike Dateasy's light Mindaro which
          needed dark text here instead. The corner nearest the author
          (bottom-right for outgoing, bottom-left for incoming) tucks to a
          smaller radius. */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-5 py-3 animate-fade-in',
          isOwn ? 'bg-gold text-ink ml-auto rounded-br-md' : 'bg-card text-ink rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn('text-[10px] mt-1 text-right', isOwn ? 'text-ink/60' : 'text-ink/40')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
