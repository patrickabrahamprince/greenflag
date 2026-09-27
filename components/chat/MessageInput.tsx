import { Loader2, Send } from 'lucide-react';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
}

export function MessageInput({ input, onInputChange, onSend, sending }: MessageInputProps) {
  return (
    <div className="px-4 py-3 pb-safe-bottom bg-base/80 backdrop-blur-2xl border-t border-white/10">
      <div className="bg-white/[0.08] border border-white/15 backdrop-blur-xl rounded-full flex items-center gap-2 pl-4 pr-1.5 py-1.5 shadow-inner">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus:outline-none text-sm py-1.5"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          aria-label="Send"
          className="w-10 h-10 rounded-full bg-emerald hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-glow-emerald"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4 text-black ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

