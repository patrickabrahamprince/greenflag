import { cn } from '@/lib/utils';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Outgoing = Mindaro + dark text, incoming = card/plum + white text,
          per the design system -- was two near-identical shades of gray
          with no color distinction at all. The corner nearest the author
          (bottom-right for outgoing, bottom-left for incoming) tucks to a
          smaller radius, matching the deck's bubble shape. */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-5 py-3 animate-fade-in',
          isOwn ? 'bg-gold text-ink-dark ml-auto rounded-br-md' : 'bg-card text-ink rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn('text-[10px] mt-1 text-right', isOwn ? 'text-ink-dark/60' : 'text-ink/40')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
