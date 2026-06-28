// /components/chat/MessageBubble.tsx

import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isAudio = message.type === 'audio';

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] p-4 rounded-xl shadow-sm transition-all ${
          isOwn
            ? 'bg-[#C9A961] text-white rounded-br-none'
            : 'bg-white border border-[#E8E6E1] text-[#1A1A1A] rounded-bl-none'
        }`}
      >
        {isAudio && message.audio_url ? (
          <div className="flex flex-col gap-1">
            <audio
              controls
              src={message.audio_url}
              className={`w-full max-w-[240px] h-8 rounded-lg filter ${
                isOwn ? 'brightness-95 invert' : ''
              }`}
              preload="metadata"
            />
            <span className={`text-[10px] text-right mt-1 ${isOwn ? 'text-white/70' : 'text-ink/50'}`}>
              Voice Note
            </span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-[9px] ${isOwn ? 'text-white/60' : 'text-ink/40'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <span className="text-[9px] text-white/60">
              {message.read_at ? '• Read' : '• Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
