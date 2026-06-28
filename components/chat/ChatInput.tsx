// /components/chat/ChatInput.tsx

import { useState, useRef } from 'react';
import { Mic, Send, Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useWallet } from '@/hooks/useWallet';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { sendMessage } from '@/lib/supabase/chat';
import { BuyCoinsModal } from './BuyCoinsModal';

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const supabase = createClientComponentClient();

  const { balance, deductCoins, loading: loadingWallet } = useWallet();
  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    start: startRecording,
    stop: stopRecording,
    reset: resetRecording,
  } = useAudioRecorder();

  const handleSendText = async () => {
    if (!text.trim() || sending) return;

    if (balance < 1) {
      setShowBuyModal(true);
      return;
    }

    setSending(true);
    try {
      const success = await deductCoins(1, `Sent chat message in conversation ${conversationId}`);
      if (!success) {
        toast.error('Transaction failed. Failed to deduct coins.');
        setSending(false);
        return;
      }

      await sendMessage(conversationId, text.trim(), 'text');
      setText('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendAudio = async () => {
    if (!audioBlob || sending) return;

    if (balance < 1) {
      setShowBuyModal(true);
      return;
    }

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required.');
        setSending(false);
        return;
      }

      const success = await deductCoins(1, `Sent audio message in conversation ${conversationId}`);
      if (!success) {
        toast.error('Transaction failed. Failed to deduct coins.');
        setSending(false);
        return;
      }

      const filePath = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new Error(`Storage upload error: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from('voice-messages').getPublicUrl(filePath);
      const url = data.publicUrl;

      await sendMessage(conversationId, null, 'audio', url);
      resetRecording();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send audio message');
    } finally {
      setSending(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (err: any) {
        toast.error(err.message || 'Microphone access failed');
      }
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-[#E8E6E1] sticky bottom-0 z-40">
      <div className="flex flex-col gap-2">
        {/* Recording active state */}
        {isRecording && (
          <div className="flex items-center justify-between px-3 py-2 bg-red-50 text-red-600 rounded-lg animate-pulse text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Recording voice note: {duration}s
            </span>
            <button
              onClick={resetRecording}
              className="text-[10px] uppercase font-bold text-red-600 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Audio review/ready to send state */}
        {!isRecording && audioBlob && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#F0EDE9] rounded-lg text-xs">
            <span className="text-[#1A1A1A]/70">Voice note ready</span>
            <div className="flex items-center gap-3">
              <button
                onClick={resetRecording}
                className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 underline"
              >
                Discard
              </button>
              <button
                onClick={handleSendAudio}
                disabled={sending}
                className="text-[10px] uppercase font-bold text-[#C9A961] underline flex items-center gap-1"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Note (1 coin)'}
              </button>
            </div>
          </div>
        )}

        {/* Standard text inputs/controls */}
        {!audioBlob && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleMicClick}
              disabled={sending}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-[#F0EDE9] text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={text}
              disabled={isRecording || sending}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder={isRecording ? 'Recording...' : 'Type a message...'}
              className="flex-1 px-4 py-2.5 bg-[#F0EDE9] text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none focus:ring-1 focus:ring-[#C9A961] disabled:opacity-50"
            />

            <button
              onClick={handleSendText}
              disabled={!text.trim() || isRecording || sending}
              className="p-2.5 rounded-full bg-[#C9A961] text-white hover:bg-[#B89851] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-all active:scale-95"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-[#1A1A1A]/40 px-1 font-mono">
          <span>Wallet Balance: {loadingWallet ? '...' : `${balance} coins`}</span>
          <span>Costs 1 coin per message</span>
        </div>
      </div>

      <BuyCoinsModal open={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  );
}
