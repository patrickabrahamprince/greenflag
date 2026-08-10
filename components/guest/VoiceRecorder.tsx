import { useState } from 'react';
import { Mic, Music, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecord: (url: string) => void;
}

export function VoiceRecorder({ onRecord }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecorded(true);
      onRecord('voice://recording');
    } else {
      setIsRecording(true);
    }
  };

  if (recorded) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
            <Music className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm text-ink font-medium">Voice note recorded</p>
            <p className="text-xs text-muted font-thin">0:24</p>
          </div>
        </div>
        <Check className="w-5 h-5 text-gold" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <button
        onClick={handleToggleRecording}
        className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-out',
          isRecording ? 'animate-pulse' : ''
        )}
        style={{
          background: isRecording ? 'rgba(239,68,68,0.15)' : '#1B103B',
          border: isRecording ? '2px solid rgba(239,68,68,0.4)' : '1px solid #4A2A8C',
        }}
      >
        <Mic className={cn('w-8 h-8', isRecording ? 'text-red-500' : 'text-gold')} />
      </button>
      <p className="text-sm text-muted font-thin">
        {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
      </p>
      <div className="w-full max-w-xs">
        <div className="h-12 rounded-xl flex items-center justify-center gap-1 px-4" style={{ background: '#1B103B' }}>
          {isRecording && Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-0.5 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, background: 'rgba(215,255,129,0.6)', animationDelay: `${i * 0.05}s` }} />
          ))}
          {!isRecording && !recorded && <span className="text-xs text-muted font-thin">Waveform preview</span>}
        </div>
      </div>
    </div>
  );
}
