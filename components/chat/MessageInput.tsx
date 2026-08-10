import { Loader2, Send } from 'lucide-react';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
}

// Single plum pill holding the field and a round send button, per the
// design system -- was a bordered strip with an underline-style input
// and a plain text "Send" label. No attach glyph: this app has no
// message-attachment feature to wire one to, so it's skipped rather
// than added as a fake affordance.
export function MessageInput({ input, onInputChange, onSend, sending }: MessageInputProps) {
  return (
    <div className="px-4 py-3 pb-safe-bottom">
      <div className="bg-card rounded-pill flex items-center gap-2 pl-5 pr-2 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-0 text-ink placeholder:text-ink/40 focus:outline-none text-sm py-1.5"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          aria-label="Send"
          className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin text-ink-dark" /> : <Send className="w-4 h-4 text-ink-dark" />}
        </button>
      </div>
    </div>
  );
}
