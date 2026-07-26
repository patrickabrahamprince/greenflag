import { Loader2 } from 'lucide-react';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
}

export function MessageInput({ input, onInputChange, onSend, sending }: MessageInputProps) {
  return (
    <div className="px-8 py-4 border-t border-[#2A2A2A]">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message..."
          className="input flex-1"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          className="text-gold font-semibold uppercase text-xs tracking-wide disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
        </button>
      </div>
    </div>
  );
}
