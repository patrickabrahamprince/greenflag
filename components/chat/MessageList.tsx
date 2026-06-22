import type { Ref } from 'react';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const grouped: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const msgDate = formatDateSeparator(msg.created_at);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      grouped.push({ date: msgDate, messages: [] });
    }
    grouped[grouped.length - 1].messages.push(msg);
  }
  return grouped;
}

interface MessageListProps {
  messages: Message[];
  userId: string | undefined;
  bottomRef: Ref<HTMLDivElement>;
}

export function MessageList({ messages, userId, bottomRef }: MessageListProps) {
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
            <span className="text-[10px] text-muted/60 uppercase tracking-widest-xl font-thin">{group.date}</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
          </div>
          {group.messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.sender_id === userId} />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
