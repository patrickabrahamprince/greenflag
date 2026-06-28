import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
}

export function MessageInput({ input, onInputChange, onSend, sending }: MessageInputProps) {
  return (
    <div className="p-4" style={{ borderTop: '1px solid #1E1E1E' }}>
      <div className="flex items-center gap-2">
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
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #009624, #00C853)' }}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Send className="w-4 h-4 text-black" />
          )}
        </button>
      </div>
    </div>
  );
}
